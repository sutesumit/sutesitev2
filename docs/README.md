# Docs Filing System

Every document in `docs/` lives on exactly one shelf. This file is the filing system: it tells you where a new document goes, what to name it, and where everything is.

## Shelves

| Shelf | What lives there | Naming pattern | Frozen? |
|---|---|---|---|
| `reference/` | Living docs — how things work NOW. Updated in place. No dates. | `kebab-case.md` | No |
| `decisions/` | ADRs — why we chose it. | `ADR-NNN-kebab-case.md` | Yes (superseded → new ADR) |
| `plans/` | Forward-looking work guides. Dated, with a `Status:` header. | `YYYY-MM-DD-kebab-case.md` | Yes, + `Status:` header |
| `reports/` | Point-in-time records: audits, impl/debug reports, session docs. | `YYYY-MM-DD-kebab-case.md` | Yes — corrections go in a new dated doc |
| `feature-reports/` | Numbered feature docs. Grandfathered system with its own [README](feature-reports/README.md). | `NN-kebab-case.md` | Yes |
| `ideas/` | Half-formed future work. | `kebab-case.md` | No |
| `notes/` | Personal / non-technical working notes. | `kebab-case.md` (date prefix optional) | No |
| `archive/` | Executed or superseded docs. Frozen. | original name, lowercased | Yes |

**Document lifecycle:** `ideas/` → `plans/` → (work happens) → `reports/` or `feature-reports/` → durable knowledge graduates to `reference/` or `decisions/` → stale copies go to `archive/`.

Dates are the creation/session date. For an undated file, derive it with `git log --diff-filter=A --format=%as -- "docs/<file>"`.

## Decision tree: "I just wrote a document. Where does it go?"

1. It explains how an existing system works → `reference/`
2. It records a decision and its rationale → `decisions/` (next ADR number)
3. It guides work that is about to happen → `plans/` (dated filename + `Status:` header)
4. It records what was done or found → `reports/` (dated filename). Feature-specific implementation docs may instead extend `feature-reports/`.
5. It's a half-formed idea that might never happen → `ideas/`
6. It's a personal note, not engineering → `notes/`
7. It's superseded or a fully executed plan → `archive/` (+ one-line reason in the master index below)

## The rules

1. **Index rule** — adding a file requires adding its row to the master index below. This is the single maintenance ritual.
2. **Cross-link rule** — link to other docs by relative path. When a doc moves, fix inbound links in the same commit.
3. **Frozen docs stay frozen** — corrections to `plans/`, `reports/`, `decisions/`, or `archive/` go into a new dated doc with a "Supersedes:" link, not an edit in place.

## Master index

<!-- Skeleton: lists files at their pre-reorganization locations. Finalized after the move commits. -->

### `reference/`

| File | What it is |
|---|---|
| [API_REFERENCE.md](API_REFERENCE.md) | SuteSite API reference (routes, payloads, auth) |
| [blip-cli.md](blip-cli.md) | Blip CLI commands |
| [jot-cli.md](jot-cli.md) | jot CLI for bytes and blips |
| [METADATA_IMAGE_QA.md](METADATA_IMAGE_QA.md) | Metadata image QA |
| [METADATA_OWNERS_GUIDE.md](METADATA_OWNERS_GUIDE.md) | Metadata owner's guide |
| [METADATA_SYSTEM_REPORT.md](METADATA_SYSTEM_REPORT.md) | How the metadata system works |
| [TELEGRAM_NOTIFICATIONS_TECHNICAL_REPORT.md](TELEGRAM_NOTIFICATIONS_TECHNICAL_REPORT.md) | Telegram notification system technical reference |
| [GITHUB_ACTIONS_BLOQ_NOTIFICATIONS.md](GITHUB_ACTIONS_BLOQ_NOTIFICATIONS.md) | GitHub Actions workflow for bloq publication notifications |
| [reading-time-feature.md](reading-time-feature.md) | Reading time feature |

### `reports/`

