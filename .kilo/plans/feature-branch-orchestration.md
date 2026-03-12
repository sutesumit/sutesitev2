# Feature Branch Orchestration Plan

## Problem Statement

Individual feature branches have mixed commits. The goal is to create clean, isolated feature branches where each branch:
1. Contains ONLY commits related to that specific feature
2. Includes its corresponding feature-report document (as a living document)
3. Can be tested independently by the user (who will manually merge to main)

**CRITICAL: Never touch the main branch. All work is done on feature branches only.**

---

## Living Document Protocol

Each feature-report document (`docs/feature-reports/XX-feature-name.md`) is a **living document** that must:
- Log the development process, attempts, failures, and fixes
- Document the approach taken and rationale
- Record manual testing results
- Be updated throughout the feature lifecycle

---

## Branch Analysis

### Feature Branches Status

| Branch | Status | Action Needed |
|--------|--------|---------------|
| `feature/blip-views-counter` | ❌ Same as main (no commits) | Recreate with correct commits |
| `feature/visitor-time-ago` | ⚠️ Mixed commits | Already in main, mark for cleanup |
| `feature/project-counters` | ✅ Clean | Add feature-report doc |
| `feature/pagination` | ✅ Clean | Add feature-report doc |
| `feature/telegram-bloq-project-updates` | ✅ Clean | Add feature-report doc |
| `feature/telegram-visitor-notifications` | ✅ Clean | Add feature-report doc |
| `content/project-descriptions` | ✅ No code changes | Add feature-report doc |
| `content/draft-bloqs-review` | ✅ No code changes | Add feature-report doc |

### Redundant Branches (for cleanup after verification)

| Branch | Reason | Safe to Delete? |
|--------|--------|-----------------|
| `feature/reading-time` | Same as main (no unique commits) | ⚠️ Verify first |
| `feature/visitor-time-ago-context` | Contains merged commits from multiple features | ⚠️ Verify first |
| `feature/work-counters` | Superseded by `feature/project-counters` | ⚠️ Verify first |
| `fix/visitor-analytics-context` | Same commit as main (d23fd29) | ⚠️ Verify first |
| `fix/visitor-time-ago-context` | Contains merged commits | ⚠️ Verify first |
| `feature/visitor-time-ago` | Already merged to main | ⚠️ After testing |

### Content Branches (keep)

| Branch | Status |
|--------|--------|
| `newbloq/blipincli-article` | Has unique commit - keep |
| `newbloq/update-bot-bloq` | No unique commits - verify |
| `blipincli-public` | Same as main - verify |

---

## Commit Attribution

**Blip Views Counter (needs to be recreated):**
- `ad6393a` feat(blip): add views API endpoint
- `87383b2` feat(blip): add ViewCounter and TrackView components
- `9f2d56b` feat(analytics): add trackBlipView function
- `f1c74d7` feat(blip): integrate ViewCounter and TrackView in blip pages

**Visitor Time Ago - ALREADY IN MAIN (skip)**
- Feature already merged to main
- `src/lib/formatTimeAgo.ts` exists in main
- Footer displays time ago with location

---

## Execution Plan

### Phase 1: Backup Existing Branches

```bash
git branch backup/blip-views-counter feature/blip-views-counter
git branch backup/visitor-time-ago feature/visitor-time-ago
```

### Phase 2: Recreate feature/blip-views-counter

```bash
# Delete old branch
git branch -D feature/blip-views-counter

# Create fresh branch from main
git checkout -b feature/blip-views-counter main

# Cherry-pick blip views commits IN ORDER
git cherry-pick ad6393a  # feat(blip): add views API endpoint
git cherry-pick 87383b2  # feat(blip): add ViewCounter and TrackView components
git cherry-pick 9f2d56b  # feat(analytics): add trackBlipView function
git cherry-pick f1c74d7  # feat(blip): integrate ViewCounter and TrackView in blip pages
```

### Phase 3: Add Feature Report Documents to All Branches

For each branch, checkout and add the corresponding feature-report document:

| Branch | Document to Add |
|--------|-----------------|
| `feature/blip-views-counter` | `docs/feature-reports/01-blip-views-counter.md` |
| `feature/telegram-bloq-project-updates` | `docs/feature-reports/03-telegram-bloq-project-updates.md` |
| `content/project-descriptions` | `docs/feature-reports/04-project-descriptions-review.md` |
| `content/draft-bloqs-review` | `docs/feature-reports/05-draft-bloqs-review.md` |
| `feature/project-counters` | `docs/feature-reports/06-project-counters.md` |
| `feature/telegram-visitor-notifications` | `docs/feature-reports/07-telegram-visitor-notifications.md` |
| `feature/pagination` | `docs/feature-reports/08-pagination.md` |

