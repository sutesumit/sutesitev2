# Agentic Engineering Documentary: Views/Claps Architecture Refactor

**Date:** 2026-03-25  
**Duration:** ~2 hours  
**Agent:** Kilo (GLM-5)  
**Task:** Complete views/claps architecture refactor with unified API and database schema

---

## Executive Summary

This documentary captures the complete conversation flow for refactoring the Views and Claps counter implementation.

### Outcome
- Unified views API: /api/views?type={type}&id={id}
- Unified database schema: content_views table
- 4 old tables dropped, 1 new table created
- 101 tests passing (unit + integration)
- RLS enabled for security
- Proper disabled styling for maxReached claps

---

## Phase 1: Context Recovery

**User Prompt:** "What did we do so far?"

**What worked:** Simple context request allowed agent to summarize previous work with structured summary.

**Takeaway:** Structured summaries are more useful than prose for context recovery.

---

## Phase 2: Task Orchestration

**User Prompt:** "Yes, orchestrate everything."

**What worked:** Agent created todo list and broke work into parallel waves using Task tool.

**Orchestration Pattern:**
- Wave 1 (Parallel): Fix ViewCounter tests, Fix Claps API tests, Fix TrackView consistency
- Wave 2 (Sequential): Run tests, Commit changes

**Takeaway:** Parallel delegation is effective for independent tasks.

---

## Phase 3: Database Migration

**User Prompt:** "How would you like to apply the database migrations?"
**User Response:** "We have the supabase mcp. Check that."

**What worked:** Agent discovered credentials in .kilocode/mcp.json

**What didn't work:** Migration file had incorrect column names (url instead of slug, view_count instead of views)

**Recovery:** Agent queried schema first before fixing migration.

**Takeaway:** Always verify schema before writing migrations.

---

## Phase 4: Integration Testing

**Challenge:** Integration tests skipped due to missing env vars.

**Issues:**
1. Test data conflicts - hardcoded IDs already existed in DB
2. Invalid test slug - content didn't exist

**Solutions:**
1. Use Date.now() for unique test IDs
2. Change to valid slug: building-mdx-blog-system-nextjs-ai

**Takeaway:** Integration tests need dynamic data to avoid conflicts.

---

## Phase 5: Deprecation

**User Prompt:** "Do the remaining work as well"

**Tasks Completed:**
1. Apply database migrations to Supabase
2. Run integration tests with real database
3. Deprecate old view API routes (deleted 4 route files)
4. Commit remaining changes

**Takeaway:** "Remaining work" prompts work when there's a clear backlog.

---

## Phase 6: Database Cleanup

**User Prompt:** "Shall we get rid of tables from our db that we don't need anymore?"

**What worked:** Agent verified data migration before dropping tables.

**Takeaway:** Always verify data integrity before destructive operations.

---

## Phase 7: Security Review

**User Prompt:** "Our content_views table is unrestricted. Is that okay?"

**What worked:** Agent checked RLS status, identified gap, created policies.

**Takeaway:** Security prompts should be proactive.

---

## Phase 8: Manual Testing

**User Prompt:** "Give me quick manual tests to check our implementations."

**What worked:** Agent checked if dev server running, provided curl commands, ran tests.

**Takeaway:** Manual test prompts should include commands and expected outputs.

---

## Phase 9: UI Polish

**User Prompt:** "the maxReached claps button could have been grayed out with tailwind cursor not-allowed. Is that done?"

**What worked:** User provided specific requirement, agent identified gap and fixed.

**Before:** cursor-default border-transparent bg-transparent
**After:** cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 opacity-60

**Takeaway:** Specific UI requirements should be stated explicitly.

---

## Prompt Effectiveness Analysis

### Highly Effective Prompts
| Prompt | Why It Worked |
|--------|---------------|
| "What did we do so far?" | Open context recovery, structured response |
| "Yes, orchestrate everything." | Clear directive, enabled parallel execution |
| "We have the supabase mcp. Check that." | Pointed to existing tool, saved time |
| "Shall we get rid of tables..." | Yes/no decision, clear action |

### Less Effective Prompts
| Prompt | Issue | Improvement |
|--------|-------|-------------|
| "Do the remaining work as well" | Vague | List specific items |
| "could have been grayed out..." | Implies missed requirement | State earlier |

---

## Agent Behavior Analysis

### Strengths
1. Parallel delegation via Task tool
2. Schema verification before migrations
3. Safety checks before destructive operations
4. Structured communication

### Areas for Improvement
1. Proactive security flagging
2. UI state requirements gathering
3. Test data conflict anticipation

---

## Commit History

- ea970a3 fix: add proper disabled styling for maxReached claps button
- 7bc04b8 security: enable RLS on content_views table
- 3366307 chore: drop old views tables after successful migration
- 2a98122 feat: complete views/claps architecture refactor
- 998d105 feat: unify views/claps architecture with single API

---

## Metrics

| Metric | Value |
|--------|-------|
| Total commits | 5 |
| Files changed | 25+ |
| Lines added | 2,400+ |
| Lines removed | 800+ |
| Tests passing | 101 |
| Migration files | 4 |

---

## Conclusion

This refactor demonstrates effective agentic engineering when:
- Context is well-established upfront
- Tasks are delegated in parallel waves
- Safety checks are performed before destructive operations
- User provides specific requirements for UI/UX

The key improvement area is **proactive requirement gathering** - agents should ask about edge cases before implementation.

---

*Document created for agentic engineering workflow analysis*
