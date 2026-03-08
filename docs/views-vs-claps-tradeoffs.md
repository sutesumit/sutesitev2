# Views vs Claps: An Architectural Trade-off Analysis

> "The question isn't whether to unify, but whether the cost of unification exceeds the cost of separation."

This document analyzes the architectural trade-offs between the current separate implementations of **views** (passive analytics) and **claps** (active engagement), and evaluates whether unification would yield meaningful benefits.

---

## Current Architecture

### Views System

```
┌─────────────┐     POST/GET      ┌─────────────────┐
│ useAnalytics│ ────────────────► │ /api/bloq/views │
└─────────────┘                   └────────┬────────┘
                                           │
                                          ▼
                               ┌───────────────────────┐
                               │ increment_bloq_view() │
                               │ (RPC function)        │
                               └───────────┬───────────┘
                                           │
                                          ▼
                               ┌───────────────────────┐
                               │ bloq_views table      │
                               │ ┌─────┬───────┬─────┐ │
                               │ │ slug│ views │ ... │ │
                               │ └─────┴───────┴─────┘ │
                               └───────────────────────┘
```

**Characteristics:**
- Anonymous tracking (no user identification)
- Simple counter increment
- Single post type support (`bloq` only)
- Direct table query for reads
- One RPC function for writes

### Claps System

```
┌─────────────┐     POST/GET      ┌──────────────────┐
│  useClaps   │ ────────────────► │ /api/claps/[type]│
└─────────────┘                   │     /[id]        │
      │                           └────────┬─────────┘
      │                                    │
      ▼                                    ▼
┌─────────────────┐             ┌─────────────────────┐
│ localStorage    │             │ upsert_clap()       │
│ fingerprint     │             │ get_user_claps()    │
│ (user tracking) │             │ get_claps()         │
└─────────────────┘             └──────────┬──────────┘
                                           │
                                          ▼
                               ┌───────────────────────┐
                               │ post_engagement table │
                               │ (presumed structure)  │
                               │ ┌────────┬──────┬────┐│
                               │ │post_id │claps │user││
                               │ └────────┴──────┴────┘│
                               └───────────────────────┘
```

**Characteristics:**
- Fingerprint-based user tracking
- Per-user clap limits (max 50)
- Multi-post type support (`bloq`, `blip`)
- Three RPC functions
- Returns both total and user-specific counts

---

## Semantic Analysis

### Views: Passive Observation

| Aspect | Behavior |
|--------|----------|
| User action | None required (automatic on page load) |
| Intent | Analytics, traffic measurement |
| Privacy | Anonymous, no user tracking |
| Cardinality | One increment per page visit |
| Value | Informational (for author) |

### Claps: Active Appreciation

| Aspect | Behavior |
|--------|----------|
| User action | Explicit click required |
| Intent | Engagement, appreciation signal |
| Privacy | Fingerprint-tracked for limits |
| Cardinality | Multiple per user (up to 50) |
| Value | Interactive (for reader and author) |

> The fundamental difference: views are something that *happens to* a post; claps are something a reader *does to* a post.

---

## Code Comparison

### API Route Complexity

**Views (`bloq/views/[slug]/route.ts`):**
```typescript
// POST: 35 lines, 1 RPC call
await supabase.rpc("increment_bloq_view", { p_slug: slug })

// GET: 30 lines, 1 direct query
await supabase.from("bloq_views").select("views").eq("slug", slug)
```

**Claps (`claps/[type]/[id]/route.ts`):**
```typescript
// POST: 60 lines, 1 RPC call + validation
await supabase.rpc("upsert_clap", {
    p_post_type: type,
    p_post_id: id,
    p_fingerprint: fingerprint,
    p_increment: 1
})

// GET: 70 lines, 2 different RPC calls (with/without fingerprint)
await supabase.rpc("get_user_claps", {...})  // with fingerprint
await supabase.rpc("get_claps", {...})       // without fingerprint
```

