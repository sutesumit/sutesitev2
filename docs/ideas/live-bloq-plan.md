# Implementation Plan: Telegram Live Bloq Sessions

## Overview

Enable live blog sessions via the existing Telegram bot (`src/lib/telegram/bot.ts`). Each text message during an active session becomes a timestamped bullet point on a public ISR page at `/bloq/live/[slug]`. Readers see entries appear via client-side polling without full page reloads. On close, the session graduates to a permanent published record that merges chronologically into the `/bloq` listing and RSS feed.

## Architecture Decisions (Recap)

| Decision | Rationale |
|---|---|
| Supabase `live_bloq_sessions` + `live_bloq_entries` tables | Follows bytes/blips pattern. Same client, same project, zero new deps |
| ISR + client polling (not WebSocket/SSE) | Vercel serverless kills persistent connections. ISR for new readers, polling for existing readers |
| `/bloq/live/[slug]` separate from `/bloq/[slug]` | Avoids making all 36 static MDX posts dynamic. Permanent URL, no redirect after close |
| In-memory session state with cold-start auto-recovery | Simplicity over durability. Cold start restores from `findActiveSession()` on first message. Single global session — one bot operator, one active session at a time |
| RLS: public SELECT only, service role writes | Anon key is public in client JS. RLS is the firewall |
| No MDX file generation in MVP | Deferred. Manual export command for later |

## Test Strategy

- **Small (unit):** Service layer tests with mocked repository + mutation effect. Follow `src/lib/byte/__tests__/service.test.ts` pattern.
- **Small (unit):** Bot handler tests with mocked Grammy `Context`. Follow `src/lib/telegram/__tests__/handlers.test.ts` pattern.
- **Medium (integration):** Repository tests against real Supabase. Gated behind `RUN_SUPABASE_INTEGRATION_TESTS=true`.
- **Large (E2E):** Playwright test: load live page, verify entries render, verify polling appends new entry to DOM.

All tests follow TDD cycle: RED (write failing test) → GREEN (minimal implementation) → REFACTOR (clean up).

---

## Task List

### Phase 1: Foundation

#### Task 1: Database Migration + Types

**Description:** Create Supabase migration for `live_bloq_sessions` and `live_bloq_entries` tables with indexes, RLS policies, the unique constraint on active sessions, and an RPC function for atomic entry insertion. Define TypeScript types.

**Migration SQL includes:**
```sql
-- Tables (full DDL with column types)
CREATE TABLE live_bloq_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'Live',
  authors TEXT[] DEFAULT '{Sumit Sute}',
  summary TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  entry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE live_bloq_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES live_bloq_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, sequence)
);

CREATE INDEX idx_live_entries_session ON live_bloq_entries (session_id, sequence);
CREATE INDEX idx_live_sessions_slug ON live_bloq_sessions (slug);
CREATE UNIQUE INDEX idx_live_sessions_active ON live_bloq_sessions (status) WHERE status = 'active';

-- RLS (unchanged)
ALTER TABLE live_bloq_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_bloq_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_sessions" ON live_bloq_sessions
  FOR SELECT USING (status IN ('active', 'closed'));
CREATE POLICY "public_read_entries" ON live_bloq_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM live_bloq_sessions WHERE id = session_id AND status IN ('active', 'closed'))
  );

-- Atomic entry insert: locks the session row as the counter, enforces active-only writes
CREATE OR REPLACE FUNCTION add_live_entry(
  p_session_id UUID,
  p_content TEXT
) RETURNS TABLE(entry_id UUID, entry_sequence INTEGER, session_slug TEXT) AS $$
DECLARE
  v_next_seq INTEGER;
  v_slug TEXT;
BEGIN
  UPDATE live_bloq_sessions
  SET entry_count = entry_count + 1
  WHERE id = p_session_id AND status = 'active'
  RETURNING entry_count, slug INTO v_next_seq, v_slug;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found or not active';
  END IF;

  RETURN QUERY
  WITH inserted AS (
    INSERT INTO live_bloq_entries (session_id, content, sequence)
    VALUES (p_session_id, p_content, v_next_seq)
    RETURNING id, sequence
  )
  SELECT inserted.id, inserted.sequence, v_slug AS session_slug FROM inserted;
END;
$$ LANGUAGE plpgsql;
```

