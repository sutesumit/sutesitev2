# Pagination & Search Feature - Detailed Orchestration Plan

**Branch:** `feature/pagination-search`  
**Started:** 2026-03-15  
**Status:** Implementation Phase

---

## Executive Summary

This plan orchestrates the implementation of server-side pagination (10 items/page) and search functionality for byte, blip, and bloq pages. We follow a **Test-Driven Development (TDD)** approach where tests are written first (and committed), then implementation makes tests pass.

---

## Phase 0: Current State (Completed ✅)

### Completed Tasks
- [x] Created branch `feature/pagination-search`
- [x] Set up Vitest testing framework
- [x] Set up Playwright E2E testing
- [x] Created 33 passing tests defining expected behavior
- [x] Created `SearchBar` and `PaginationControls` components
- [x] Created pagination types and utilities
- [x] Documented testing parameters in `docs/feature-reports/09-pagination-search.md`
- [x] Committed testing infrastructure (commit: 3ba2f45)

### Current Test Status
```
✓ 33 tests passing
  - 16 pagination utility tests
  - 10 PaginationControls tests
  - 7 SearchBar tests
```

---

## Phase 1: Repository Layer Implementation

### Goal
Update data fetching layer to support pagination and search.

### Tasks

#### Task 1.1: Update Byte Repository
**File:** `src/lib/byte/repository.ts`

**Changes:**
1. Import `PaginatedResult`, `PaginationInfo` from `@/types/pagination`
2. Modify `getBytes()` to accept `page`, `limit`, `searchQuery` params
3. Use Supabase `.range()` for pagination
4. Use Supabase `.ilike()` for search
5. Return `{ data, pagination }` object

**Test Verification:**
- Run `npm test` - existing pagination tests should pass
- Repository tests will be added after implementation

**Implementation:**
```typescript
export async function getBytes(
  page: number = 1,
  limit: number = 10,
  searchQuery?: string
): Promise<PaginatedResult<Byte>> {
  const supabase = getSupabaseServerClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("bytes")
    .select("id, content, created_at, byte_serial", { count: 'exact' })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchQuery) {
    query = query.ilike('content', `%${searchQuery}%`);
  }

  const [data, countResult] = await Promise.all([
    query,
    supabase.from("bytes").select("*", { count: 'exact', head: true })
  ]);

  const total = countResult.count ?? 0;

  return {
    data: data ?? [],
    pagination: createPaginationInfo(page, limit, total),
  };
}
```

#### Task 1.2: Add Adjacent Byte Query (Optional Optimization)
**File:** `src/lib/byte/repository.ts`

**Purpose:** Replace fetching ALL bytes for prev/next navigation with efficient queries.

**Implementation:**
```typescript
export async function getAdjacentBytes(currentSerial: number) {
  const supabase = getSupabaseServerClient();
  
  const [newer, older] = await Promise.all([
    supabase.from("bytes")
      .select("id, content, created_at, byte_serial")
      .lt("byte_serial", currentSerial)
      .order("byte_serial", { ascending: false })
      .limit(1)
      .single(),
    supabase.from("bytes")
      .select("id, content, created_at, byte_serial")
      .gt("byte_serial", currentSerial)
      .order("byte_serial", { ascending: true })
      .limit(1)
      .single()
  ]);
  
  return { newer: newer.data, older: older.data };
}
```

#### Task 1.3: Update Blip Repository
**File:** `src/lib/blip/repository.ts`

**Changes:** Same pattern as byte - add pagination and search.

**Search Fields:** `term`, `meaning`

#### Task 1.4: Update Bloq Parser
**File:** `src/lib/bloq/parser.ts`

**Changes:**
1. Add pagination to `getBloqPosts()`
2. Support search, category, and tags filters
3. Return `{ posts, pagination }` object

---

## Phase 2: Page Implementation

### Goal
Update pages to use paginated data and add Suspense boundaries.

### Tasks

#### Task 2.1: Update Byte Page
**File:** `src/app/(pages)/byte/page.tsx`

**Changes:**
1. Accept `searchParams` prop
2. Parse `page` and `q` params
3. Call `getBytes(page, 10, searchQuery)`
4. Render `PaginationControls`
5. Wrap in Suspense (if not already)

