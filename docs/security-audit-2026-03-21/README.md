# Security Audit Package

Date: 2026-03-21
Updated for current repo state: 2026-03-29
Scope: Revision of the March 21 follow-up package for `v2.sutesite`, using current repository code plus historical audit notes already present in this repo.

## Contents

- [01-current-issues.md](/Users/Sute/Documents/v2.sutesite/docs/security-audit-2026-03-21/01-current-issues.md)
- [02-further-testing-plan.md](/Users/Sute/Documents/v2.sutesite/docs/security-audit-2026-03-21/02-further-testing-plan.md)
- [03-security-testing-plan.md](/Users/Sute/Documents/v2.sutesite/docs/security-audit-2026-03-21/03-security-testing-plan.md)
- [04-recommendations-and-tradeoffs.md](/Users/Sute/Documents/v2.sutesite/docs/security-audit-2026-03-21/04-recommendations-and-tradeoffs.md)

## Purpose

This folder now captures:

- current repo-verified security issues
- March 21 findings that are only partially current or no longer current
- follow-up checks that still require live Supabase or production verification
- practical remediation options and tradeoffs

## Evidence Status

Each finding in this package should be read with one of these evidence labels:

- `repo-verified in this pass`: confirmed from current application code or current tests in this workspace
- `inferred from later internal docs/history`: supported by later repo documentation or test history, but not re-proven live in this pass
- `still requires live Supabase verification`: depends on current database metadata, grants, policies, function definitions, or production headers that were not re-queried in this pass

## Priority Summary

Highest-priority issues at the moment:

1. visitor tracking still trusts client-supplied IP/location data and returns prior-visitor metadata
2. `/api/views` can create counts for arbitrary valid `type`/`id` pairs, including non-existent content identifiers
3. `/api/claps/[type]/[id]` only validates existence for `bloq`, while other content types go straight to privileged RPC calls
4. public counters remain easy to game through unauthenticated requests and client-controlled fingerprints
5. app routes still use `SUPABASE_SERVICE_ROLE_KEY`, so route bugs keep a high blast radius
6. shared-secret auth is still thin, and there is still no visible rate limiting or baseline browser hardening headers

## Current vs Historical Status

Examples of findings that changed since the original March 21 package:

- the old `project_views` issue is stale because the views system moved to unified `content_views` and `/api/views`
- the old visitor and Telegram debug-logging issue appears resolved in current code
- the old broadcast-secret reuse finding is only partially current because the route now prefers `TELEGRAM_BROADCAST_SECRET` and only falls back to `TELEGRAM_BOT_TOKEN`

## Relationship To Existing Reports

This package supplements:

- [SECURITY_REPORT_2026-03-21.md](/Users/Sute/Documents/v2.sutesite/docs/SECURITY_REPORT_2026-03-21.md)
- [DATABASE_SECURITY_ANALYSIS.md](/Users/Sute/Documents/v2.sutesite/docs/DATABASE_SECURITY_ANALYSIS.md)

This folder is intended to remain the operational follow-up package for remediation and verification, but it now reflects the current repository rather than preserving the March 21 system snapshot unchanged.
