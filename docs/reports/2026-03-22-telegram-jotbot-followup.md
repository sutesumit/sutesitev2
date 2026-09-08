# Follow-up Implementation Notes

This note captures the second pass after the shared-service refactor.

## Implemented

- hardened the shared transport contract around a neutral shared module:
  - `shared/api-contracts.ts`
- introduced a generated-style shared client module:
  - `shared/generated/sutesite-client.ts`
- moved `jotbot` to consume the generated-style client adapter instead of owning the request wiring itself:
  - `jotbot/src/lib/api.ts`
- added route-level contract tests for the refactored byte and blip create/list paths
- added env-gated Supabase repository integration tests for byte and blip CRUD

## Why the client is described as generated-style

The client module is structured the way a generated client would be structured:

- central request function
- strongly typed operations
- shared schema-driven response types

It is still maintained locally because no codegen dependency was introduced in this pass. This keeps the repo self-contained while preparing the final move to true OpenAPI-driven generation.

## How to run the new integration tests

Set:

- `RUN_SUPABASE_INTEGRATION_TESTS=true`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Then run the Vitest suite in an environment where Vite/Vitest subprocess startup is permitted.

## Remaining final step

The last strong follow-up is to replace the generated-style client with actual OpenAPI code generation once the OpenAPI document is treated as the canonical source of truth in CI.
