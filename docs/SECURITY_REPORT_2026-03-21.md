# Security Report

Date: 2026-03-21
Application: `v2.sutesite`
Reviewer: Codex
Scope: Source review of the local Next.js application, API routes, Supabase integration, Telegram integration, analytics flow, and database migrations present in this repository.

## Executive Summary

This application is not showing a single catastrophic remote-code-execution style flaw in the reviewed code, but it does expose a set of meaningful security weaknesses around analytics integrity, visitor privacy, operational hardening, and trust boundaries.

The most important confirmed issue is the public visitor-tracking endpoint trusting client-supplied IP and location data, persisting it, and returning prior visitor metadata. That creates both data-integrity problems and privacy exposure. The next tier of issues is operational hardening: missing baseline response security headers, plaintext logging of visitor PII, and admin endpoints that rely on shared secrets with minimal defensive controls.

The application also relies heavily on the Supabase service role from server routes. That is workable, but it makes route-level validation and secret handling part of the primary security boundary. If any write route is bypassed or misconfigured later, the blast radius is the entire backing dataset reachable by the service role.

## Methodology

This report is based on:

- Review of application configuration and route structure
- Review of API route authorization and input handling
- Review of client analytics and clap-identification flows
- Review of Supabase client usage and migration files available in this repository
- Review of Telegram bot/webhook/broadcast logic

This report does not include:

- Live penetration testing against a deployed environment
- Verification of runtime headers in production
- Dependency vulnerability scanning against npm advisory databases
- Full verification of Supabase RPC functions not defined in this repository
- Review of infrastructure outside the repo such as Vercel, Supabase project settings, DNS, WAF, or CI secret scopes

## Architecture and Trust Boundaries

### Public attack surface

- Public pages rendered by Next.js App Router
- Public API routes for views, claps, GitHub activity, and visitor tracking
- Authenticated API routes for creating/updating/deleting bytes and blips
- Telegram webhook endpoint
- Telegram broadcast endpoint

### Sensitive trust boundaries

- Server routes use `SUPABASE_SERVICE_ROLE_KEY`, which bypasses ordinary RLS restrictions and should be treated as full database trust
- Client analytics obtains location data from `ipapi.co` in the browser and forwards that data back to this application
- Telegram integrations send HTML-formatted messages to privileged destinations

## Confirmed Findings

### 1. Public visitor-tracking endpoint trusts attacker-controlled IP and location data and exposes prior visitor metadata

Severity: High

Evidence:

- [src/app/api/visit/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/visit/route.ts#L34) reads arbitrary JSON from the request body.
- [src/app/api/visit/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/visit/route.ts#L40) trusts `body.ip` and related location fields as authoritative visitor data.
- [src/app/api/visit/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/visit/route.ts#L53) queries and inserts visits using that client-supplied IP.
- [src/app/api/visit/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/visit/route.ts#L103) returns `lastVisitorLocation`, `lastVisitTime`, and `visitorCount` to any caller.
- [src/components/layout/footer/VisitorAnalytics.tsx](/Users/Sute/Documents/v2.sutesite/src/components/layout/footer/VisitorAnalytics.tsx#L45) sends browser-fetched location data to `/api/visit`.
- [src/hooks/useLocation.ts](/Users/Sute/Documents/v2.sutesite/src/hooks/useLocation.ts#L16) sources the visitor IP/location from a third-party browser-side API.

Impact:

- Anyone can forge visits for arbitrary IPs and arbitrary geolocations.
- Anyone can poll the endpoint to infer recent visitor presence and rough location history.
- Analytics and owner notifications can be manipulated for spam, noise, or false attribution.
- Raw IP data is stored, which raises privacy and breach-impact concerns.

Why this matters:

The server is not deriving visitor identity from request metadata. It is accepting a client assertion and persisting it. That means the endpoint is not measuring visitors; it is recording whatever any caller claims.

Recommended remediation:

- Stop accepting client-supplied IP as the source of truth.
- Derive IP server-side from trusted proxy headers or platform request metadata.
- Minimize stored location precision; avoid storing raw IPs if unique-counting is the goal.
- Replace raw IP storage with a salted, irreversible hash if uniqueness is required.
- Remove `lastVisitTime` and precise prior-visitor location from public responses, or coarsen and heavily cache them.
- Add rate limits per IP and per path.

### 2. Visitor PII and admin-chat metadata are logged in plaintext

Severity: Medium

Evidence:

- [src/lib/telegram/notifications.ts](/Users/Sute/Documents/v2.sutesite/src/lib/telegram/notifications.ts#L11) logs the full `visitor` object and `referrer`.
- [src/lib/telegram/notifications.ts](/Users/Sute/Documents/v2.sutesite/src/lib/telegram/notifications.ts#L14) logs `TELEGRAM_ALLOWED_USER_IDS`.
- [src/lib/telegram/notifications.ts](/Users/Sute/Documents/v2.sutesite/src/lib/telegram/notifications.ts#L23) logs the selected chat ID.

Impact:

- Logs can contain raw IP addresses, location data, referrers, and internal Telegram identifiers.
- If logs are accessible to hosting staff, third-party logging tools, or an attacker with partial access, this broadens data exposure significantly.

Recommended remediation:

- Remove debug logs from the notification path.
- Never log raw IPs, full referrers, bot destinations, or allow-list identifiers in production.
- Replace with structured, minimized logs such as event success/failure and anonymous counters.

### 3. Baseline browser hardening headers are missing from app configuration

Severity: Medium

Evidence:

- [next.config.ts](/Users/Sute/Documents/v2.sutesite/next.config.ts#L3) defines image settings only.
- No repository-level `middleware.ts` was found in application code to set security headers.
- [src/app/layout.tsx](/Users/Sute/Documents/v2.sutesite/src/app/layout.tsx#L120) injects JSON-LD safely for static objects, but there is no visible CSP or other browser policy limiting script execution.

Impact:

- No visible Content-Security-Policy to reduce XSS impact.
- No visible `X-Frame-Options` or `frame-ancestors` policy to reduce clickjacking risk.
- No visible `Referrer-Policy`, `Permissions-Policy`, or hardening headers for broader browser attack-surface reduction.

Recommended remediation:

- Add a baseline header set via Next.js `headers()` or middleware.
- Minimum recommended policies:
  - `Content-Security-Policy`
  - `X-Frame-Options` or CSP `frame-ancestors 'none'`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Content-Type-Options: nosniff`
  - `Permissions-Policy`
- Tune CSP carefully for Next.js, MDX, and any third-party assets.

### 4. Admin write endpoints rely on simple shared-secret comparison, and broadcast auth reuses the bot token

Severity: Medium

Evidence:

- [src/lib/api/validation.ts](/Users/Sute/Documents/v2.sutesite/src/lib/api/validation.ts#L7) validates admin API access by direct string equality against `BLIP_SECRET_KEY`.
- [src/app/api/blip/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/blip/route.ts#L10) and [src/app/api/byte/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/byte/route.ts#L10) rely on that header-secret model for write access.
- [src/app/api/telegram/broadcast/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/telegram/broadcast/route.ts#L7) authorizes requests by comparing `X-Broadcast-Secret` to `TELEGRAM_BOT_TOKEN`.

Impact:

- The Telegram bot token is both a bot credential and a broadcast API credential, which increases secret reuse and operational blast radius.
- There is no defense-in-depth layer such as request signing, timestamp validation, IP allow-listing, or rate limiting.
- The comparison is a raw equality check rather than constant-time comparison.

Recommended remediation:

- Use a dedicated broadcast secret separate from `TELEGRAM_BOT_TOKEN`.
- Prefer HMAC-signed requests with timestamp validation for machine-to-machine endpoints.
- Use constant-time comparison for secrets.
- Add IP allow-listing if the caller set is narrow and known.
- Rate-limit all authenticated write endpoints.

### 5. Public analytics and clap endpoints are easy to game

Severity: Medium

Evidence:

- [src/app/api/bloq/views/[slug]/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/bloq/views/[slug]/route.ts#L7), [src/app/api/blip/views/[serial]/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/blip/views/%5Bserial%5D/route.ts#L7), [src/app/api/byte/views/[serial]/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/byte/views/%5Bserial%5D/route.ts#L7), and [src/app/api/project/views/[slug]/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/project/views/%5Bslug%5D/route.ts#L6) increment counters without authentication or rate limits.
- [src/lib/utils/fingerprint.ts](/Users/Sute/Documents/v2.sutesite/src/lib/utils/fingerprint.ts#L18) identifies a clap “user” with a random UUID stored in `localStorage`.
- [src/hooks/useClaps.ts](/Users/Sute/Documents/v2.sutesite/src/hooks/useClaps.ts#L31) automatically creates and reuses that client-controlled fingerprint.
- [src/app/api/claps/[type]/[id]/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/claps/%5Btype%5D/%5Bid%5D/route.ts#L35) trusts caller-supplied fingerprint values.

Impact:

- View counts can be inflated trivially with scripts.
- Clap limits can likely be bypassed by clearing storage or rotating arbitrary fingerprints.
- Any downstream decisions based on these counters should be treated as untrusted.

Recommended remediation:

- Add rate limiting and abuse detection on public counter endpoints.
- If clap limits matter, bind them to a stronger identity signal than client-controlled local storage.
- Consider signed, expiring server-issued identifiers if anonymous interaction must remain lightweight.
- Treat analytics as approximate unless abuse controls are added.

### 6. Wide use of the Supabase service role increases blast radius and shifts security to route correctness

Severity: Medium

Evidence:

- [src/lib/supabase/server.ts](/Users/Sute/Documents/v2.sutesite/src/lib/supabase/server.ts#L10) builds the server client with `SUPABASE_SERVICE_ROLE_KEY`.
- Multiple routes use this client for reads and writes, including [src/app/api/blip/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/blip/route.ts#L34), [src/app/api/byte/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/byte/route.ts#L23), [src/app/api/claps/[type]/[id]/route.ts](/Users/Sute/Documents/v2.sutesite/src/app/api/claps/%5Btype%5D/%5Bid%5D/route.ts#L42), and the view routes.

Impact:

- Any future auth bypass in an API route can become full-privilege DB access for that route’s reachable tables/functions.
- The app is less protected by database policy mistakes because the service role bypasses ordinary RLS checks.

Recommended remediation:

- Use the service role only where strictly required.
- Prefer narrower server-side DB functions or role-scoped RPCs for public actions like incrementing counters.
- Keep RLS enabled and verified even if the current server code uses service-role access.
- Separate read-only and write-capable data paths where possible.

## Observations That Lower Risk

- MDX content appears to be sourced from local repository files rather than user submissions, reducing practical XSS exposure from the content pipeline in its current design.
- The visible SQL migrations enable RLS on `bytes`, `byte_views`, `blips`, and `blip_views`, and the view increment functions use `SET search_path = public`, which is the correct direction for `SECURITY DEFINER` safety.
- Write routes for bytes and blips do require an explicit secret header rather than relying on browser cookies, which avoids classic CSRF.

## Areas Requiring Follow-Up Verification

These areas could not be fully verified from the repository contents alone:

- Supabase RPC definitions for `upsert_clap`, `get_claps`, `get_user_claps`, `increment_bloq_view`, `increment_project_view`, and `get_unique_visitor_count`
- Supabase project-level RLS and grants outside the migration files present here
- Production deployment headers and edge/CDN behavior
- Secret rotation policy and CI secret exposure
- Dependency CVE status at audit time

## Priority Remediation Plan

### Immediate

1. Rework `/api/visit` so the server derives visitor identity and stops exposing prior-visitor metadata.
2. Remove production logging of visitor IP/location and Telegram identifiers.
3. Introduce baseline security headers, especially CSP and clickjacking protection.

### Short term

1. Split `X-Broadcast-Secret` away from `TELEGRAM_BOT_TOKEN`.
2. Add request rate limiting for `/api/visit`, view counters, claps, and admin write routes.
3. Add strict schema validation for all JSON request bodies on public and authenticated endpoints.

### Medium term

1. Replace raw-IP storage with hashed or otherwise minimized identifiers.
2. Move public counter mutations behind tightly scoped RPCs with abuse controls.
3. Review all service-role usages and reduce them where possible.

## How To Turn This Into a Deeper Production Security Review

If you want this to become a full production-grade security assessment, the next pass should include:

1. Dynamic testing of the deployed app:
   - Header inspection
   - Endpoint fuzzing
   - Abuse testing for rate limits
   - Content-security-policy validation
2. Dependency review:
   - `npm audit`
   - lockfile review
   - package risk review for high-trust libraries
3. Supabase review:
   - Dump and review all RLS policies
   - Review all functions, grants, triggers, and exposed schemas
   - Verify service-role usage paths
4. Infrastructure review:
   - Deployment platform env var exposure
   - Logging sinks
   - CI secrets
   - Domain/TLS settings
5. Privacy review:
   - Visitor analytics retention
   - PII minimization
   - consent and disclosure

## Final Assessment

Current posture: Moderate risk for a personal site with interactive APIs.

Reasoning:

- The app is structurally simple and avoids some common classes of risk.
- The largest issues are trust-boundary mistakes and hardening gaps, not deep framework compromise.
- The main business impact is privacy leakage, analytics abuse, noisy operations, and elevated blast radius if a route is misused.

The repository is in a state where targeted remediation can materially improve security without a major rewrite.
