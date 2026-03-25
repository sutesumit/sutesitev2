# Recommendations And Tradeoffs

## 1. Fix `project_views` exposure

### Recommendation

- enable RLS on `public.project_views`
- allow public `SELECT` only if the counter must remain readable
- keep writes limited to `service_role` or a tightly scoped definer function

### Benefit

- closes the clearest direct public table exposure

### Tradeoff

- if any current client code depends on direct public writes through Supabase, it will stop working
- server-mediated writes are safer but add coupling to API routes or RPCs

## 2. Rework `claps` ownership and write model

### Stronger option

- remove direct `INSERT` and `UPDATE` for `anon` and `authenticated`
- allow clap changes only through a secured RPC or server route

### Benefit

- reduces direct table abuse
- centralizes clap rules and validation

### Tradeoff

- more backend logic
- more app complexity for a low-stakes feature

### Lightweight option

- keep public access but enforce row ownership in policy

### Benefit

- smaller change

### Tradeoff

- still weak if identity remains just a client-controlled fingerprint
- protects against accidental direct row tampering better than against deliberate abuse

## 3. Redesign visitor tracking for privacy

### Stronger option

- derive IP server-side
- hash or otherwise irreversibly transform visitor identity
- remove public previous-visitor disclosure

### Benefit

- largest privacy improvement
- better data integrity

### Tradeoff

- loses some novelty of the “last visitor” feature
- makes highly specific location storytelling less precise

### Moderate option

- keep visitor feature but return only coarse data such as country or region
- never expose exact recency beyond broad ranges

### Benefit

- preserves feature flavor

### Tradeoff

- still carries some privacy sensitivity

## 4. Fix `SECURITY DEFINER` hygiene

### Recommendation

- add `SET search_path = public` or `SET search_path = ''` to every definer function
- schema-qualify table references inside privileged functions

### Benefit

- makes privileged functions more hermetic and predictable

### Tradeoff

- low cost
- almost no downside beyond migration work

## 5. Reduce service-role blast radius

### Stronger option

- reserve `service_role` for only the operations that truly require bypassing RLS
- use narrower RPCs for public actions

### Benefit

- reduces damage from future route bugs

### Tradeoff

- requires more DB design and role clarity

### Current pragmatic option

- continue using `service_role`, but tighten route auth, validation, and observability

### Benefit

- less refactor effort

### Tradeoff

- keeps route layer as the main security boundary

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

- CSP tuning can be annoying with dynamic content, third-party embeds, and Next.js internals
- needs iterative rollout to avoid breaking pages

## 7. Remove sensitive debug logging

### Recommendation

- stop logging IPs, referrers, chat IDs, and allow-list IDs
- keep only success/failure telemetry and coarse event metadata

### Benefit

- immediate privacy win
- low implementation cost

### Tradeoff

- slightly less debugging convenience

## 8. Add abuse controls to public counters

### Recommendation

- rate-limit clap, visit, and view endpoints
- deduplicate obvious replays when cheap to do so

### Benefit

- improves data quality
- reduces spam and operational noise

### Tradeoff

- more complexity for metrics that may not need strict accuracy
- some legitimate repeated interactions may be suppressed

## Suggested Remediation Sequence

1. enable RLS on `project_views`
2. remove or tighten public `visits` exposure
3. fix `claps` write model
4. patch all `SECURITY DEFINER` functions with fixed `search_path`
5. remove sensitive logging
6. add security headers
7. add rate limiting and abuse controls

## Decision Principle

For this app, the right posture is not “maximum enterprise lockdown at any cost.”

The right posture is:

- protect visitor privacy
- prevent obvious public data tampering
- reduce privileged blast radius
- keep low-value novelty features proportionate to their risk

Features like claps and views can tolerate approximate counts.
Visitor identity and leaked metadata should not.
