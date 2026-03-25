# Security Testing Plan

## Objective

Verify that the current vulnerabilities are reproducible, that remediations actually work, and that new controls do not create hidden regressions.

## Testing Streams

### 1. Database security testing

Targets:

- `project_views`
- `claps`
- `visits`
- public `SECURITY DEFINER` functions
- storage objects and buckets

Tests:

- direct `anon` read against each public table
- direct `anon` insert/update against each public table
- direct `authenticated` read/write where relevant
- direct execution attempts for public functions
- attempt to mutate clap rows belonging to a different fingerprint

Pass criteria:

- no direct public writes except those explicitly intended
- no cross-row mutation on `claps`
- no anonymous access to sensitive visit rows
- no unexpected direct function execution path

### 2. Application API testing

Targets:

- `/api/visit`
- `/api/claps/[type]/[id]`
- `/api/*/views/*`
- `/api/blip`
- `/api/byte`
- `/api/telegram/webhook`
- `/api/telegram/broadcast`

Tests:

- malformed body tests
- missing header tests
- oversized payload tests
- replay and spam tests
- trust-boundary tests using forged IP/location payloads
- error-message leakage checks

Pass criteria:

- invalid requests are rejected consistently
- no sensitive details leak in error bodies
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
- CSP violation checks
- mixed-content and MIME checks

Pass criteria:

- baseline hardening headers are present
- framing is restricted as intended
- script execution policy is explicit

### 5. Abuse-resistance testing

Targets:

- clap counts
- view counters
- visitor tracking

Tests:

- rapid repeated requests
- identity rotation for claps
- artificial view inflation
- forged visitor submissions

Pass criteria:

- abuse is either blocked, rate-limited, or explicitly documented as accepted low-value noise

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

- high-severity issues are reproduced or disproven
- fixes are retested and confirmed
- accepted residual risks are documented explicitly