**Acceptance criteria:**
- [ ] Migration runs successfully via `npx supabase db push`
- [ ] Tables visible in Supabase dashboard with correct columns, indexes, and RLS policies
- [ ] `UNIQUE INDEX` enforces at most one active session
- [ ] `ON DELETE CASCADE` cleans up entries when session is deleted
- [ ] `add_live_entry` RPC function executes atomically (test: insert entry, verify entry_count incremented)
- [ ] `src/lib/live-bloq/types.ts` exports `LiveSession` (with `status: 'active' | 'closed' | 'cancelled'`) and `LiveEntry`

**Verification:**
- [ ] Migration applies without error
- [ ] `supabase_list_tables` shows both tables
- [ ] Types compile: `npx tsc --noEmit`

**Dependencies:** None

**Files touched:**
- `supabase/migrations/012_live_bloq_sessions.sql` (NEW)
- `src/lib/live-bloq/types.ts` (NEW)

**Estimated scope:** XS (2 files, no logic)

---

#### Task 2: Repository Layer

**Description:** Implement Supabase CRUD operations for live sessions and entries. Follow `src/lib/byte/repository.ts` pattern — raw Supabase calls, return data or throw. No business logic, no validation.

**Functions:**
- `createSession(title, slug)` → INSERT `live_bloq_sessions`, returns `LiveSession`
- `addEntry(sessionId, content)` → calls `supabase.rpc('add_live_entry', {p_session_id, p_content})` — RPC locks session row, computes sequence via `entry_count + 1`, enforces `status = 'active'`, returns `{entry_id, entry_sequence, session_slug}`
- `closeSession(sessionId)` → UPDATE status='closed', closed_at=now()
- `cancelSession(sessionId)` → UPDATE status='cancelled' (no publish, no mutation effect)
- `getSessionBySlug(slug)` → SELECT with slug
- `getSessionById(id)` → SELECT with id
- `getEntries(sessionId)` → SELECT entries ORDER BY sequence ASC
- `getEntriesAfter(sessionId, afterSequence)` → SELECT WHERE sequence > afterSequence
- `listSessions()` → SELECT all, ORDER BY started_at DESC
- `findActiveSession()` → SELECT WHERE status='active' LIMIT 1

**Acceptance criteria:**
- [ ] All CRUD functions exist and are exported
- [ ] `addEntry` calls RPC function for atomic entry_count update (no eventual consistency risk)
- [ ] Integration test (gated) verifies full create → append → close → read cycle against real Supabase

**TDD cycle:**
1. **RED:** Write `src/lib/live-bloq/__tests__/repository.integration.test.ts` — test creates session, adds 3 entries, reads them back, verifies entry_count=3, closes session, verifies closed_at is set. Gate with `RUN_SUPABASE_INTEGRATION_TESTS=true`.
2. **GREEN:** Implement all repository functions.
3. **REFACTOR:** Ensure query patterns match existing repositories (error handling, return types).

**Verification:**
- [ ] `npm test -- -t "live-bloq"` passes (unit + integration)
- [ ] TypeScript compiles

**Dependencies:** Task 1

**Files touched:**
- `src/lib/live-bloq/repository.ts` (NEW)
- `src/lib/live-bloq/__tests__/repository.integration.test.ts` (NEW)

**Estimated scope:** M (1 source file, 1 test file, 9 functions)

---

### Phase 2: Business Logic

#### Task 3: Service Layer

