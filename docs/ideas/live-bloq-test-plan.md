# Live Bloq — Comprehensive Test Plan

This plan maps every test case across all four testing tiers, aligned with the implementation tasks in `live-bloq-plan.md`. Each test has a clear RED → GREEN → REFACTOR cycle.

## Test Infrastructure

| Layer | Tool | Location | Pattern |
|-------|------|----------|---------|
| Unit (service, formatters, conversion) | Vitest | `src/lib/live-bloq/__tests__/` | Mock repo + mutation effect |
| Unit (bot handlers) | Vitest | `src/lib/telegram/__tests__/` | `vi.hoisted()` mocks, mock Grammy `Context` |
| Integration (repository) | Vitest | `src/lib/live-bloq/__tests__/` | Real Supabase, gated: `RUN_SUPABASE_INTEGRATION_TESTS=true` |
| Component (LiveBloqFeed) | Vitest + jsdom + @testing-library/react | `src/app/(pages)/bloq/live/[slug]/__tests__/` | Render, assert DOM, mock fetch |
| API route | Vitest | `src/app/api/live-bloq/[slug]/entries/__tests__/` | Mock `liveBloqService`, assert JSON response |
| E2E | Playwright | `tests/e2e/` | Headless Chromium, real server |

Environment setup: `src/test/setup.ts` mocks `next/navigation` and stubs Supabase env vars.

---

## Phase 1: Foundation (Tasks 1–2)

### Task 1: Database Migration + Types

**No runtime tests needed.** Verification is manual via Supabase dashboard + `npx tsc --noEmit`:

- [ ] Migration applies with `npx supabase db push` (no errors)
- [ ] Tables `live_bloq_sessions`, `live_bloq_entries` visible with correct columns, indexes, RLS
- [ ] `UNIQUE INDEX` on `status WHERE status = 'active'` enforces at most one active session
- [ ] `add_live_entry` RPC function exists and compiles
- [ ] Types compile: `npx tsc --noEmit`

### Task 2: Repository Layer — Integration Tests

**File:** `src/lib/live-bloq/__tests__/repository.integration.test.ts`

Pattern: `src/lib/byte/__tests__/repository.integration.test.ts` — gated behind `RUN_SUPABASE_INTEGRATION_TESTS=true`.

| # | Test Case | What It Verifies |
|---|-----------|------------------|
| R1 | `createSession` → returns `LiveSession` with all fields, status `'active'` | Basic INSERT works |
| R2 | `createSession` with duplicate slug → throws (UNIQUE constraint) | Slug uniqueness enforced |
| R3 | `createSession` when another session is active → throws (UNIQUE INDEX on active) | Single-active-session constraint enforced at DB level |
| R4 | `addEntry` via RPC → returns `{entry_id, entry_sequence, session_slug}`, increments `entry_count` | RPC atomically updates session + inserts entry |
| R5 | `addEntry` on closed session → throws (RPC enforces `status = 'active'`) | Write-gating enforced by RPC |
| R6 | 3 sequential `addEntry` calls → sequences 1, 2, 3; `entry_count` = 3 | Sequence numbering is correct and monotonic |
| R7 | `getEntries` → returns entries ordered by `sequence ASC` | Read path works |
| R8 | `getEntriesAfter(sessionId, 1)` → returns entries with sequence 2 and 3 | Delta-fetch for polling |
| R9 | `closeSession` → `status = 'closed'`, `closed_at` is set | Close transition works |
| R10 | `cancelSession` → `status = 'cancelled'` | Cancel transition works |
| R11 | `getSessionBySlug` → returns correct session | Slug lookup works |
| R12 | `getSessionById` → returns correct session | ID lookup works |
| R13 | `findActiveSession` → returns the one active session, or `null` | Global active session query works |
| R14 | `listSessions` → returns all sessions ordered by `started_at DESC` | Listing works |
| R15 | Full lifecycle: create → add 3 entries → close → read back. Verify `entry_count=3`, `closed_at` set | End-to-end repository test |
| R16 | `ON DELETE CASCADE`: delete session → entries deleted (verify via `getEntries` returns empty) | Referential integrity |
| R17 | After close, `createSession` succeeds (no conflict with unique active index) | Active constraint only applies to active sessions |

**GREEN implementation:** `src/lib/live-bloq/repository.ts` — all 10 CRUD functions.

---

## Phase 2: Business Logic (Tasks 3–4)

