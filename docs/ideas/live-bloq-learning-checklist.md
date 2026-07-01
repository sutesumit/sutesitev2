# Live Bloq Session — Learning Checklist

## 1. The Problem
- [x] Why can't we write MDX files from the Telegram bot?
- [x] Why do bytes/blips work with the bot but bloqs don't?
- [x] What does "live" mean technically? What's the gap between a message arriving and a reader seeing it?

## 2. The Architecture Decisions
- [x] Why Supabase for storage (vs writing to disk, vs S3, vs Redis)?
- [x] Why ISR + client polling (vs WebSocket, vs SSE, vs pure SSR)?
- [x] Why a separate `/bloq/live/[slug]` route (vs merging into `/bloq/[slug]`)?
- [x] Why in-memory session state in the bot (vs database, vs Redis)?
- [x] What role do RLS policies play and why do we need them?

## 3. The Data Flow (End-to-End)
- [x] Session creation: Telegram command → Supabase row → session state
- [x] Entry append: Telegram message → session state check → Supabase insert → revalidatePath → polling bridge
- [x] Browser rendering: ISR page → Supabase query → HTML → JS polling loop
- [x] Session close: status change → mutation effects → session state cleanup

## 4. The Code Structure
- [x] What does each new file do? (repository, service, handlers, page, API route)
- [x] How does `handleMessage()` change to support session mode?
- [x] How does the polling script work in the browser?
- [x] How does `getBloqPostsPaginated()` merge two data sources?

## 5. Edge Cases & Gotchas
- [x] What happens if the author sends `/livesession start` when a session is already active?
- [x] What happens if the author sends a `/byte` command during an active session?
- [x] What happens if a reader polls while the server is mid-revalidation?
- [x] What happens if `revalidatePath` fails silently?
- [x] How does the listing page stay chronologically correct after close?
- [x] What happens if the bot process restarts (losing in-memory session state)?
