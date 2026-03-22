# Telegram + Jotbot Shared Infrastructure Refactor

Date: 2026-03-22

## Why This Refactor Exists

The `byte` and `blip` system had grown into three partially overlapping implementations:

- Next.js API routes performed CRUD directly against Supabase.
- Telegram bot handlers performed CRUD through a Telegram-specific repository.
- `jotbot` used a separate handwritten HTTP client contract.

That shape worked, but it had a hidden tax:

- the same business rules lived in multiple places
- notification side effects were repeated in route handlers and bot handlers
- transport layers knew too much about persistence
- the CLI contract could drift from the actual API

For a senior developer, the diagnosis is straightforward: the system had adapter logic, orchestration logic, and persistence concerns mixed together. That creates coupling, makes behavior harder to reason about, and raises the odds of regression when one entry point changes but another one does not.

For a junior developer, the practical version is simpler: the app had too many places that all knew how to "create a byte" or "create a blip". That means every future change becomes a search-and-hope exercise.

## Mental Model First

Before getting into modules and principles, it helps to establish the mental model of the system.

### Zoomed Out: The Whole System

```text
                               EXTERNAL SURFACES

   Telegram user            jotbot CLI             frontend visitor event       GitHub Actions
        |                      |                           |                         |
        | Telegram update      | HTTP JSON                 | POST /api/visit         | POST /api/telegram/broadcast
        v                      v                           v                         v

   +-------------------------------------------------------------------------------------------+
   |                                      TRANSPORT LAYER                                      |
   |-------------------------------------------------------------------------------------------|
   | Telegram webhook route + bot handlers | byte/blip API routes | visit route | broadcast route |
   +---------------------------------------+----------------------+-------------+----------------+
                                                |
                                                | delegates use-cases
                                                v
   +-------------------------------------------------------------------------------------------+
   |                                   APPLICATION LAYER                                       |
   |-------------------------------------------------------------------------------------------|
   | ByteService | BlipService | VisitService | BloqNotificationService                        |
   +------------------------------------------+------------------------------------------------+
                                              |
                        +---------------------+----------------------+
                        |                                            |
                        v                                            v
   +----------------------------------------+      +--------------------------------------------+
   |           PERSISTENCE ADAPTERS         |      |          OUTBOUND NOTIFICATION ADAPTER      |
   |----------------------------------------|      |--------------------------------------------|
   | byte repository | blip repository      |      | Telegram notifier                          |
   +-----------------+----------------------+      +--------------------+-----------------------+
                     |                                                  |
                     v                                                  v
               +-----------+                                      +-------------+
               | Supabase  |                                      | Telegram API|
               +-----------+                                      +-------------+
```

The point of this layout is simple:

- inputs come from different places
- business behavior happens in one shared layer
- infrastructure work happens at the edges

That is the structural reason the refactor improves maintainability.

### Zoomed In: Before vs After

```text
BEFORE

  jotbot ------> API route ----------------------------> Supabase
                    |
                    +------ inline broadcast ----------> Telegram

  Telegram -----> bot handler -> telegram repository --> Supabase
                    |
                    +------ inline broadcast ----------> Telegram

  visit route -----------------------------------------> Telegram
  bloq broadcast route --------------------------------> Telegram


AFTER

  jotbot ------> API route ----+
                               |
  Telegram -----> bot handler -+----> shared service ----> repository ----> Supabase
                               |
  visit route -----------------+
                               +----> notifier ----------> Telegram
  bloq broadcast route --------+
```

This "before vs after" diagram is the shortest way to understand the refactor:

- before: every entry point owned too much logic
- after: every entry point delegates to the same core behavior

## Why The New Shape Is More Efficient

Efficiency here does not only mean runtime efficiency. It also means change efficiency.

```text
OLD CHANGE COST

  "Change byte creation behavior"
      |
      +--> API route
      +--> Telegram repository
      +--> Telegram handler
      +--> maybe CLI assumptions


NEW CHANGE COST

  "Change byte creation behavior"
      |
      +--> ByteService
      +--> only touch repository or notifier if the change truly belongs there
```