| File | What it is |
|---|---|
| [AGENTIC_ENGINEERING_VIEWS_CLAPS_REFACTOR_2026-03-25.md](AGENTIC_ENGINEERING_VIEWS_CLAPS_REFACTOR_2026-03-25.md) | Session documentary of the views/claps refactor |
| [BLOQ_CONTENT_AUDIT_2026-03-22.md](BLOQ_CONTENT_AUDIT_2026-03-22.md) | Bloq content audit |
| [DEBUG_REPORT_VISIT_TRACKING.md](DEBUG_REPORT_VISIT_TRACKING.md) | Debug report: visit tracking API always returning same data |
| [METADATA_CONSISTENCY_AUDIT_2026-03-27.md](METADATA_CONSISTENCY_AUDIT_2026-03-27.md) | Metadata consistency audit |
| [PAGE_METADATA_IMPLEMENTATION_REPORT.md](PAGE_METADATA_IMPLEMENTATION_REPORT.md) | Page metadata implementation report |
| [PAGINATION_SEARCH_IMPLEMENTATION_REPORT.md](PAGINATION_SEARCH_IMPLEMENTATION_REPORT.md) | Pagination and search implementation report |
| [SECURITY_REPORT_2026-03-21.md](SECURITY_REPORT_2026-03-21.md) | Security report |
| [SITEMAP_RSS_REPORT.md](SITEMAP_RSS_REPORT.md) | Sitemap and RSS feed implementation report |
| [TESTING_INFRASTRUCTURE_REPORT.md](TESTING_INFRASTRUCTURE_REPORT.md) | Testing infrastructure report |
| [follow-up-implementation-notes-2026-03-22.md](follow-up-implementation-notes-2026-03-22.md) | Follow-up (second pass) implementation notes for the telegram/jotbot refactor |
| [telegram-jotbot-shared-infrastructure-refactor-2026-03-22.md](telegram-jotbot-shared-infrastructure-refactor-2026-03-22.md) | Telegram + jotbot shared infrastructure refactor |
| [security-audit-2026-03-21/](security-audit-2026-03-21/README.md) | Security audit package (4 docs + README) |

### `decisions/`

| File | What it is |
|---|---|
| [decisions/ADR-001-github-heatmap-month-fetching.md](decisions/ADR-001-github-heatmap-month-fetching.md) | ADR-001: Fetch GitHub heatmap data one month at a time |

### `plans/`

| File | What it is |
|---|---|
| [DATABASE_SECURITY_ANALYSIS.md](DATABASE_SECURITY_ANALYSIS.md) | Database security and architectural refactoring roadmap |
| [SOLID_REFACTORING_PLAN.md](SOLID_REFACTORING_PLAN.md) | SOLID refactoring plan |

### `archive/`

| File | Reason archived |
|---|---|
| [MIGRATION_BLIP_TO_BYTE.md](MIGRATION_BLIP_TO_BYTE.md) | Executed — bytes/blips split is live |
| [PAGE_METADATA_FIX_PLAN.md](PAGE_METADATA_FIX_PLAN.md) | Executed — superseded by implementation report + metadata owner's guide |
| [PLAN_BYTES_AND_BLIPS_TELEGRAM_CLI.md](PLAN_BYTES_AND_BLIPS_TELEGRAM_CLI.md) | Executed — documented in `reference/jot-cli.md` + telegram reference |

### `notes/`

| File | What it is |
|---|---|
| [react-nexus-2026-speaker-dms.md](react-nexus-2026-speaker-dms.md) | React Nexus 2026 speaker outreach notes |

### `feature-reports/`

Numbered feature docs with their own index: [feature-reports/README.md](feature-reports/README.md)

| File | What it is |
|---|---|
| [feature-reports/01-blip-views-counter.md](feature-reports/01-blip-views-counter.md) | Blip views counter |
| [feature-reports/02-visitor-time-ago.md](feature-reports/02-visitor-time-ago.md) | Visitor time-ago display |
| [feature-reports/06-project-counters.md](feature-reports/06-project-counters.md) | Project counters |
| [feature-reports/09-pagination-search.md](feature-reports/09-pagination-search.md) | Pagination and search feature |

### `ideas/`

| File | What it is |
|---|---|
| [ideas/live-bloq-learning-checklist.md](ideas/live-bloq-learning-checklist.md) | Live bloq session learning checklist |
| [ideas/live-bloq-plan.md](ideas/live-bloq-plan.md) | Telegram live bloq sessions plan |
| [ideas/live-bloq-test-plan.md](ideas/live-bloq-test-plan.md) | Live bloq comprehensive test plan |
