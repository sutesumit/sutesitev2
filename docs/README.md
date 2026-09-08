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

### `reference/`

| File | What it is |
|---|---|
| [reference/api-reference.md](reference/api-reference.md) | SuteSite API reference (routes, payloads, auth) |
| [reference/blip-cli.md](reference/blip-cli.md) | Blip CLI commands |
| [reference/jot-cli.md](reference/jot-cli.md) | jot CLI for bytes and blips |
| [reference/metadata-image-qa.md](reference/metadata-image-qa.md) | Metadata image QA |
| [reference/metadata-owners-guide.md](reference/metadata-owners-guide.md) | Metadata owner's guide |
| [reference/metadata-system.md](reference/metadata-system.md) | How the metadata system works |
| [reference/telegram-notifications.md](reference/telegram-notifications.md) | Telegram notification system technical reference |
| [reference/github-actions-bloq-notifications.md](reference/github-actions-bloq-notifications.md) | GitHub Actions workflow for bloq publication notifications |
| [reference/reading-time.md](reference/reading-time.md) | Reading time feature |

### `reports/`

| File | What it is |
|---|---|
| [reports/2026-03-25-views-claps-refactor-session.md](reports/2026-03-25-views-claps-refactor-session.md) | Session documentary of the views/claps refactor |
| [reports/2026-03-22-bloq-content-audit.md](reports/2026-03-22-bloq-content-audit.md) | Bloq content audit |
| [reports/2026-03-12-debug-visit-tracking.md](reports/2026-03-12-debug-visit-tracking.md) | Debug report: visit tracking API always returning same data |
| [reports/2026-03-27-metadata-consistency-audit.md](reports/2026-03-27-metadata-consistency-audit.md) | Metadata consistency audit |
| [reports/2026-03-14-page-metadata-implementation.md](reports/2026-03-14-page-metadata-implementation.md) | Page metadata implementation report |
| [reports/2026-03-17-pagination-search-implementation.md](reports/2026-03-17-pagination-search-implementation.md) | Pagination and search implementation report |
| [reports/2026-03-21-security-report.md](reports/2026-03-21-security-report.md) | Security report |
| [reports/2026-03-23-sitemap-rss.md](reports/2026-03-23-sitemap-rss.md) | Sitemap and RSS feed implementation report |
| [reports/2026-03-17-testing-infrastructure.md](reports/2026-03-17-testing-infrastructure.md) | Testing infrastructure report |
| [reports/2026-03-22-telegram-jotbot-followup.md](reports/2026-03-22-telegram-jotbot-followup.md) | Follow-up (second pass) implementation notes for the telegram/jotbot refactor |
| [reports/2026-03-22-telegram-jotbot-infrastructure-refactor.md](reports/2026-03-22-telegram-jotbot-infrastructure-refactor.md) | Telegram + jotbot shared infrastructure refactor |
| [reports/security-audit-2026-03-21/](reports/security-audit-2026-03-21/README.md) | Security audit package (4 docs + README) |

### `decisions/`

| File | What it is |
|---|---|
| [decisions/ADR-001-github-heatmap-month-fetching.md](decisions/ADR-001-github-heatmap-month-fetching.md) | ADR-001: Fetch GitHub heatmap data one month at a time |
| [decisions/ADR-002-keep-views-and-claps-separate.md](decisions/ADR-002-keep-views-and-claps-separate.md) | ADR-002: Keep views and claps as separate systems |

### `plans/`

| File | What it is |
|---|---|
| [plans/2026-03-10-solid-refactoring.md](plans/2026-03-10-solid-refactoring.md) | SOLID refactoring plan — Status: partially executed |
| [plans/2026-03-14-database-security-roadmap.md](plans/2026-03-14-database-security-roadmap.md) | Database security and architectural refactoring roadmap — Status: partially executed |

### `archive/`

| File | Reason archived |
|---|---|
| [archive/migration-blip-to-byte.md](archive/migration-blip-to-byte.md) | Executed — bytes/blips split is live |
| [archive/page-metadata-fix-plan.md](archive/page-metadata-fix-plan.md) | Executed — superseded by implementation report + metadata owner's guide |
| [archive/plan-bytes-and-blips-telegram-cli.md](archive/plan-bytes-and-blips-telegram-cli.md) | Executed — documented in `reference/jot-cli.md` + telegram reference |

### `notes/`

| File | What it is |
|---|---|
| [notes/react-nexus-2026-speaker-dms.md](notes/react-nexus-2026-speaker-dms.md) | React Nexus 2026 speaker outreach notes |

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
