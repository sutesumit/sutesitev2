# Current Security Issues

This file is a current-state rewrite of the March 21 package. It separates findings that are still confirmed in the repo from findings that are only partially current, no longer current, or newly important after later refactors.

## Evidence Status

- `repo-verified in this pass`: confirmed from current code or current tests
- `inferred from later internal docs/history`: supported by later repo documentation or test history, but not re-proven live in this pass
- `still requires live Supabase verification`: depends on current DB policies, grants, functions, or production response behavior

## Still Confirmed

### 1. Visitor tracking still trusts client-supplied identity and location

Severity: High
Evidence status: `repo-verified in this pass`

Evidence:

- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/visit/route.ts) reads arbitrary request JSON and passes it to the visit service.
- [service.ts](/Users/Sute/Documents/v2.sutesite/src/lib/visit/service.ts) treats `body.ip` and related fields as the canonical visitor record.
- [VisitorAnalytics.tsx](/Users/Sute/Documents/v2.sutesite/src/components/layout/footer/VisitorAnalytics.tsx) sends browser-fetched location data to `/api/visit`.
- [useLocation.ts](/Users/Sute/Documents/v2.sutesite/src/hooks/useLocation.ts) still relies on a client-side location lookup path.

Why this is a problem:

- the server is not deriving visitor identity from trusted request metadata
- any client can forge IP, city, region, or country values
- analytics integrity is weak
- raw IP-linked records and owner notifications remain privacy-sensitive

### 2. Visitor data is still exposed back to anonymous callers

Severity: High
Evidence status: `repo-verified in this pass` for the API response, `still requires live Supabase verification` for DB policy posture

Evidence:

- [service.ts](/Users/Sute/Documents/v2.sutesite/src/lib/visit/service.ts) returns `lastVisitorLocation`, `lastVisitTime`, and `visitorCount`.
- [VisitorAnalytics.tsx](/Users/Sute/Documents/v2.sutesite/src/components/layout/footer/VisitorAnalytics.tsx) consumes that public response on the client.
- Earlier March 21 audit material recorded anonymous `visits` exposure via `get_recent_visit_ids()`, but that DB posture was not re-queried in this pass.

Why this is a problem:

- recent visitor activity remains observable through the app path itself
- visitor-presence data can be enumerated over time
- even coarse location telemetry becomes sensitive when combined with timestamps

### 3. Baseline browser security headers still appear absent

Severity: Medium
Evidence status: `repo-verified in this pass` for repo config, `still requires live Supabase verification` for deployed headers

Evidence:

- [next.config.ts](/Users/Sute/Documents/v2.sutesite/next.config.ts) does not define response headers.
- no repository-level `middleware.ts` is present to apply security headers.
- repo-visible API helpers such as [constants.ts](/Users/Sute/Documents/v2.sutesite/src/lib/api/constants.ts) only set `Cache-Control: no-store`.

Why this is a problem:

- no visible CSP
- no visible clickjacking protection
- no visible `Referrer-Policy`, `Permissions-Policy`, or `X-Content-Type-Options`

### 4. Public counters remain intentionally gameable

Severity: Medium
Evidence status: `repo-verified in this pass`

Evidence:

- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/views/route.ts) accepts unauthenticated POSTs for view increments.
- [fingerprint.ts](/Users/Sute/Documents/v2.sutesite/src/lib/utils/fingerprint.ts) still uses a local-storage UUID as clap identity.
- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/claps/[type]/[id]/route.ts) trusts caller-provided fingerprints.
- [useClaps.ts](/Users/Sute/Documents/v2.sutesite/src/hooks/useClaps.ts) automatically creates and reuses that client-controlled fingerprint.

Why this is a problem:

- counts are easy to inflate
- clap caps are easy to bypass through fingerprint rotation
- analytics should still be treated as approximate, not authoritative

### 5. Shared-secret authentication is still minimal and not layered

Severity: Medium
Evidence status: `repo-verified in this pass`

Evidence:

- [validation.ts](/Users/Sute/Documents/v2.sutesite/src/lib/api/validation.ts) compares `BLIP_SECRET_KEY` by direct equality.
- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/telegram/webhook/route.ts) verifies a static secret-derived value in a header.
- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/telegram/broadcast/route.ts) authorizes broadcast by direct equality on `X-Broadcast-Secret`.

Why this is a problem:

- there is no request signing, expiry, or IP-based restriction
- compromise of one secret still opens a privileged route
- there is still no visible rate limiting on these routes

### 6. Heavy server dependence on `service_role` remains a core blast-radius issue

Severity: Medium
Evidence status: `repo-verified in this pass` for code, `still requires live Supabase verification` for current DB role posture

Evidence:

- [supabaseServerClient.ts](/Users/Sute/Documents/v2.sutesite/src/lib/supabaseServerClient.ts) builds the server client with `SUPABASE_SERVICE_ROLE_KEY`.
- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/views/route.ts), [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/claps/[type]/[id]/route.ts), [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/byte/route.ts), and [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/blip/route.ts) all use the privileged server-side client path directly or through services.
- the March 21 audit already recorded `service_role` bypassing RLS; that exact role metadata was not re-queried in this pass.

Why this is a problem:

- route correctness remains the primary protection layer
- an auth bug or input bug in server code can become a privileged DB operation

## Partially Remediated Or Narrower Than Before

### 7. Broadcast secret reuse is now a residual risk, not the old March 21 form

Severity: Medium
Evidence status: `repo-verified in this pass`

Evidence:

- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/telegram/broadcast/route.ts) now prefers `TELEGRAM_BROADCAST_SECRET`.
- the same route still falls back to `TELEGRAM_BOT_TOKEN` if the dedicated secret is not set.

Why this is still a problem:

- the strongest version of the March 21 finding is reduced, but not gone
- deployments that omit `TELEGRAM_BROADCAST_SECRET` still reuse the bot credential for broadcast auth
- the route still uses a simple shared-secret comparison without additional controls

### 8. Old clap-policy and privileged-function findings may still matter, but need live re-verification

Severity: Medium to High
Evidence status: `still requires live Supabase verification`

Historical evidence from March 21:

- `claps` policy posture was previously described as overly broad
- several `SECURITY DEFINER` functions were previously recorded as missing fixed `search_path`

Current status:

- the app still depends on unified clap and view RPCs
- the current repo does not prove the live definitions, grants, or policies behind those RPCs
- these findings should remain in scope, but they should not be restated as freshly proven facts without a live Supabase pass

## No Longer Current

### 9. The old `project_views` finding is stale

Severity: Historical only
Evidence status: `repo-verified in this pass` for the app refactor, `inferred from later internal docs/history` for the `content_views` migration history

Reason:

- the app no longer uses the old per-type views routes or `project_views` table surface
- current code uses unified [`/api/views`](/Users/Sute/Documents/v2.sutesite/src/app/api/views/route.ts) and a unified RPC surface
- later repo history documents a move to `content_views`

Implication:

- March 21 references to `project_views`, `bloq_views`, `blip_views`, `byte_views`, and old per-type increment functions should not stay in the active issue list

### 10. The old visitor and Telegram debug-logging finding appears resolved

Severity: Historical only
Evidence status: `repo-verified in this pass`

Reason:

- current notifier code in [telegram-notifier.ts](/Users/Sute/Documents/v2.sutesite/src/lib/notifications/telegram-notifier.ts) no longer logs visitor payloads, allow-list IDs, or destination chat IDs

Implication:

- this should be removed from the active findings and retained only as a resolved historical note if needed

## New Issues Since 2026-03-21

### 11. `/api/views` can create counts for arbitrary valid `type` and `id` combinations

Severity: High
Evidence status: `repo-verified in this pass`

Evidence:

- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/views/route.ts) validates only `type` and presence of `id`; it does not verify that the target content exists before calling the RPC.
- [integration.test.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/views/__tests__/integration.test.ts) explicitly expects POST requests to create view records for non-existent bloq, blip, and byte IDs.
- later internal documentary material records the same behavior as accepted test coverage during the refactor.

Why this is a problem:

- callers can create analytics rows for non-existent content identifiers
- data quality degrades because counters are no longer bounded to real content
- if live RPCs also accept arbitrary identifiers, this becomes a durable integrity problem rather than just an API-design smell

### 12. `/api/claps/[type]/[id]` validates existence only for `bloq`

Severity: High
Evidence status: `repo-verified in this pass`

Evidence:

- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/claps/[type]/[id]/route.ts) checks existence only in the `bloq` branch.
- the same route sends `blip`, `byte`, and `project` IDs directly to privileged RPC calls.
- [integration.test.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/claps/__tests__/integration.test.ts) has 404 coverage only for non-existent `bloq` posts, not for the other content types.

Why this is a problem:

- non-bloq clap writes depend entirely on RPC-side validation or data constraints
- if the live RPC surface accepts arbitrary identifiers, privileged server routes can create or mutate engagement data for content that does not exist
- the validation posture is inconsistent across content types

### 13. The March 21 package itself had become stale enough to misdirect remediation

Severity: Medium
Evidence status: `repo-verified in this pass`

Evidence:

- the old package still centered removed tables and old per-type view functions
- the current app uses unified `/api/views` and newer content-publish paths

Why this matters:

- remediation effort can drift toward no-longer-primary surfaces
- follow-up testing instructions become less reliable if they target old architecture

## Immediate Risk Ranking

1. client-trusted visitor identity and public prior-visitor disclosure
2. arbitrary-ID view creation through `/api/views`
3. incomplete existence validation in `/api/claps/[type]/[id]`
4. service-role blast radius
5. missing security headers
6. thin shared-secret auth and missing rate limiting
7. gameable public counters
