# Feature Reports Index

Technical documentation for all implemented features.

---

## Quick Reference

| # | Feature | Branch | Phase | Status |
|---|---------|--------|-------|--------|
| 01 | [Blip Views Counter](./01-blip-views-counter.md) | `feature/blip-views-counter` | 2 | Complete |
| 02 | [Visitor Time Ago](./02-visitor-time-ago.md) | `feature/visitor-time-ago` | 2 | Complete |
| 03 | [Telegram Bloq/Project Updates](./03-telegram-bloq-project-updates.md) | `feature/telegram-bloq-project-updates` | 3 | Complete |
| 04 | [Project Descriptions Review](./04-project-descriptions-review.md) | `content/project-descriptions` | 5 | No changes |
| 05 | [Draft Bloqs Review](./05-draft-bloqs-review.md) | `content/draft-bloqs-review` | 5 | Review only |
| 06 | [Project Counters](./06-project-counters.md) | `feature/project-counters` | 2 | Complete |
| 07 | [Telegram Visitor Notifications](./07-telegram-visitor-notifications.md) | `feature/telegram-visitor-notifications` | 4 | Complete |
| 08 | [Pagination](./08-pagination.md) | `feature/pagination` | 4 | Complete |

---

## Database Migrations

See [migrations/](./migrations/) folder for SQL scripts:

| Migration | Description |
|-----------|-------------|
| [001-blip-views.sql](./migrations/001-blip-views.sql) | Creates `blip_views` table |
| [002-project-views.sql](./migrations/002-project-views.sql) | Creates `project_views` table |

---

## Progress Summary

All features merged into `feature/all-combined` branch.

Run `npm run build && npm run start` to test.
