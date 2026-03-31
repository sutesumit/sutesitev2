# Further Testing Plan

## Goal

Close the remaining unknowns that cannot be resolved from current source review alone, especially current Supabase state and deployed response behavior.

## Evidence Boundary

This follow-up phase is for items that still require live verification:

- current `content_views` RLS and grants
- current `claps` policies and function grants
- current live definitions of unified view and clap RPCs
- current `visits` DB exposure
- production response headers

## Highest-Value Follow-Up Checks

### 1. Verify current `content_views` posture

Objective:

- confirm whether `content_views` currently has RLS enabled
- confirm what `anon`, `authenticated`, and `service_role` can read or mutate directly

Actions:

- inspect `pg_tables` or equivalent metadata for `content_views`
- inspect `pg_policies` for `content_views`
- inspect direct grants on `content_views`

Expected output:

- RLS enabled/disabled status
- exact policy list
- exact grant matrix by role

### 2. Verify current `claps` posture and function grants

Objective:

- determine whether the old broad `claps` policy concern still exists
- determine who can execute unified clap helper functions directly

Actions:

- inspect `pg_policies` for `claps`
- inspect grants on `claps`
- inspect routine grants for `get_claps`, `get_user_claps`, and `upsert_clap`

Expected output:

- current policy text and role coverage
- current table grants
- current routine grant matrix

### 3. Validate whether unified RPCs enforce real content existence

Objective:

- determine whether the database layer rejects arbitrary identifiers even when the route layer does not

Actions:

- safely test view and clap RPCs against non-existent bloq, blip, byte, and project identifiers in a non-production environment
- record whether rows are created, rejected, or normalized away

Expected output:

- operation-by-operation result matrix
- note whether the integrity risk lives only in the app layer or in both app and DB layers

### 4. Re-verify `visits` privacy posture in the live database

Objective:

- confirm whether the March 21 DB-level anonymous exposure still exists

Actions:

- inspect policies and grants on `visits`
- inspect grants for `get_recent_visit_ids` and `get_unique_visitor_count`
- test whether anon credentials can directly read recent visit data in a safe environment

Expected output:

- current access matrix for `visits`
- routine access matrix
- direct API behavior for anon callers

### 5. Validate actual production headers

Objective:

- confirm whether infrastructure injects security headers not visible in the repo

Actions:

- inspect deployed responses for main pages and key API routes
- record CSP, frame protections, referrer policy, HSTS, content-type protections, and permissions policy

Expected output:

- response header matrix for representative endpoints

### 6. Dependency review

Objective:

- identify known vulnerabilities or high-risk package exposure

Actions:

- run a dependency audit against the current lockfile
- review packages involved in markdown/MDX processing, bot/webhook handling, and remote network calls

Expected output:

- dependency findings with severity and upgrade path

## Recommended Order

1. `content_views` and `claps` policies/grants
2. unified RPC existence enforcement
3. `visits` DB exposure
4. production header inspection
5. dependency audit

## Completion Criteria

This phase is complete when:

- current public data surfaces are explicitly classified
- current unified RPC caller permissions are known
- `content_views`, `claps`, and `visits` have current verified access matrices
- production browser/API headers are known
- remaining risk is limited to accepted tradeoffs rather than unknown live posture