Also add:
- `docs/feature-reports/README.md`
- `docs/feature-reports/migrations/` folder

### Phase 4: Manual Testing (User's Responsibility)

For each feature branch, the user will:

```bash
# 1. Checkout the feature branch
git checkout feature/<name>

# 2. Build and run
npm run build && npm run start

# 3. Follow manual tests in the feature-report document

# 4. Document test results in the feature-report (living document)

# 5. If passing, manually merge to main
git checkout main
git merge feature/<name>
```

### Phase 5: Branch Cleanup (After Manual Testing)

After all features are tested and merged by user:

```bash
# Delete backup branches
git branch -D backup/blip-views-counter
git branch -D backup/visitor-time-ago

# Delete redundant branches (verify each one first)
git branch -D feature/reading-time
git branch -D feature/visitor-time-ago-context
git branch -D feature/work-counters
git branch -D fix/visitor-analytics-context
git branch -D fix/visitor-time-ago-context
git branch -D feature/visitor-time-ago

# Delete the all-combined-restored branch (no longer needed)
git branch -D feature/all-combined-restored
```

---

## Testing Order (by dependency)

1. **feature/blip-views-counter** - Independent, foundational
2. ~~**feature/visitor-time-ago**~~ - SKIPPED (already merged to main)
3. **feature/project-counters** - Independent
4. **feature/pagination** - Independent
5. **feature/telegram-bloq-project-updates** - Requires Telegram env vars
6. **feature/telegram-visitor-notifications** - Requires visit API + Telegram
7. **content/project-descriptions** - No testing needed (content review)
8. **content/draft-bloqs-review** - No testing needed (content review)

---

## Files Changed Summary

### Feature 01: Blip Views Counter
- `src/app/api/blip/views/[serial]/route.ts` (created)
- `src/app/blip/components/ViewCounter.tsx` (created)
- `src/app/blip/components/TrackView.tsx` (created)
- `src/app/blip/[serial]/page.tsx` (modified)
- `src/app/blip/components/BlipCardContent.tsx` (modified)
- `src/hooks/useAnalytics.ts` (modified - trackBlipView)

### Feature 02: Visitor Time Ago - SKIPPED (already in main)

### Feature 03: Telegram Bloq/Project Updates
- `src/lib/telegram/formatters.ts` (modified)
- `src/lib/telegram/replies.ts` (modified)
- `src/app/api/bloq/publish/route.ts` (created)
- `src/app/api/project/notify/route.ts` (created)

### Feature 06: Project Counters
- `src/app/api/project/views/[slug]/route.ts` (created)
- `src/app/work/components/ViewCounter.tsx` (created)
- `src/app/work/components/TrackProjectView.tsx` (created)
- `src/app/work/[slug]/page.tsx` (modified)
- `src/app/work/components/ProjectPage.tsx` (modified)
- `src/components/shared/ClapsCounter.tsx` (modified - PostType)
- `src/hooks/useAnalytics.ts` (modified - trackProjectView)

### Feature 07: Telegram Visitor Notifications
- `src/lib/telegram/formatters.ts` (modified)
- `src/lib/telegram/replies.ts` (modified)
- `src/app/api/visit/route.ts` (modified - notification logic)

### Feature 08: Pagination
- `src/lib/pagination.ts` (created)
- `src/components/ui/Pagination.tsx` (created)
- `src/app/blip/components/BlipFeed.tsx` (created)
- `src/app/bloq/components/BloqFeed.tsx` (modified)
- `src/app/blip/page.tsx` (modified)

---

## Risk Mitigation

1. **Backup branches before deletion**
2. **Never touch main branch**
3. **Keep `feature/all-combined-restored` as reference until cleanup**
4. **If cherry-pick fails due to conflicts:**
   - Abort: `git cherry-pick --abort`
   - Resolve conflicts manually
   - Continue: `git cherry-pick --continue`
5. **Verify each redundant branch before deletion**

---

## Execution Checklist

- [ ] Create backup branches
- [ ] Recreate `feature/blip-views-counter` with correct commits
- [ ] Add feature-report documents to all feature branches
- [ ] User manually tests each feature
- [ ] User manually merges tested features to main
- [ ] Run branch analysis to verify redundant branches
- [ ] Delete redundant branches
- [ ] Delete backup branches
- [ ] Delete feature/all-combined-restored