**Description:** Business logic layer wrapping the repository. Handles validation, slug generation, `revalidatePath` calls, and mutation effects. Follows `src/lib/byte/service.ts` pattern — dependency injection of repository + mutation effect. Imports `revalidatePath` from `next/cache`.

**Functions:**
- `startSession(title)` → validates title, generates slug via `toUrlSafeString()`. If slug already exists in DB, appends `-2`, `-3`, etc. (retry up to 10 attempts, then throw). Calls repository, then **fires mutation effect** (notifies Telegram channel: "🔴 LIVE: title")
- `addEntry(sessionId, content)` → validates content, calls repository (RPC returns `{entry_id, entry_sequence, session_slug}`), uses returned `session_slug` for `revalidatePath('/bloq/live/${slug}')`
- `closeSession(sessionId)` → calls repository, calls `revalidatePath('/bloq/live/${slug}')` — does NOT fire mutation effect (readers already followed live)
- `cancelSession(sessionId)` → calls repository to set status='cancelled', calls `revalidatePath` — no mutation effect
- `getSession(slug)` → wraps repository, returns null for cancelled sessions (public page should 404)
- `getEntries(sessionId)` → wraps repository
- `getEntriesAfter(sessionId, afterSequence)` → wraps repository
- `listLiveSessions()` → wraps repository
- `findActiveSession()` → wraps repository

**Acceptance criteria:**
- [ ] Service validates inputs (non-empty title, non-empty content)
- [ ] `startSession` generates kebab-case slug from title, retries with `-2`, `-3` suffixes on collision (max 10 attempts)
- [ ] `addEntry` calls `revalidatePath('/bloq/live/${slug}')` after insert
- [ ] `startSession` fires `ContentMutationEvent` with `type: "live-bloq"` after session creation
- [ ] `closeSession` calls `revalidatePath` but does NOT fire mutation effect (notification already sent on start)
- [ ] `cancelSession` calls `revalidatePath` but does NOT fire mutation effect
- [ ] Unit tests mock repository and mutation effect, verify all function behaviors

**TDD cycle:**
1. **RED:** Write `src/lib/live-bloq/__tests__/service.test.ts` — test each function with mocked repository + mutation effect. Cover: startSession fires mutation, addEntry calls revalidatePath, closeSession revalidates but does NOT fire mutation, cancelSession revalidates but does NOT fire mutation.
2. **GREEN:** Implement service functions minimally.
3. **REFACTOR:** Extract slug generation, ensure error handling matches `byte/service.ts` pattern.

**Verification:**
- [ ] `npm test -- --grep "live-bloq"` passes
- [ ] 100% of service functions covered by unit tests

**Dependencies:** Task 2

**Files touched:**
- `src/lib/live-bloq/service.ts` (NEW)
- `src/lib/live-bloq/__tests__/service.test.ts` (NEW)
- `src/lib/live-bloq/index.ts` (NEW — barrel exports)

**Estimated scope:** M (2 source files, 1 test file)

---

#### Task 4: Content Mutation Types

**Description:** Extend `ContentMutationEvent` union to include live-bloq events. Update `telegram-effect.ts` and `homepage-effect.ts` to handle the new events.

**Acceptance criteria:**
- [ ] `ContentMutationEvent` includes `{ action: "published", type: "live-bloq", liveBloq: LiveSession }`
- [ ] New notification formatter `formatLiveBloqChannelMessage()` added to `src/lib/notifications/formatters.ts` — uses `🔴 LIVE: <b>title</b>\n<a href="${SITE_URL}/bloq/live/${slug}">Follow live</a>` (separate from existing `formatBloqChannelMessage` which hardcodes `/bloq/${slug}` for static posts)
- [ ] `notifyLiveBloqStarted()` method added to `TelegramNotifier` interface and implementation
- [ ] `createTelegramMutationEffect` calls `notifier.notifyLiveBloqStarted()` for live-bloq events
- [ ] `homepageMutationEffect` revalidates `/` and `/bloq` for live-bloq events
- [ ] `liveBloqService.startSession()` fires the mutation (notify subscribers "LIVE: title")
- [ ] `liveBloqService.closeSession()` does NOT fire mutation (subscribers already followed live)