**Implementation:**
```typescript
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BytePage(props: Props) {
  const searchParams = await props.searchParams;
  const page = normalizePage(searchParams.page, 1);
  const searchQuery = normalizeSearchQuery(searchParams.q);
  
  const { data: bytes, pagination } = await getBytes(page, 10, searchQuery);

  return (
    <div className="container ...">
      <SearchBar 
        placeholder="Search bytes..." 
        initialValue={searchQuery}
        basePath="/byte"
      />
      
      <div className="grid grid-cols-1 gap-2">
        {bytes.map((byte) => (
          <ByteCard key={byte.id} byte={byte} />
        ))}
      </div>

      <PaginationControls 
        pagination={pagination} 
        basePath="/byte"
        searchQuery={searchQuery}
      />
    </div>
  );
}
```

#### Task 2.2: Create Byte Loading State
**File:** `src/app/(pages)/byte/loading.tsx`

**Implementation:**
```typescript
export default function BytePageLoading() {
  return (
    <div className="container flex flex-col py-10 px-2 sm:px-0">
      <div className="h-10 w-full bg-muted rounded-md animate-pulse mb-4" />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-20 bg-muted rounded-md animate-pulse mb-2" />
      ))}
    </div>
  );
}
```

#### Task 2.3: Update Blip Page
**File:** `src/app/(pages)/blip/page.tsx`

**Changes:** Same pattern as byte page.

#### Task 2.4: Create Blip Loading State
**File:** `src/app/(pages)/blip/loading.tsx`

#### Task 2.5: Update Bloq Page
**File:** `src/app/(pages)/bloq/page.tsx`

**Changes:**
1. Add pagination to existing search functionality
2. Pass `pagination` to `BloqFeed` component

#### Task 2.6: Create Bloq Loading State
**File:** `src/app/(pages)/bloq/loading.tsx`

#### Task 2.7: Update BloqFeed Component (If Needed)
**File:** `src/app/(pages)/bloq/components/BloqFeed.tsx`

**Changes:**
- Accept `pagination` prop
- Add "Load More" or pagination controls

---

## Phase 3: Detail Page Optimization

### Goal
Optimize prev/next navigation in detail pages.

### Tasks

#### Task 3.1: Update Byte Detail Page
**File:** `src/app/(pages)/byte/[serial]/page.tsx`

**Changes:**
- Replace `getBytes()` with `getAdjacentBytes()` for prev/next

#### Task 3.2: Update Blip Detail Page
**File:** `src/app/(pages)/blip/[serial]/page.tsx`

**Changes:** Same pattern as byte.

---

## Phase 4: Run Tests & Verify

### Tasks

#### Task 4.1: Run Unit Tests
```bash
npm test
```

**Expected:** All 33 tests should pass.

#### Task 4.2: Run E2E Tests
```bash
npm run test:e2e
```

**Expected:** Tests should pass (may need adjustments based on implementation).

#### Task 4.3: Build Verification
```bash
npm run lint
npm run build
```

**Expected:** No lint errors, successful build.

#### Task 4.4: Manual Testing
Follow the manual testing checklist in `docs/feature-reports/09-pagination-search.md`.

---

## Phase 5: Cleanup & Documentation

### Tasks

#### Task 5.1: Update Documentation
- Mark implementation complete in `09-pagination-search.md`
- Update status from "In Progress" to "Complete"

#### Task 5.2: Create Bloq Post (Optional)
Create a bloq post documenting the pagination feature journey.

**Template:**
- Title: "So I Added Pagination to My Homepage"
- Summary: Brief human story about why pagination mattered
- Tags: `typescript`, `nextjs`, `architecture`
- Category: "Engineering"

#### Task 5.3: Final Commit
```bash
git add -A
git commit -m "feat: implement pagination and search for byte, blip, and bloq pages"
```

---

## Dependency Graph

```
Phase 1: Repository Layer
├── Task 1.1: Byte Repository ──────────────┐
├── Task 1.2: Adjacent Byte Query (Optional)│
├── Task 1.3: Blip Repository ──────────────┤
└── Task 1.4: Bloq Parser ──────────────────┘
        │
        ▼
Phase 2: Page Implementation
├── Task 