This is the practical effect of the refactor:

- fewer edits per feature change
- fewer hidden dependency paths
- lower chance of transport drift
- easier testing because the use-case has one home

## What Changed

### 1. Shared application services were introduced

New service modules now own the use-cases:

- `src/lib/byte/service.ts`
- `src/lib/blip/service.ts`
- `src/lib/visit/service.ts`
- `src/lib/bloq/service.ts`

These services are the place where we now answer questions like:

- what counts as valid input?
- when should a Telegram notification be sent?
- what error should be returned when a record is missing?

This is the core architectural shift. The routes and the Telegram handlers no longer own the CRUD workflow. They delegate to services.

### Zoomed In: Service-Centric Flow

```text
                       ONE USE-CASE, MANY INPUTS

  Telegram /byte command           HTTP POST /api/byte            plain Telegram message
           |                               |                               |
           +---------------+---------------+-------------------------------+
                           |
                           v
                     ByteService.createByte()
                           |
                 +---------+----------+
                 |                    |
                 v                    v
      validate and normalize     repository.createByte()
                                           |
                                           v
                                       Supabase
                                           |
                                           v
                                 notifier.notifyByteCreated()
                                           |
                                           v
                                        Telegram
```

This diagram is worth studying because it shows the actual design intent:

- many inputs
- one use-case
- one persistence path
- one outbound notification path

### 2. Persistence was centralized

The byte and blip repositories remain the canonical persistence adapters:

- `src/lib/byte/repository.ts`
- `src/lib/blip/repository.ts`

The former Telegram-specific CRUD repository was removed:

- `src/lib/telegram/repository.ts`

That removal matters because it restores one rule that makes systems easier to maintain:

> there should be one obvious place to change database behavior for a feature

### Zoomed In: Repository Boundary

```text
             WHAT THE SERVICE KNOWS                  WHAT THE REPOSITORY KNOWS

        "I need to create a valid byte"        "I know how bytes are stored in Supabase"

                    service  --------------------------------------> repository
                                                                         |
                                                                         v
                                                            supabase.from("bytes")...
```

This is an important mental split.

The service should not know SQL-like details.
The repository should not know Telegram or HTTP details.

### 3. Outbound Telegram delivery was centralized

A shared notifier abstraction now handles outbound delivery:

- `src/lib/notifications/types.ts`
- `src/lib/notifications/formatters.ts`
- `src/lib/notifications/telegram-notifier.ts`

This notifier now serves four flows:

- byte creation broadcasts
- blip creation broadcasts
- visitor notifications
- bloq publish notifications

Before this refactor, the channel/DM send logic was repeated in multiple places. After the refactor, the services decide when to notify, and the notifier decides how to notify.

That separation is a clean SOLID-aligned split:

- services own orchestration
- notifier owns delivery

### Zoomed In: Telegram Is Two Different Things

```text
                         TELEGRAM HAS TWO ROLES

   1. Inbound control surface                    2. Outbound delivery channel

   Telegram user                                Application events
        |                                             |
        v                                             v
   webhook -> bot -> handlers -> services       services -> notifier -> Telegram API
```

This distinction matters because the old code blurred these two roles together.

The refactor separates them:

- bot handlers are for receiving commands
- notifier is for sending messages

### 4. Transport layers were thinned

The API routes now do the minimum useful work:

- authenticate
- parse the request
- call a service
- map the result to JSON

The Telegram command handlers now do the equivalent Telegram version:

- authorize the user
- parse command arguments
- call a service
- format a reply

This is important because HTTP and Telegram are now just two different input adapters for the same underlying use-cases.

### Zoomed In: Thin Transport Rule

```text
   ROUTE / HANDLER RESPONSIBILITY

   request comes in
       |
       +--> auth
       +--> parse input
       +--> call service
       +--> map result to response

   and stop there
```

If a route starts doing persistence logic or notification orchestration directly, it is violating the new design.

### 5. The API contract was shared with `jotbot`

A neutral shared contract file now exists:

- `shared/api-contracts.ts`

It is re-exported for the app at:

- `src/lib/api/contracts.ts`

