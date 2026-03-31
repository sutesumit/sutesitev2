# Recommendations And Tradeoffs

## 1. Redesign visitor tracking for privacy and trust boundaries

### Recommendation

- derive visitor identity server-side
- stop treating client-supplied IP/location fields as the source of truth
- hash or otherwise irreversibly transform visitor identity if uniqueness is the real requirement
- remove or coarsen prior-visitor disclosure in public responses

### Benefit

- largest privacy improvement
- better analytics integrity
- smaller breach impact

### Tradeoff

- loses some novelty of the current "last visitor" feature
- makes location storytelling less precise

## 2. Enforce content existence in unified views and claps flows

### Recommendation

- validate that target content exists before incrementing view or clap state
- enforce that rule in both the route layer and the DB layer where practical
- make behavior consistent across `bloq`, `blip`, `byte`, and `project`

### Benefit

- prevents counters from drifting away from real content
- removes a current integrity regression introduced by the unified architecture

### Tradeoff

- more validation logic
- some additional read cost or RPC complexity
- may require clarifying what "existence" means for each content type

## 3. Rework clap ownership and abuse posture

### Stronger option

- remove direct public mutation paths at the DB layer
- allow clap changes only through tightly scoped RPCs or server routes
- bind clap limits to something stronger than a client-controlled local-storage identifier if limits truly matter

### Benefit

- reduces direct table abuse
- centralizes clap rules and validation

### Tradeoff

- more backend logic
- more complexity for a low-stakes feature

### Lightweight option

- keep the anonymous model
- document clap totals as approximate
- add rate limiting and cheap replay suppression while keeping fingerprints lightweight

### Benefit

- smaller change

### Tradeoff

- still weak against deliberate abuse

## 4. Remove bot-token fallback from broadcast auth

### Recommendation

- require `TELEGRAM_BROADCAST_SECRET`
- stop falling back to `TELEGRAM_BOT_TOKEN`
- keep machine-to-machine auth separate from bot credentials

### Benefit

- reduces secret reuse and blast radius
- makes credential intent clearer operationally

### Tradeoff

- deployments must set and rotate one more secret

## 5. Add rate limiting to public and secret-protected routes

### Recommendation

- rate-limit `/api/views`, `/api/claps/[type]/[id]`, and `/api/visit`
- also rate-limit `/api/byte`, `/api/blip`, `/api/telegram/webhook`, and `/api/telegram/broadcast`
- add cheap replay suppression where feasible

### Benefit

- improves data quality
- reduces spam and operational noise
- adds defense in depth around shared-secret endpoints

### Tradeoff

- more operational complexity
- some legitimate repeated interactions may be suppressed

## 6. Add baseline security headers

### Recommendation

- add CSP
- add frame restrictions
- add `Referrer-Policy`
- add `Permissions-Policy`
- add `X-Content-Type-Options`

### Benefit

- broad browser hardening

### Tradeoff

- CSP tuning can be awkward with Next.js, MDX, and third-party assets
- rollout may require iteration to avoid page breakage

## 7. Reduce service-role blast radius

### Stronger option

- reserve `service_role` for only the operations that truly require bypassing RLS
- move public analytics mutations behind narrowly scoped RPCs with explicit validation

### Benefit

- reduces damage from future route bugs

### Tradeoff

- requires more DB design and role clarity

### Current pragmatic option

- continue using `service_role`, but tighten route validation, auth boundaries, and observability

### Benefit

- less refactor effort

### Tradeoff

- keeps route correctness as the primary security boundary

## 8. Re-verify privileged function hygiene in the live database

### Recommendation

- re-check all current clap and view helper functions for fixed `search_path`
- schema-qualify references inside privileged functions

### Benefit

- keeps definer functions hermetic and predictable

### Tradeoff

- low cost
- depends on a live DB review because the current repo does not prove live definitions

## Suggested Remediation Sequence

1. redesign `/api/visit` to derive and minimize visitor identity server-side
2. enforce content existence for unified views and claps
3. remove bot-token fallback from `/api/telegram/broadcast`
4. add rate limiting to public and secret-protected routes
5. add browser security headers
6. reduce service-role blast radius where practical
7. re-verify and patch current privileged DB functions if needed

## Decision Principle

For this app, the right posture is not maximum lockdown at any cost.

The right posture is:

- protect visitor privacy
- prevent obvious counter and content-integrity tampering
- reduce privileged blast radius
- keep low-value novelty features proportionate to their risk

Views and claps can tolerate approximate counts.
Visitor identity and prior-visitor disclosure should not.
