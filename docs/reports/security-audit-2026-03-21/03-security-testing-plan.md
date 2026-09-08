# Security Testing Plan

## Objective

Verify that the current high-signal vulnerabilities are reproducible, that remediations actually work, and that the post-March-21 architecture does not hide new integrity or privacy regressions.

## Testing Streams

### 1. Database security testing

Targets:

- `content_views`
- `claps`
- `visits`
- unified clap and view RPCs
- storage objects and buckets

Tests:

- direct `anon` read against `content_views`, `claps`, and `visits`
- direct `anon` insert/update attempts against `content_views` and `claps`
- direct `authenticated` read/write attempts where relevant
- direct execution attempts for `get_claps`, `get_user_claps`, `upsert_clap`, and unified view RPCs
- attempt to create counts for non-existent content identifiers through the RPC surface

Pass criteria:

- no unexpected direct public writes
- no cross-row mutation on `claps`
- no anonymous access to sensitive visit rows
- no ability to create view or clap state for non-existent content unless that tradeoff is explicitly accepted

### 2. Application API testing

Targets:

- `/api/views`
- `/api/claps/[type]/[id]`
- `/api/visit`
- `/api/byte`
- `/api/blip`
- `/api/telegram/webhook`
- `/api/telegram/broadcast`

Tests:

- malformed body tests
- missing parameter tests
- missing header tests
- oversized payload tests
- replay and spam tests
- trust-boundary tests using forged IP/location payloads
- arbitrary-ID tests against `/api/views`
- content-existence tests across every clap content type
- secret-fallback tests for `/api/telegram/broadcast`

Pass criteria:

- invalid requests are rejected consistently
- no sensitive details leak in error bodies
- non-existent content identifiers are rejected where integrity matters
- request abuse is bounded by rate limiting or equivalent controls

### 3. Privacy testing

Targets:

- visitor analytics path
- logs
- Telegram notifications

Tests:

- confirm whether raw IP reaches DB
- confirm whether raw IP reaches logs
- confirm whether public API responses expose previous visitor metadata
- confirm data retention expectations
- confirm what visitor data is sent to Telegram owner notifications

Pass criteria:

- no unnecessary raw visitor identifiers are exposed
- logs are minimized
- public responses reveal only intentionally low-sensitivity information

### 4. Browser hardening testing

Targets:

- main pages
- dynamic content pages
- API responses

Tests:

- header inspection
- iframe/clickjacking attempt
- CSP validation
- MIME and mixed-content checks

Pass criteria:

- baseline hardening headers are present
- framing is restricted as intended
- script execution policy is explicit

### 5. Abuse-resistance testing

Targets:

- clap counts
- view counters
- visitor tracking
- secret-protected mutation routes

Tests:

- rapid repeated requests
- identity rotation for claps
- artificial view inflation
- arbitrary-ID view creation attempts
- forged visitor submissions
- repeated secret-authenticated requests to measure whether any abuse controls exist

Pass criteria:

- abuse is blocked, rate-limited, or explicitly documented as accepted low-value noise

## Test Environments

### Preferred

- Supabase staging or branch project
- non-production deployment with production-like configuration

### Acceptable

- local app against isolated Supabase dev data

### Avoid

- running destructive validation against live production datasets

## Reporting Format

Each test run should record:

- target
- exact request or SQL used
- expected result
- actual result
- security implication
- remediation needed if failed

## Exit Criteria

Security testing is complete for this cycle when:

- current high-severity issues are reproduced or disproven
- fixes are retested and confirmed
- accepted residual risks are documented explicitly
- the unified views/claps architecture has explicit integrity expectations rather than implicit assumptions