And consumed by the CLI at:

- `jotbot/src/lib/api.ts`

This started as shared DTO alignment and then moved one step further in the follow-up pass:

- shared DTOs now live in `shared/api-contracts.ts`
- a generated-style client now lives in `shared/generated/sutesite-client.ts`
- `jotbot` now consumes that shared client adapter

This is not full external code generation yet, but it is no longer a purely handwritten CLI transport layer either. The client structure now mirrors what an eventual OpenAPI-generated client would look like.

### Zoomed In: Contract Sharing

```text
                 SHARED CONTRACT / SHARED CLIENT SHAPE

          +--------------------------+
          | shared/api-contracts.ts  |
          +------------+-------------+
                       |
          +------------+-------------+
          |                          |
          v                          v
   Next app response types    jotbot client types


          +--------------------------------------+
          | shared/generated/sutesite-client.ts  |
          +----------------+---------------------+
                           |
                           v
                      jotbot/src/lib/api.ts
```

This gives the reader a useful rule of thumb:

- contracts define the shapes
- the generated-style client defines the request behavior
- the CLI should not invent API shapes on its own

## Architectural Outcome

### Before

```text
jotbot -> HTTP routes -> Supabase
Telegram -> telegram handlers -> telegram repository -> Supabase
HTTP routes -> inline Telegram broadcasts
Telegram handlers -> inline Telegram broadcasts
visit route -> inline visitor notification
bloq broadcast route -> inline channel notification
```

### After

```text
jotbot -> HTTP routes -> shared services -> repositories -> Supabase
Telegram -> bot handlers -> shared services -> repositories -> Supabase
visit route -> visit service -> notifier
bloq broadcast route -> bloq notification service -> notifier

shared services -> Telegram notifier -> Telegram API
```

This is a major improvement in dependency direction.

The intended rule is now:

- transports depend on services
- services depend on interfaces/ports and repositories
- repositories depend on Supabase
- notifiers depend on Telegram delivery

Transports no longer own the core behavior.

### Zoomed Out: Final Dependency Direction

```text
   transports  --->  services  --->  repositories
                         |
                         +------->  notifier

   repositories ---> Supabase
   notifier -----> Telegram API
```

This is the dependency graph that the refactor was trying to create.

It is intentionally directional:

- inward layers should not depend on outer transport details
- shared business logic should not depend on Telegram command parsing
- persistence should not depend on HTTP response formatting

## SOLID Analysis

### SOLID Map Diagram

```text
   S  Single Responsibility
      routes = transport
      services = use-cases
      repositories = persistence
      notifier = delivery

   O  Open/Closed
      add new notifier adapter without rewriting services

   L  Liskov Substitution
      fake repository / fake notifier can stand in for real ones in tests

   I  Interface Segregation
      small focused contracts: ByteRepository, BlipRepository, TelegramNotifier

   D  Dependency Inversion
      services depend on abstractions, not Supabase or grammy directly
```

This kind of map helps the reader connect abstract design principles to concrete files and modules.

### Single Responsibility Principle

The refactor moves the code closer to SRP:

- routes handle transport concerns
- handlers handle command parsing and reply mapping
- services handle use-case orchestration
- repositories handle data access
- notifier handles outbound delivery

The reason this matters is that each module now has a reason to change that is easier to explain.

Example:

- if the database schema changes, the repositories change
- if Telegram channel formatting changes, the notifier/formatters change
- if the business rule for valid blips changes, the blip service or validation changes

That makes bugs easier to localize.

```text
SRP SMELL CHECK

If a file answers too many of these questions, it is probably wrong:

- how do I parse the request?
- how do I validate the use-case?
- how do I store the data?
- how do I notify Telegram?
- how do I format the response?
```

The old design had that smell in several places. The new design reduces it.

### Open/Closed Principle

The notifier abstraction makes the outbound delivery channel easier to extend.

If later we want Slack, Discord, or email notifications, the service orchestration does not need to be rewritten. A new adapter can be added instead of changing every caller.

This is the practical meaning of OCP: behavior expands through new modules, not through repeated edits everywhere.

