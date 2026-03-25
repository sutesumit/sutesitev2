# Current Security Issues

## Confirmed Application Issues

### 1. Visitor tracking trusts client-supplied identity and location

Severity: High

Evidence:

- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/visit/route.ts#L36) reads arbitrary request JSON.
- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/visit/route.ts#L40) trusts `body.ip` and related fields as canonical visitor data.
- [VisitorAnalytics.tsx](/Users/Sute/Documents/v2.sutesite/src/components/layout/footer/VisitorAnalytics.tsx#L45) sends browser-fetched location data back to the API.
- [useLocation.ts](/Users/Sute/Documents/v2.sutesite/src/hooks/useLocation.ts#L16) fetches location data client-side from a third-party IP/location service.

Why this is a problem:

- the server is not deriving visitor identity from trusted request metadata
- any client can forge IP, city, region, or country values
- analytics integrity is weak
- privacy exposure is increased because raw IP-linked records are stored and surfaced

### 2. Visitor data is partially exposed back to anonymous users

Severity: High

Evidence:

- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/visit/route.ts#L103) returns `lastVisitorLocation`, `lastVisitTime`, and `visitorCount`.
- Supabase policy output shows `visits` has anon `SELECT` access constrained by recent IDs via `get_recent_visit_ids()`.
- shared function definition shows `public.get_recent_visit_ids()` is `SECURITY DEFINER` and returns the two newest rows.

Why this is a problem:

- recent visitor activity becomes observable
- visitor-presence data can be enumerated over time
- even coarse location telemetry can become sensitive when combined with timestamps

### 3. Debug logging includes visitor and Telegram metadata

Severity: Medium

Evidence:

- [notifications.ts](/Users/Sute/Documents/v2.sutesite/src/lib/telegram/notifications.ts#L11) logs full visitor payload and referrer.
- [notifications.ts](/Users/Sute/Documents/v2.sutesite/src/lib/telegram/notifications.ts#L14) logs allowed Telegram IDs.
- [notifications.ts](/Users/Sute/Documents/v2.sutesite/src/lib/telegram/notifications.ts#L23) logs chat destination.

Why this is a problem:

- logs become a secondary source of PII leakage
- operational logs may expose identifiers that do not need to be retained

### 4. Missing baseline browser security headers

Severity: Medium

Evidence:

- [next.config.ts](/Users/Sute/Documents/v2.sutesite/next.config.ts#L3) does not define headers.
- no app-level `middleware.ts` is present to apply security headers.

Why this is a problem:

- no visible CSP
- no visible clickjacking protection
- no visible `Referrer-Policy`, `Permissions-Policy`, or `X-Content-Type-Options`

### 5. Shared-secret authentication is minimal and not layered

Severity: Medium

Evidence:

- [validation.ts](/Users/Sute/Documents/v2.sutesite/src/lib/api/validation.ts#L7) compares `BLIP_SECRET_KEY` by direct equality.
- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/telegram/broadcast/route.ts#L7) uses `TELEGRAM_BOT_TOKEN` as the broadcast secret.

Why this is a problem:

- bot credential reuse increases blast radius
- there is no request signing, expiry, or IP-based restriction
- compromise of one secret can expose multiple control paths

### 6. Metrics endpoints are intentionally gameable

Severity: Medium

Evidence:

- public view increment routes accept unauthenticated POSTs
- [fingerprint.ts](/Users/Sute/Documents/v2.sutesite/src/lib/utils/fingerprint.ts#L18) uses local storage UUIDs for clap identity
- [route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/claps/%5Btype%5D/%5Bid%5D/route.ts#L35) trusts caller-provided fingerprints

Why this is a problem:

- counts are easy to inflate
- clap caps are easy to bypass
- analytics should be treated as approximate, not authoritative

## Confirmed Supabase Issues

### 7. `project_views` has RLS disabled

Severity: High

Evidence:

- live metadata shows `public.project_views` has `rls_enabled = false`
- grants show `anon` and `authenticated` already have table privileges on `project_views`

Why this is a problem:

- public clients can likely access the table directly through Supabase APIs
- analytics integrity for projects is exposed to tampering

### 8. `claps` update policy is effectively unrestricted

Severity: High

Evidence:

- policy `"Anyone can update their claps"` has `qual = true` and `with_check = true`
- `claps` also has anon/authenticated `INSERT` and `SELECT`

Why this is a problem:

- the policy name claims ownership enforcement, but the condition does not
- callers can potentially update any clap row, not just their own logical record

### 9. Anonymous `visits` read access is intentional at the DB layer

Severity: High

Evidence:

- `visits` policy `"Allow select recent visits"` allows anon `SELECT`
- that policy uses `get_recent_visit_ids()`
- `get_recent_visit_ids()` is `SECURITY DEFINER` and returns the newest visit rows

Why this is a problem:

- privacy leakage is not accidental only in the app; it is reinforced by DB policy design

### 10. Several `SECURITY DEFINER` functions lack fixed `search_path`

Severity: Medium

Affected functions confirmed from live metadata:

- `public.get_claps`
- `public.get_user_claps`
- `public.increment_bloq_view(text)`
- `public.increment_bloq_view(uuid)`
- `public.increment_project_view`
- `public.upsert_clap`

Safer examples already present:

- `public.increment_blip_view`
- `public.increment_byte_view`
- `public.get_recent_visit_ids`

Why this is a problem:

- name resolution in definer functions is less hermetic
- it increases the risk of search-path confusion and future privilege bugs

### 11. Heavy server dependence on `service_role`

Severity: Medium

Evidence:

- [server.ts](/Users/Sute/Documents/v2.sutesite/src/lib/supabase/server.ts#L10) uses `SUPABASE_SERVICE_ROLE_KEY`
- live roles output confirms `service_role` has `rolbypassrls = true`

Why this is a problem:

- route correctness becomes the primary protection layer
- an auth bug or input bug in server code can become a privileged DB operation

## Open Issues Still Requiring Verification

### 12. Storage policy posture is still unknown

Reason:

- storage bucket rows and storage policies were not included in the shared results

Why it matters:

- storage is a common leak path
- public buckets or permissive object policies can bypass otherwise careful app design

### 13. Full grant posture was only partially reviewed

Reason:

- the grants output was very large and was not fully narrowed to public tables of interest

Why it matters:

- explicit grants can still create exposure if a table later loses RLS or a view/function is added carelessly

## Immediate Risk Ranking

1. `project_views` without RLS
2. broken `claps` ownership policy
3. public `visits` exposure and client-trusted visitor identity
4. service-role blast radius
5. missing `search_path` in privileged functions
6. missing security headers