**Verification:**
- [ ] `npm test -- --grep "content-publish"` passes (existing tests cover mutation effects)
- [ ] New event type doesn't break existing byte/blip/bloq event handling

**Dependencies:** Task 3

**Files touched:**
- `src/lib/content-publish/types.ts` (MODIFY — add live-bloq union member)
- `src/lib/content-publish/telegram-effect.ts` (MODIFY — handle live-bloq events)
- `src/lib/content-publish/homepage-effect.ts` (MODIFY — revalidate for live-bloq)
- `src/lib/notifications/types.ts` (MODIFY — add `notifyLiveBloqStarted()` to `TelegramNotifier` + `noopTelegramNotifier`)
- `src/lib/notifications/telegram-notifier.ts` (MODIFY — implement `notifyLiveBloqStarted()`)
- `src/lib/notifications/formatters.ts` (MODIFY — add `formatLiveBloqChannelMessage()`)

**Estimated scope:** S (6 files, all small modifications)

---

### Checkpoint: Foundation + Business Logic
- [ ] Database tables exist with RLS
- [ ] Repository CRUD works against Supabase
- [ ] Service layer tested with mocks
- [ ] Mutation pipeline handles live-bloq events
- [ ] All tests pass: `npm test`
- [ ] TypeScript compiles: `npx tsc --noEmit`

---

### Phase 3: Telegram Bot Integration

#### Task 5: Session State + Bot Commands

**Description:** Implement in-memory session state tracker and `/livesession` command handlers. Register the command in the bot. Add reply strings.

**Design constraint: single global active session.** The system allows exactly one active live session at a time, controlled by one bot operator. The `UNIQUE INDEX` on `status WHERE status = 'active'` enforces this at the database level. The `userId` key in the in-memory Map exists only for cold-start convenience — there is no multi-user ownership model.

**Functions in `session-state.ts`:**
- `getActiveSession(userId)` → Map lookup (userId used as key for cold-start matching only)
- `setActiveSession(userId, sessionId)` → Map set
- `clearActiveSession(userId)` → Map delete
- `getOrRecoverActiveSession(userId, service)` → check Map, fall back to `service.findActiveSession()` (global query, returns the one active session if any), restore if found

**Commands in `live-session.ts`:**
- `/livesession start <title>` → calls `service.startSession()`, sets session state, replies with URL
- `/livesession close` → gets active session, calls `service.closeSession()`, clears state, replies
- `/livesession cancel` → gets active session, calls `service.cancelSession()` (status='cancelled', no mutation), clears state, replies
- `/livesession status` → gets active session, replies with entry count + runtime + URL. Also warns if session has been active > 8 hours (abandonment detection)

**Acceptance criteria:**
- [ ] `/livesession start My Title` creates session, replies with URL and `live/` prefix
- [ ] Duplicate start is rejected: "You already have an active session"
- [ ] `/livesession close` with no active session replies with usage message
- [ ] `/livesession cancel` cancels without publishing (status='cancelled', no Telegram channel notification)
- [ ] `/livesession status` shows entry_count and runtime
- [ ] Stale session warning: `/livesession status` warns if active > 8 hours
- [ ] `getOrRecoverActiveSession` recovers state from Supabase after cold start
- [ ] Commands registered in `bot.ts` via `botInstance.command("livesession", ...)`

**TDD cycle:**
1. **RED:** Write `src/lib/telegram/__tests__/live-session.test.ts` — mock Grammy Context, mock `liveBloqService`, test each command handler with valid/invalid/edge-case inputs.
2. **GREEN:** Implement `session-state.ts` and `live-session.ts` handlers.
3. **REFACTOR:** Ensure reply formatting matches existing `replies.ts` style. Add reply strings to `replies.ts`.