### Hook Complexity

**useAnalytics:**
- No state management for views
- Fire-and-forget tracking
- Dev mode protection

**useClaps:**
- State: `totalClaps`, `userClaps`, `isLoading`, `maxReached`
- Optimistic updates with rollback
- Fingerprint generation and persistence
- Rate limiting (max 50)

---

## Unification Scenarios

### Scenario A: Views Absorb Claps

Views would need to gain:
- Fingerprint tracking
- Per-user limits
- Multi-type support
- User-specific return data

**Cost:** Views become heavier for no benefit. Every view tracking call now carries fingerprint overhead, even though it's never used.

### Scenario B: Claps Absorb Views

Views would become "claps with max=1, no fingerprint required."

**Cost:** 
- Loss of semantic clarity (a view is not a clap)
- Database must track user fingerprints for views (wasted storage)
- API must handle optional fingerprint (complexity)
- Analytics queries become more complex

### Scenario C: Unified Engagement Table

```sql
post_engagement
├── post_type (bloq, blip)
├── post_id
├── engagement_type (view, clap)
├── fingerprint (nullable)
├── count
└── timestamps
```

**Cost:**
- Migration of existing `bloq_views` data
- Every query must filter by `engagement_type`
- Loss of table-level optimizations
- Indexing becomes more complex

---

## Trade-off Matrix

| Factor | Separate | Unified |
|--------|----------|---------|
| **Code duplication** | Higher (2 APIs, 2 hooks) | Lower (1 API, 1 hook) |
| **Semantic clarity** | High (view ≠ clap) | Low (conflated concepts) |
| **Query performance** | Optimal per use case | Degraded (filters needed) |
| **Storage efficiency** | Optimal (views don't store fingerprints) | Wasted (null fingerprints for views) |
| **Extensibility** | Independent evolution | Coupled changes |
| **Maintenance burden** | 2 systems to maintain | 1 system, more complex |
| **Cognitive load** | Clear separation | Must remember which mode |
| **Testing surface** | 2 simple systems | 1 complex system |

---

## The Third Case Test

From the pattern "Design for the third case" (BLOQ-SKILL pending verification):

> When building for two, ask what happens with three.

If we add a third engagement type (e.g., `bookmarks`, `shares`, `reactions`):

**With separation:** Add a new system. Existing systems unaffected.

**With unification:** The unified table grows another `engagement_type`. Each new type may have different requirements (bookmarks need user auth, shares need referral tracking). The unified model strains under incompatible requirements.

---

## Recommendation

**Keep separate.** The apparent code duplication is actually domain separation. The systems serve different purposes:

| System | Purpose | User Relationship |
|--------|---------|-------------------|
| Views | Traffic analytics | Anonymous observer |
| Claps | Reader engagement | Identified participant |

### What to Unify Instead

1. **Patterns, not implementations:**
   - Both use `noStoreHeaders` — extract to shared constant
   - Both validate post existence — extract to shared utility
   - Both use Supabase client — already shared

2. **Type support:**
   - Extend views to support `blip` type (pattern matching)
   - Keep the same anonymous behavior

3. **Error handling:**
   - Standardize error response format
   - Share error logging patterns

---

## Appendix: Code References

| Component | Path |
|-----------|------|
| Views API | `src/app/api/bloq/views/[slug]/route.ts` |
| Claps API | `src/app/api/claps/[type]/[id]/route.ts` |
| Views Hook | `src/hooks/useAnalytics.ts:61` |
| Claps Hook | `src/hooks/useClaps.ts` |
| Supabase Client | `src/lib/supabaseServerClient.ts` |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-08 | Keep systems separate | Semantic mismatch exceeds code duplication cost |
| 2026-03-08 | Extract shared patterns | Reduce duplication without losing domain clarity |
| 2026-03-08 | Extend views to support blips | Feature parity without architectural coupling |