```text
WITHOUT OCP
  add Slack notifications -> edit many handlers/routes

WITH OCP
  add Slack notifier adapter -> wire service to new notifier
```

### Liskov Substitution Principle

The services are written so they can work with alternative repository or notifier implementations. In tests, fake repositories and fake notifiers can stand in for the real adapters.

That makes substitution safe and useful, which is the part of LSP that usually matters most in application code.

```text
TEST SUBSTITUTION MODEL

  ByteService
     |
     +--> FakeByteRepository
     +--> FakeTelegramNotifier

same service logic, different adapters
```

### Interface Segregation Principle

The new interfaces are intentionally small:

- byte repository only exposes byte persistence operations
- blip repository only exposes blip persistence operations
- notifier only exposes the Telegram notification operations the app uses

This avoids giant "god interfaces" that force a caller to know more than it needs.

```text
GOOD
  ByteRepository
  BlipRepository
  TelegramNotifier

BAD
  AppInfrastructureManagerThatDoesEverything
```

### Dependency Inversion Principle

This is the most meaningful principle in this refactor.

Previously, business workflows depended directly on concrete details:

- `supabase.from(...)`
- `bot.api.sendMessage(...)`

Now, the services depend on repository and notifier abstractions. The concrete adapters live at the edges.

That lowers coupling and improves testability.

```text
OLD
  service-ish logic -> supabase.from(...)
  service-ish logic -> bot.api.sendMessage(...)

NEW
  service -> repository interface
  service -> notifier interface
```

## Testing Strategy Added By The Refactor

The refactor intentionally created seams that are easier to test than the previous design.

### Zoomed Out: Test Pyramid For This Architecture

```text
                           /\
                          /  \        end-to-end workflow tests
                         /----\
                        /      \      route contract tests
                       /--------\
                      /          \    repository integration tests
                     /------------\
                    /              \  service unit tests
                   /----------------\
```

The bottom of the pyramid is where most confidence should come from:

- fast service tests
- clear route tests
- selective repository integration tests

The top should exist, but stay smaller and more focused.

### 1. Service unit tests

Added:

- `src/lib/byte/__tests__/service.test.ts`
- `src/lib/blip/__tests__/service.test.ts`

These tests verify that:

- validation happens before persistence
- services orchestrate persistence and notification correctly
- invalid inputs are rejected without side effects

This is high-value coverage because it tests the actual business workflow independent of HTTP or Telegram.

```text
SERVICE TEST MODEL

  test input
     |
     v
  service
     |
     +--> fake repository
     +--> fake notifier

assert:
- validation happened
- persistence call happened
- notifier call happened or did not happen
```

### 2. Telegram handler tests

Updated:

- `src/lib/telegram/__tests__/handlers.test.ts`

These tests now assert that the handlers call the shared services rather than the old repository layer. This is important because the refactor goal was architectural, not just cosmetic.

In other words, the test now validates the new dependency direction.

### 3. Formatter / notification tests

Updated:

- `src/lib/telegram/__tests__/telegram-notifications.test.ts`

These tests now verify:

- shared formatting still produces the expected message shape
- unsafe content is HTML-escaped in formatter output

That second part matters because message formatting bugs often hide until runtime, especially when Telegram HTML parsing is involved.

### 4. Route-level test for bloq broadcasting

Added:

- `src/app/api/telegram/__tests__/broadcast-route.test.ts`

This test verifies that the broadcast route:

- rejects invalid secrets
- delegates publishing to the shared service

That ensures the route stayed thin during the refactor.

### 5. Route contract tests for byte and blip CRUD

Added:

- `src/app/api/byte/__tests__/route.test.ts`
- `src/app/api/blip/__tests__/route.test.ts`

These tests verify that the refactored routes still:

- enforce auth for write operations
- return the expected response shapes
- delegate to the shared services instead of owning business logic

### 6. Repository integration test scaffolding

Added:

- `src/lib/byte/__tests__/repository.integration.test.ts`
- `src/lib/blip/__tests__/repository.integration.test.ts`