**Verification:**
- [ ] `npm test -- --grep "live-session\|live-bloq"` passes
- [ ] Commands appear in bot command list: `/livesession` shows in `/start` help text

**Dependencies:** Task 3

**Files touched:**
- `src/lib/telegram/session-state.ts` (NEW)
- `src/lib/telegram/commands/live-session.ts` (NEW)
- `src/lib/telegram/__tests__/live-session.test.ts` (NEW)
- `src/lib/telegram/bot.ts` (MODIFY — register command)
- `src/lib/telegram/replies.ts` (MODIFY — add reply strings)

**Estimated scope:** M (3 new files, 2 modified)

---

#### Task 6: Session-Aware Message Routing

**Description:** Modify `handleMessage()` to check for active session before creating a byte. When session is active, route text to `liveBloqService.addEntry()`. Existing byte creation becomes the fallback.

**Change in `handleMessage()` at `src/lib/telegram/commands/handlers.ts:289`:**
```typescript
// AFTER auth + command filter
const activeSessionId = await getOrRecoverActiveSession(ctx.from!.id, liveBloqService);
if (activeSessionId) {
  const entry = await liveBloqService.addEntry(activeSessionId, text);
  await ctx.reply(`Entry #${entry.sequence} added.`);
  return;
}
// existing byte creation...
```

Also add `liveBloqService` module-level instantiation alongside `byteService` and `blipService`.

**Acceptance criteria:**
- [ ] Text message during active session → appended as entry (not a byte)
- [ ] Text message without active session → creates byte as before (no regression)
- [ ] Cold start auto-recovery: if Map is empty but Supabase has active session, message still routes correctly
- [ ] Commands (`/byte`, `/blip`, `/livesession`) are NOT intercepted — Grammy routes them before `handleMessage()`

**TDD cycle:**
1. **RED:** Write unit test for modified `handleMessage()` — mock active session state, verify entry is created. Mock empty session state, verify fallback to byte creation.
2. **GREEN:** Implement the routing change.
3. **REFACTOR:** Ensure no duplication with existing byte creation logic.

**Verification:**
- [ ] `npm test -- --grep "handlers\|live-session"` passes
- [ ] Existing telegram handler tests still pass (no byte regression)

**Dependencies:** Task 5

**Files touched:**
- `src/lib/telegram/commands/handlers.ts` (MODIFY)
- `src/lib/telegram/__tests__/handlers.test.ts` (MODIFY — add session-aware test cases)

**Estimated scope:** S (1 source file, 1 test file modified)

---

### Checkpoint: Bot Integration
- [ ] `/livesession start/close/cancel/status` all work end-to-end
- [ ] Text messages route correctly based on session state
- [ ] Cold start auto-recovery works
- [ ] All bot tests pass

---

### Phase 4: Frontend

#### Task 7: Live Bloq Detail Page

**Description:** Build the ISR page at `/bloq/live/[slug]` that renders session metadata and timestamped entries. Reuses `MDXComponents` for bullet-point rendering. Includes "Live" badge + polling script when `status='active'`.

**Page structure:**
```typescript
// src/app/(pages)/bloq/live/[slug]/page.tsx
export const revalidate = 60; // ISR: regenerate cached HTML every 60 seconds
// revalidatePath() in addEntry triggers immediate purge on new entry