### Task 3: Service Layer — Unit Tests

**File:** `src/lib/live-bloq/__tests__/service.test.ts`

Pattern: `src/lib/byte/__tests__/service.test.ts` — dependency injection of `LiveBloqRepository` + `ContentMutationEffect`. Mock both.

#### `startSession(title)`

| # | Test Case | Mock Setup | Assertions |
|---|-----------|------------|------------|
| S1 | Valid title → creates session, fires mutation effect | `createSession` resolves with `LiveSession` | `createSession` called with generated slug; `mutationEffect.onMutation` called with `{action:"published", type:"live-bloq", liveBloq}` |
| S2 | Empty title → throws `ValidationError`, no repository call | — | `createSession` NOT called; error is `ValidationError` |
| S3 | Whitespace-only title → throws `ValidationError` | — | Same as S2 |
| S4 | Title with special chars → slug is kebab-case | — | `createSession` called with slug matching `/^[a-z0-9]+(-[a-z0-9]+)*$/` |
| S5 | Title with leading/trailing spaces → trimmed before slug generation | — | Slug generated from trimmed title |
| S6 | Slug collision (first 3 DB entries match) → appends `-2`, `-3`, `-4` | `getSessionBySlug` resolves non-null for first 3 attempts, null on 4th | `createSession` called with slug ending in `-4` |
| S7 | Slug collision exhausted (10 attempts) → throws | `getSessionBySlug` always resolves non-null | Error thrown after 10 retries |
| S8 | Repository throws → error propagates, no mutation fired | `createSession` rejects | `mutationEffect.onMutation` NOT called |

#### `addEntry(sessionId, content)`

| # | Test Case | Mock Setup | Assertions |
|---|-----------|------------|------------|
| S9 | Valid content → inserts via RPC, revalidates path | RPC returns `{entry_id, entry_sequence, session_slug}` | `addEntry` called; `revalidatePath('/bloq/live/${slug}')` called with RPC-returned slug |
| S10 | Empty content → throws `ValidationError` | — | `addEntry` NOT called |
| S11 | RPC throws (e.g., session not active) → error propagates | RPC rejects | Error propagates; `revalidatePath` NOT called |

#### `closeSession(sessionId)`

| # | Test Case | Mock Setup | Assertions |
|---|-----------|------------|------------|
| S12 | Closes session → revalidates path, does NOT fire mutation | `closeSession` resolves | `revalidatePath` called; `mutationEffect.onMutation` NOT called |
| S13 | Repository throws → error propagates | `closeSession` rejects | Error propagates |

#### `cancelSession(sessionId)`

| # | Test Case | Mock Setup | Assertions |
|---|-----------|------------|------------|
| S14 | Cancels session → revalidates path, does NOT fire mutation | `cancelSession` resolves | `revalidatePath` called; `mutationEffect.onMutation` NOT called |

#### `getSession(slug)`

| # | Test Case | Mock Setup | Assertions |
|---|-----------|------------|------------|
| S15 | Active session → returns `LiveSession` | `getSessionBySlug` resolves with active session | Returns session |
| S16 | Closed session → returns `LiveSession` | `getSessionBySlug` resolves with closed session | Returns session |
| S17 | Cancelled session → returns `null` (public 404) | `getSessionBySlug` resolves with cancelled session | Returns `null` |
| S18 | Non-existent slug → returns `null` | `getSessionBySlug` returns `null` | Returns `null` |

#### `getEntries(sessionId)` and `getEntriesAfter(sessionId, afterSequence)`

| # | Test Case | Assertions |
|---|-----------|------------|
| S19 | `getEntries` → passes through to repository | Returns repository result |
| S20 | `getEntriesAfter` → passes through to repository | Returns repository result, filters by `afterSequence` |

#### `listLiveSessions()`

| # | Test Case | Assertions |
|---|-----------|------------|
| S21 | Calls repository `listSessions` | Returns repository result |

#### `findActiveSession()`

| # | Test Case | Assertions |
|---|-----------|------------|
| S22 | Returns active session if one exists | Returns repository result |
| S23 | Returns `null` if no active session | Returns `null` |

**GREEN implementation:** `src/lib/live-bloq/service.ts` — all 9 service functions.

---

### Task 4: Content Mutation Types — Unit Tests