These tests are intentionally env-gated. They are meant to run only when a real Supabase test environment is configured.

### Zoomed In: Why Integration Tests Are Env-Gated

```text
unit test
  fake dependencies
  always safe to run

integration test
  real Supabase credentials
  real schema expectations
  must not run accidentally against the wrong environment
```

That is why the repository integration tests are opt-in instead of unconditional.

## Validation Status

### Completed verification

Static verification passed:

- `npx tsc --noEmit`
- `npx tsc --noEmit -p jotbot/tsconfig.json`

This confirms the refactor compiles for both the Next.js app and the CLI package.

Additional verification scaffolding now exists in the repository:

- service unit tests
- route-level contract tests
- env-gated repository integration tests

Those tests still need to be executed in a runtime environment that allows Vite/Vitest startup and, for integration coverage, supplies the required Supabase credentials.

### Incomplete verification

`vitest` could not be executed in this sandbox because the environment blocks a Windows subprocess spawn used during Vite/Vitest startup:

```text
Error: spawn EPERM
```

This is an execution-environment limitation, not a TypeScript compile failure in the code itself.

The new tests are committed to the codebase, but they still need to be run in a local or CI environment that allows the Vite/Vitest startup path.

### Mental Model: Compile-Time vs Runtime Validation

```text
TYPECHECK PASSED
  means:
  - modules connect correctly
  - exports/imports are consistent
  - types line up

TESTS NOT EXECUTED HERE
  means:
  - runtime behavior still needs local/CI execution
  - integration coverage still depends on environment support
```

This distinction is useful because readers often treat "TypeScript passes" and "the system is fully validated" as the same thing. They are not.

## Follow-Up Work Recommended

### 1. Replace the generated-style CLI client with a true generated client

The current follow-up introduced a generated-style shared client:

- `shared/generated/sutesite-client.ts`

This is a stronger position than a handwritten transport layer, but the stronger long-term move is still to generate that client directly from `openapi.yaml`.

Why:

- the API spec becomes the source of truth
- request/response drift is reduced further
- future CRUD expansion stays cheaper
- client updates become reproducible instead of manually maintained

### 2. Run repository integration tests against a dedicated test database

The current refactor and follow-up now include repository integration test scaffolding, but those tests still need a proper Supabase test environment to become part of regular verification.

The next expansion should cover:

- create/get/update/delete
- pagination
- search
- tag filtering

### 3. Add end-to-end flow tests

The highest-value end-to-end scenarios are:

- Telegram `/byte`
- Telegram `/blip`
- `jotbot byte add`
- `jotbot blip edit`
- visitor event notification
- bloq publish notification

These should mock external Telegram delivery but exercise the full app-side orchestration.

### 4. Upgrade route contract tests to full schema validation

This is the next step that would turn shared DTOs and route-shape checks into full contract enforcement.

That would catch:

- route response drift
- undocumented status codes
- schema mismatches that silently break the CLI

## Summary

This refactor was not primarily about moving files around. It was about changing the direction of responsibility in the system.

The important improvements are:

- one shared byte/blip application layer
- one shared outbound Telegram notification layer
- one canonical persistence path per feature
- thinner routes and Telegram handlers
- a shared contract used by the web app and CLI
- a generated-style shared client for the CLI
- new tests that validate the new seams

For a senior developer, the win is lower coupling, better composition, and cleaner extension points.

For a junior developer, the win is easier reasoning:

- if you want to change business behavior, go to the service
- if you want to change database behavior, go to the repository
- if you want to change Telegram output, go to the notifier/formatters
- if you want to change HTTP or bot parsing, go to the transport adapter

That is the real value of the refactor.

### Final Mental Model

```text
INPUTS
  Telegram
  HTTP
  CLI
  visitor events
  GitHub Actions

        |
        v

TRANSPORTS
  parse + auth + map

        |
        v

SERVICES
  own behavior

        |
        +--------------------+
        v                    v

REPOSITORIES           NOTIFIER
  own storage          owns Telegram delivery

        |                    |
        v                    v

    Supabase            Telegram API
```

If the reader remembers only one diagram from this document, it should be this one.
