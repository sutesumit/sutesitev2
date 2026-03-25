# Security Audit Package

Date: 2026-03-21
Scope: Application security review for `v2.sutesite`, including current app code and live Supabase policy/function metadata shared during this session.

## Contents

- [01-current-issues.md](/Users/Sute/Documents/v2.sutesite/docs/security-audit-2026-03-21/01-current-issues.md)
- [02-further-testing-plan.md](/Users/Sute/Documents/v2.sutesite/docs/security-audit-2026-03-21/02-further-testing-plan.md)
- [03-security-testing-plan.md](/Users/Sute/Documents/v2.sutesite/docs/security-audit-2026-03-21/03-security-testing-plan.md)
- [04-recommendations-and-tradeoffs.md](/Users/Sute/Documents/v2.sutesite/docs/security-audit-2026-03-21/04-recommendations-and-tradeoffs.md)

## Purpose

This folder captures:

- confirmed current security issues
- areas that still require deeper verification
- a practical test plan for validating the system
- remediation options with tradeoffs, not just idealized fixes

## Priority Summary

Highest-priority issues at the moment:

1. `project_views` has RLS disabled and is likely publicly writable/readable through direct Supabase access.
2. `claps` policies allow overly broad updates and do not enforce real row ownership.
3. `visits` intentionally exposes recent visit data and stores client-supplied visitor data.
4. several `SECURITY DEFINER` functions are missing fixed `search_path`.
5. app routes use `SUPABASE_SERVICE_ROLE_KEY`, so route bugs have high blast radius.

## Relationship To Existing Reports

This package supplements:

- [SECURITY_REPORT_2026-03-21.md](/Users/Sute/Documents/v2.sutesite/docs/SECURITY_REPORT_2026-03-21.md)
- [DATABASE_SECURITY_ANALYSIS.md](/Users/Sute/Documents/v2.sutesite/docs/DATABASE_SECURITY_ANALYSIS.md)

This folder is intended to be the operational follow-up package for remediation and verification.