**Files modified:**
- `src/lib/content-publish/types.ts` — add `live-bloq` union member
- `src/lib/content-publish/telegram-effect.ts` — handle `live-bloq` events
- `src/lib/content-publish/homepage-effect.ts` — revalidate `/` and `/bloq` for `live-bloq`
- `src/lib/notifications/types.ts` — add `notifyLiveBloqStarted()` to interface + noop
- `src/lib/notifications/telegram-notifier.ts` — implement method
- `src/lib/notifications/formatters.ts` — add `formatLiveBloqChannelMessage()`

**Existing test files to update:**
- `src/lib/content-publish/__tests__/effects.test.ts` — add live-bloq event composition test
- `src/lib/telegram/__tests__/telegram-notifications.test.ts` — add live-bloq formatter tests

#### New/Modified Tests

| # | Test Case | File | What It Verifies |
|---|-----------|------|------------------|
| M1 | `ContentMutationEvent` union accepts `{action:"published", type:"live-bloq", liveBloq}` | (type-check, compile-time) | TypeScript compiles without error |
| M2 | `createTelegramMutationEffect` calls `notifier.notifyLiveBloqStarted()` for live-bloq event | content-publish `__tests__/effects.test.ts` (extend) | `notifyLiveBloqStarted` called with `liveBloq` |
| M3 | `createTelegramMutationEffect` does NOT call notifier for non-published actions | (existing test covers this — verify live-bloq type doesn't break) | Byte/blip events still work |
| M4 | `homepageMutationEffect` revalidates `/` and `/bloq` for live-bloq events | (unit test `homepage-effect.ts` — mock `revalidatePath`) | Both paths revalidated |
| M5 | `formatLiveBloqChannelMessage()` produces correct HTML | `telegram-notifications.test.ts` | Contains `🔴 LIVE:`, `<b>title</b>`, link to `/bloq/live/slug` |
| M6 | `formatLiveBloqChannelMessage()` escapes HTML in title | `telegram-notifications.test.ts` | Title with `<script>` is escaped |
| M7 | `noopTelegramNotifier.notifyLiveBloqStarted()` resolves without error | (type-check + unit) | No runtime error |

**GREEN implementation:** All 6 files listed above, small modifications.

---

## Phase 3: Telegram Bot Integration (Tasks 5–6)

### Task 5: Session State + Bot Commands — Unit Tests

**Files:**
- `src/lib/telegram/__tests__/live-session.test.ts` (NEW)
- `src/lib/telegram/session-state.ts` (NEW)
- `src/lib/telegram/commands/live-session.ts` (NEW)

Pattern: `src/lib/telegram/__tests__/handlers.test.ts` — `vi.hoisted()` for service mock, mock Grammy `Context`.

#### Session State (`session-state.ts`)

| # | Test Case | Mock Setup | Assertions |
|---|-----------|------------|------------|
| B1 | `setActiveSession` then `getActiveSession` → returns session | — | Round-trip works |
| B2 | `getActiveSession` with no prior `set` → returns `undefined` | — | Empty state is safe |
| B3 | `clearActiveSession` → `getActiveSession` returns `undefined` | — | Clear works |
| B4 | `getOrRecoverActiveSession` with Map hit → skips DB call | Map has entry | `service.findActiveSession` NOT called |
| B5 | `getOrRecoverActiveSession` with Map miss → queries DB | Map empty | `service.findActiveSession` called; returned session restored to Map |
| B6 | `getOrRecoverActiveSession` with Map miss + no active session in DB → returns `null` | Map empty, `findActiveSession` returns `null` | Returns `null` |

#### `/livesession start <title>`

| # | Test Case | Mock Setup | Assertions |
|---|-----------|------------|------------|
| B7 | Starts session → replies with URL | `startSession` resolves | Reply contains `live/` URL; `setActiveSession` called |
| B8 | No title provided → replies with usage message | — | Reply is usage string; `startSession` NOT called |
| B9 | Already has active session → replies with "already have an active session" | `getOrRecoverActiveSession` returns session ID | `startSession` NOT called |
| B10 | Service throws → replies with error message | `startSession` rejects | Error reply; no state set |

#### `/livesession close`

| # | Test Case | Mock Setup | Assertions |
|---|-----------|------------|------------|
| B11 | Closes active session → replies success, clears state | `getOrRecoverActiveSession` returns ID, `closeSession` resolves | `closeSession` called; `clearActiveSession` called; reply contains confirmation |
| B12 | No active session → replies with usage/error message | `getOrRecoverActiveSession` returns `null` | `closeSession` NOT called |

#### `/livesession cancel`

| # | Test Case | Mock Setup | Assertions |
|---|-----------|------------|------------|
| B13 | Cancels active session → replies success, clears state | `getOrRecoverActiveSession` returns ID | `cancelSession` called (NOT `closeSession`); `clearActiveSession` called |
| B14 | No active session → replies with usage message | `getOrRecoverActiveSession` returns `null` | `cancelSession` NOT called |

#### `/livesession status`

| # | Test Case | Mock Setup | Assertions |
|---|-----------|------------|------------|
| B15 | Active session → replies with entry count + runtime + URL | `getOrRecoverActiveSession` returns ID, `getSession` returns session with entries | Reply contains entry count, runtime, URL |
| B16 | Active session > 8 hours → replies with warning | Session `started_at` is 10 hours ago | Reply contains abandonment/stale warning |
| B17 | No active session → replies with "no active session" | `getOrRecoverActiveSession` returns `null` | Reply indicates no active session |

#### Command Registration

| # | Test Case | Assertions |
|---|-----------|------------|
| B18 | `bot.ts` registers `/livesession` command with handler | Unit test imports bot, verifies `command("livesession", ...)` called (may need bot refactor for testability) |
| B19 | `replies.ts` has all live-session reply strings | Verify exported `replies` object has new keys |

**GREEN implementation:** `session-state.ts`, `live-session.ts`, `bot.ts` (register), `replies.ts` (add strings).

---

### Task 6: Session-Aware Message Routing — Unit Tests

**File to modify:** `src/lib/telegram/__tests__/handlers.test.ts` (extend)

Pattern: Existing handlers test file. Add `liveBloqServiceMock` to `vi.hoisted()` block.

| # | Test Case | Mock Setup | Assertions |
|---|-----------|------------|------------|
| H1 | Text message during active session → routed to `liveBloqService.addEntry()` | `getOrRecoverActiveSession` returns session ID; `addEntry` resolves with `{sequence: 1}` | `addEntry` called with session ID + text; reply is `"Entry #1 added."`; `byteService.createByte` NOT called |
| H2 | Text message without active session → creates byte (existing behavior) | `getOrRecoverActiveSession` returns `null` | `byteService.createByte` called; `addEntry` NOT called |
| H3 | Cold start: Map empty, DB has active session → auto-recovers and routes to entry | `getOrRecoverActiveSession` queries DB, finds session | `addEntry` called (not `createByte`) |
| H4 | Commands (`/byte`, `/blip`, `/livesession`) NOT intercepted by message routing | Context message text starts with `/` | `handleMessage` returns early; no entry/byte created |
| H5 | Unauthorized user during active session → still rejected | `isAllowed` returns `false` | `addEntry` NOT called; unauthorized reply |

**GREEN implementation:** `src/lib/telegram/commands/handlers.ts` — add session check before byte creation.

---

## Phase 4: Frontend (Tasks 7–9)

### Task 7: Live Bloq Detail Page — Component Tests

**File:** `src/app/(pages)/bloq/live/[slug]/__tests__/LiveBloqFeed.test.tsx` (NEW)

Uses `@testing-library/react` + `vitest` + `jsdom`. Mock `fetch` for polling.

#### Rendering

| # | Test Case | What It Verifies |
|---|-----------|------------------|
| C1 | Renders all initial entries with timestamps | Each `<li>` has `<time>` + `<p>` with correct content |
| C2 | Active session shows "Live" badge | A badge/indicator element is present with text "Live" |
| C3 | Closed session shows no "Live" badge | Badge element is absent |
| C4 | Closed session shows no polling indicator | No auto-refresh spinner/element |
| C5 | Zero entries → renders empty feed (no crash) | Feed renders without entries; no errors |
| C6 | Entry content renders links as `<a>` tags | MDXComponents integration: `<a href="...">` renders |
| C7 | Entry content renders code as `<code>` | MDXComponents integration: inline code renders |
| C8 | `<TrackView>` component present with correct `type="bloq"` and `identifier` | TrackView receives `"live/slug"` as identifier |

#### Polling Behavior

| # | Test Case | Mock Setup | Assertions |
|---|-----------|------------|------------|
| C9 | Active session starts 30s polling | Session status = `'active'` | `setInterval` called with 30000ms |
| C10 | Polling fetches `GET /api/live-bloq/${slug}/entries?after=${lastSequence}` | Mock `fetch` | URL matches expected pattern |
| C11 | Poll response appends new entry to DOM | `fetch` resolves with new entry | DOM has original entries + new entry |
| C12 | Poll response with `sessionStatus: 'closed'` stops polling | `fetch` resolves with `{sessionStatus: 'closed', entries: []}` | `clearInterval` called; polling badge removed |
| C13 | Poll response with `sessionStatus: 'cancelled'` stops polling | `fetch` resolves with `{sessionStatus: 'cancelled', entries: []}` | `clearInterval` called |
| C14 | Poll network error → does NOT crash, continues polling | `fetch` rejects | Component still mounted; no unhandled rejection |
| C15 | Multiple entries in one poll response → all appended in order | `fetch` resolves with 3 new entries | All 3 appear in DOM, in correct sequence order |
| C16 | `afterSequence` is correct (last entry's sequence, not 0) | 3 initial entries with sequences 1,2,3 | `?after=3` in fetch URL |

**GREEN implementation:** `page.tsx` + `LiveBloqFeed.tsx`.

---

### Task 8: Polling API Route — Route Tests

**File:** `src/app/api/live-bloq/[slug]/entries/__tests__/route.test.ts` (NEW)

Pattern: Mock `liveBloqService`, test route handler directly (Next.js App Router route handlers are plain async functions).

| # | Test Case | Mock Setup | Assertions |
|---|-----------|------------|------------|
| A1 | Returns entries with `sequence > after` | `getSession` resolves; `getEntriesAfter` returns 2 entries | Response JSON has `entries` array with 2 items; `sessionStatus: 'active'` |
| A2 | `?after=5` filters correctly | `getEntriesAfter(sessionId, 5)` called | Route passes `5` (number, not string) |
| A3 | No `?after` query param → defaults to `0` | — | `getEntriesAfter(sessionId, 0)` called |
| A4 | Session not found → 404 | `getSession` returns `null` | Response status 404; JSON `{error: "Session not found"}` |
| A5 | Cancelled session → returns `sessionStatus: 'cancelled'` | `getSession` returns cancelled session | Response includes `sessionStatus: 'cancelled'` (client stops polling) |
| A6 | No new entries → empty array, sessionStatus present | `getEntriesAfter` returns `[]` | `entries: []`, `sessionStatus` set |
| A7 | Invalid slug (special chars) → handled gracefully | — | 400 or 404, not 500 |
| A8 | Service throws → 500 with generic error | `getSession` rejects | Status 500; no internal details leaked |

**GREEN implementation:** `src/app/api/live-bloq/[slug]/entries/route.ts`.

---

### Task 9: Listing Page Merge + RSS — Unit Tests

**File:** `src/lib/live-bloq/__tests__/to-bloq-post.test.ts` (NEW)

#### `liveSessionToBloqPost()`

| # | Test Case | Assertions |
|---|-----------|------------|
| T1 | Active session → `BloqPost` with `url: "live/slug"`, `category: "Live"`, `draft: false`, `status: "published"` | URL resolves to `/bloq/live/slug` via listing card |
| T2 | Closed session → `updatedAt` is `closed_at` | `updatedAt` field matches |
| T3 | Session with 0 entries → `summary` is "Live session in progress" | Default summary generated |
| T4 | Session with N entries → `summary` is `"${N} entries from live session"` | Summary describes entry count |
| T5 | Session with explicit `summary` → uses provided summary | Override works |
| T6 | Tags merged: `[...session.tags, 'live']` | Tags include session tags + `'live'` |
| T7 | `readingTime` = `Math.max(1, Math.ceil(entry_count / 10))` for N>0 | e.g., 12 entries → readingTime 2 |
| T8 | `readingTime` = `undefined` for 0 entries | Explicit test |
| T9 | `featured: false` always | Not hardcoded as literal — explicitly verified |
| T10 | `image: undefined` always | No image set |
| T11 | `content: ''` (empty string, not undefined) | Listing cards don't render MDX |
| T12 | `authors` preserved from session data | Authors array matches |

#### Listing Merge in `page.tsx`

| # | Test Case | Assertions |
|---|-----------|------------|
| T13 | Merge includes live sessions in chronological order with MDX posts | (Integration/component test) |
| T14 | Cancelled sessions excluded from merged list | Verify cancelled not in result |
| T15 | Live sessions have "Live" category badge rendered | (Component test of listing) |

#### RSS Feed Merge

| # | Test Case | Assertions |
|---|-----------|------------|
| T16 | Live session → `FeedItem` with correct title, link, date | Link goes to `/bloq/live/slug` |
| T17 | Cancelled sessions excluded from feed | Not in feed items |

**GREEN implementation:** `to-bloq-post.ts`, modified `page.tsx`, modified `generator.ts`.

---

## Phase 5: E2E + Polish (Task 10)

### Task 10: Playwright E2E Test

**File:** `tests/e2e/live-bloq.spec.ts` (NEW)

| # | Test Case | Steps | Assertions |
|---|-----------|-------|------------|
| E1 | Live page renders entries | Seed session + 3 entries → navigate to `/bloq/live/test-session` | Page renders; 3 `<li>` elements visible; timestamps present |
| E2 | "Live" badge visible for active session | Seed active session → load page | Badge element visible with "Live" text |
| E3 | Polling adds new entry to DOM | Seed session + entries → load page → insert new entry via API → wait 35s | 4th entry appears in DOM without page reload |
| E4 | Polling stops on close | Seed session + entries → load page → close session via API | After poll cycle, "Live" badge disappears; no more fetch calls |
| E5 | Cancelled session returns 404 | Seed cancelled session → navigate to `/bloq/live/cancelled-session` | Page shows 404 or "not found" |
| E6 | Live session appears in `/bloq` listing | Seed session → navigate to `/bloq` | Session appears with "Live" category badge; link goes to `/bloq/live/slug` |
| E7 | Empty session renders gracefully | Seed session with 0 entries → load page | No entries shown; no crash; "Live" badge visible |

**Seed strategy:** Pre-insert test data into Supabase before tests run, or use a test API endpoint.

---

## Test Execution Order (TDD)

| Order | Task | Test File(s) | Type |
|-------|------|-------------|------|
| 1 | Task 2 | `repository.integration.test.ts` | Integration |
| 2 | Task 3 | `service.test.ts` | Unit |
| 3 | Task 4 | `effects.test.ts` (extend), `telegram-notifications.test.ts` (extend) | Unit |
| 4 | Task 5 | `live-session.test.ts` | Unit |
| 5 | Task 6 | `handlers.test.ts` (extend) | Unit |
| 6 | Task 7 | `LiveBloqFeed.test.tsx` | Component |
| 7 | Task 8 | `route.test.ts` | API route |
| 8 | Task 9 | `to-bloq-post.test.ts` | Unit |
| 9 | Task 10 | `live-bloq.spec.ts` | E2E |

Parallelizable pairs: **Task 5 + Task 7** (bot commands and frontend page don't touch), **Task 8 + Task 7** (API route is independently testable).

---

## Test Count Summary

| Tier | # Tests | Files |
|------|---------|-------|
| Unit (service) | 23 | `service.test.ts` |
| Unit (mutation types + formatters) | 7 | `effects.test.ts` (extend), `telegram-notifications.test.ts` (extend) |
| Unit (bot handlers) | 19 | `live-session.test.ts` (new), `handlers.test.ts` (extend) |
| Unit (to-bloq-post) | 12 | `to-bloq-post.test.ts` |
| Component | 16 | `LiveBloqFeed.test.tsx` |
| API route | 8 | `route.test.ts` |
| Integration (repository) | 17 | `repository.integration.test.ts` |
| E2E | 7 | `live-bloq.spec.ts` |
| **Total** | **109** | **9 test files (6 new, 3 modified)** |

---

## Risks & Coverage Gaps

| Risk | Mitigation |
|------|------------|
| `revalidatePath` is a Next.js API — can't easily assert in unit tests | Service unit tests mock the `revalidatePath` import. E2E tests verify actual ISR behavior |
| Grammy `Context` type is complex — mock may drift from real type | Type-check mocks against Grammy types via `Parameters<typeof handler>[0]` casting |
| Integration tests need clean Supabase state | Each test creates unique data (timestamp-based slugs). `afterEach` deletes test sessions |
| `LiveBloqFeed` polling timers are async | Use `vi.useFakeTimers()` + `vi.advanceTimersByTime()` for deterministic polling tests |
| Listing merge is async in a previously sync page | Page is already `async` in current codebase (verified: `page.tsx` line 20). No sync→async conversion needed |
| E2E tests depend on seeded data | Use a dedicated test slug (`e2e-test-${Date.now()}`) and clean up in `afterEach` |