export default async function LiveBloqPage({ params }) {
  const { slug } = await params;
  const session = await service.getSession(slug);
  if (!session) notFound();
  const entries = await service.getEntries(session.id);
  return (
    <article>
      {/* BloqCardDetail component or similar header */}
      {/* Live badge if session.status === 'active' */}
      <LiveBloqFeed session={session} initialEntries={entries} slug={slug} />
    </article>
  );
}
```

**`LiveBloqFeed` client component:**
- Renders entries as `<li>` elements with `<time>` timestamps + `<p>` content
- If `session.status === 'active'`, starts 30s `setInterval` polling
- Polls `GET /api/live-bloq/${slug}/entries?after=${lastSequence}`
- Appends new entries to DOM without full page re-render
- Stops polling when `session.status === 'closed'`

**Acceptance criteria:**
- [ ] Page renders at `/bloq/live/[slug]` with title, date, authors, category
- [ ] Each entry shows `HH:MM:SS` timestamp and content
- [ ] Active sessions show "Live" badge and auto-refresh indicator
- [ ] Closed sessions show no polling script
- [ ] Reuses `MDXComponents` for `<li>`, `<p>`, `<a>`, `<code>` rendering
- [ ] `<TrackView type="bloq" identifier={`live/${slug}`} />` included for view tracking (reuses existing `content_views` table — identifier `live/slug` is unique from static MDX posts)
- [ ] No JSON-LD schema — skipped for MVP (live pages are ephemeral; `buildBloqPostSchema()` expects BloqPost shape)

**TDD cycle:**
1. **RED:** Write component test for `LiveBloqFeed` — render with mock entries, verify they display. Start polling, mock fetch response, verify DOM appends new entry.
2. **GREEN:** Implement page + client component.
3. **REFACTOR:** Ensure MDXComponents integration works. Verify no hydration mismatch.

**Verification:**
- [ ] `npm test -- --grep "LiveBloqFeed\|live-bloq"` passes
- [ ] `npm run build` succeeds (ISR page compiles)
- [ ] Manual: open `/bloq/live/test-session` in browser, verify rendering

**Dependencies:** Task 3

**Files touched:**
- `src/app/(pages)/bloq/live/[slug]/page.tsx` (NEW)
- `src/app/(pages)/bloq/live/[slug]/LiveBloqFeed.tsx` (NEW)
- `src/app/(pages)/bloq/live/[slug]/__tests__/LiveBloqFeed.test.tsx` (NEW)

**Estimated scope:** M (2 source files, 1 test file)

---

#### Task 8: Polling API Route

**Description:** `GET /api/live-bloq/[slug]/entries?after=N` returns JSON of entries with `sequence > N`. Used by the polling script in Task 7's `LiveBloqFeed`.

**Acceptance criteria:**
- [ ] Returns `{ entries: [...], sessionStatus: 'active' | 'closed' | 'cancelled' }` — client stops polling when `sessionStatus !== 'active'`
- [ ] Returns 404 if session not found
- [ ] Returns empty entries array if no new entries

**TDD cycle:**
1. **RED:** Write route test — mock `liveBloqService`, verify `?after=5` filters correctly.
2. **GREEN:** Implement route handler.
3. **REFACTOR:** Ensure error handling matches existing API routes.

**Verification:**
- [ ] `npm test -- --grep "live-bloq"` passes
- [ ] Manual: curl `GET /api/live-bloq/test-slug/entries?after=0`

**Dependencies:** Task 3

**Files touched:**
- `src/app/api/live-bloq/[slug]/entries/route.ts` (NEW)
- `src/app/api/live-bloq/[slug]/entries/__tests__/route.test.ts` (NEW)

**Estimated scope:** S (1 source file, 1 test file)

---

#### Task 9: Listing Page + RSS Feed Merge

**Description:** Add live sessions to the bloq listing page and RSS feed. To avoid making the synchronous MDX parser async (which would ripple through `getBloqPostBySlug`, `generateStaticParams`, all statistics, etc.), we use a **wrapper approach**: keep `getBloqPostsPaginated()` fully sync (MDX-only), fetch live sessions separately in the page component, and merge before rendering.

**Approach (Option B — wrapper, not parser modification):**
1. Create `src/lib/live-bloq/to-bloq-post.ts` with `liveSessionToBloqPost(session: LiveSession): BloqPost`
2. Create a `getMergedBloqs()` helper that fetches static MDX posts + live sessions, converts both to `BloqPost[]`, merges, and sorts by date
3. In `src/app/(pages)/bloq/page.tsx`: replace the direct `getBloqPostsPaginated()` call with `getMergedBloqs()` — then apply filters, pagination, counts, and JSON-LD on the merged set. This ensures live sessions participate in category counts, tag counts, search results, and featured filtering.
3. In `src/lib/feed/generator.ts`: fetch live sessions, convert to `FeedItem[]`, merge into existing RSS items.

**Conversion defaults (liveSessionToBloqPost):**
```typescript
function liveSessionToBloqPost(session: LiveSession): BloqPost {
  return {
    url: `live/${session.slug}`,   // → resolves to /bloq/live/slug via BloqCardList link
    slug: session.slug,
    title: session.title,
    publishedAt: session.started_at,
    updatedAt: session.closed_at,
    summary: session.summary || (session.entry_count === 0 
      ? 'Live session in progress' 
      : `${session.entry_count} entries from live session`),
    content: '',                    // no MDX content — not needed for listing cards
    category: session.category,     // 'Live'
    tags: [...session.tags, 'live'],
    authors: session.authors,
    image: undefined,
    draft: false,
    featured: false,
    status: 'published',
    readingTime: session.entry_count > 0 ? Math.max(1, Math.ceil(session.entry_count / 10)) : undefined,
  };
}
```

**Acceptance criteria:**
- [ ] Live sessions appear in `/bloq` listing sorted chronologically by `started_at`
- [ ] Live sessions have `category: "Live"` and `tags: [...tags, 'live']`
- [ ] Cancelled sessions (status='cancelled') are excluded from the listing merge
- [ ] Listing card links to `/bloq/live/[slug]` (via `url: "live/${slug}"` → `/bloq/live/react-conf-2026`)
- [ ] RSS feed includes live session entries with correct dates and links
- [ ] `getBloqPostsPaginated()` remains synchronous — no changes to parser or caller signatures
- [ ] Known MVP limitation: `getAllCategories()`, `getAllTags()`, `getFeaturedCount()` are computed from the merged set for display counts, but the "Live" category and "live" tag may not appear in filter dropdowns until a full page reload after merge. Acceptable — live sessions are rare operations. Post-MVP: compute these from the merged set.

**TDD cycle:**
1. **RED:** Write unit test for `liveSessionToBloqPost()` — verify all required fields have explicit defaults, verify URL format, verify readingTime calculation from entry_count.
2. **GREEN:** Implement `to-bloq-post.ts` and add merge logic to `page.tsx`.
3. **REFACTOR:** Extract merge logic into a helper if the page component gets too long.

**Verification:**
- [ ] `npm test -- --grep "live-bloq\|to-bloq-post"` passes
- [ ] `npm run build` succeeds
- [ ] Manual: visit `/bloq`, verify live session appears in list with "Live" category badge

**Dependencies:** Task 7 (page must exist for links to resolve)

**Files touched:**
- `src/lib/live-bloq/to-bloq-post.ts` (NEW)
- `src/lib/live-bloq/__tests__/to-bloq-post.test.ts` (NEW)
- `src/app/(pages)/bloq/page.tsx` (MODIFY — add live session fetch + merge)
- `src/lib/feed/generator.ts` (MODIFY — add live session feed items)

**Estimated scope:** M (2 new files, 2 modified)

---

### Checkpoint: Frontend
- [ ] Live page renders entries with timestamps
- [ ] Polling appends new entries without page reload
- [ ] Live sessions appear in `/bloq` listing
- [ ] RSS feed includes live sessions
- [ ] All frontend tests pass
- [ ] `npm run build` succeeds

---

### Phase 5: E2E + Polish

#### Task 10: Playwright E2E Test

**Description:** Write a Playwright E2E test that covers the full flow. Seeds test data via a script or direct Supabase insert in `globalSetup`, then: loads live page, verifies entries render, verifies polling appends new entries to DOM, verifies polling stops when sessionStatus changes to 'closed'.

**Acceptance criteria:**
- [ ] Test seeds a test session via API or Supabase fixture before running
- [ ] Test loads `/bloq/live/test-session` and verifies page renders with entries
- [ ] Test verifies "Live" badge appears for active session
- [ ] Test verifies entries display with timestamps
- [ ] Test verifies `sessionStatus` in polling response triggers poll stop on close

**Verification:**
- [ ] `npm run test:e2e` passes (all 3 specs)

**Dependencies:** Tasks 7, 8, 9

**Files touched:**
- `tests/e2e/live-bloq.spec.ts` (NEW)

**Estimated scope:** S (1 test file)

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase JS client has no cross-table transactions | Med | Use Postgres RPC function `add_live_entry()` in migration — atomic INSERT + UPDATE in one function call |
| Session abandonment (owner starts session, forgets to close) | Low | `/livesession cancel` command added. `/livesession status` warns if session > 8 hours old. No auto-close timer in MVP |
| `BloqCard.url = "live/slug"` confuses `getBloqPostBySlug()` | Low | `getBloqPostBySlug` only searches static MDX cache. Live page uses its own `getSession()`. No collision |
| Listing page merge adds async Supabase query to previously sync page | Low | Page is already `async` (line 20). Live fetch is a separate call, merge is in-memory. Parser stays sync |
| `revalidatePath` inside `addEntry` is called per message (high frequency) | Low | Each call invalidates exactly one path. Vercel ISR handles this. Scale: ~100 calls/day at a conference |
| Grammy context `ctx.from?.id` is undefined for edge cases | Low | Existing handlers use same pattern. Falls through to auth rejection |
| Integ tests pollute Supabase | Low | Each test creates/deletes its own data. Use unique timestamps in test content |
| Bot process cold start loses in-memory session state | Low | `getOrRecoverActiveSession()` queries Supabase on first message after cold start. One DB call per cold start |

## Open Questions

- ~~Should we prompt for summary on close, or auto-generate from first entry?~~ → Auto-generate from first entry for MVP
- ~~What about `/livesession` command name length?~~ → Stays as `/livesession` — it's clear and discoverable
- Should the polling interval be configurable? → Hardcoded at 30s for MVP. Future: query param or env var
- Should closed/cancelled sessions get a distinct visual treatment in the listing (e.g., "Session closed" badge, different card style)? → Deferred to post-MVP polish
- JSON-LD schema for live pages? → Skipped for MVP. Live pages are ephemeral; `buildBloqPostSchema()` expects BloqPost shape. Post-MVP: create a dedicated `buildLiveBloqSchema()` if needed

---

## Task Summary

| # | Task | Phase | Scope | Deps | Can Parallelize? |
|---|------|-------|-------|------|------------------|
| 1 | DB migration + types | Foundation | XS | — | — |
| 2 | Repository | Foundation | M | 1 | — |
| 3 | Service | Business Logic | M | 2 | — |
| 4 | Mutation types | Business Logic | XS | 3 | — |
| 5 | Bot commands + session state | Bot | M | 3 | With Task 7 |
| 6 | Message routing | Bot | S | 5 | After Task 5 |
| 7 | Live page | Frontend | M | 3 | With Task 5 |
| 8 | Polling API | Frontend | S | 3 | With Task 7 |
| 9 | Listing merge + RSS | Frontend | M | 7 | After Task 7 |
| 10 | E2E test | Polish | S | 7,8,9 | — |

**Parallelization:** Tasks 5+7 can run concurrently (bot and frontend share the service layer but don't touch each other). Task 8 can run alongside Task 7 (the page imports the API route, but the route is independently testable).
