# Pagination & Search Feature

**Branch:** `feature/pagination-search`  
**Phase:** 4  
**Status:** In Progress

---

## Overview

Add server-side pagination (10 items per page) and search functionality to byte, blip, and bloq pages. Replace client-side filtering with server-side pagination for improved performance.

---

## Changes Summary

| Category | Description |
|----------|-------------|
| **New Files** | 4 (types, components, skeletons) |
| **Modified** | 6 (repositories, pages) |
| **Deleted** | 1 (`src/lib/blip/` - unused duplicate) |
| **Renamed** | `glossary` → `blip` |

---

## Files Modified

### Repositories
| File | Changes |
|------|---------|
| `src/lib/byte/repository.ts` | Add `page`, `search` params, return pagination metadata |
| `src/lib/blip/repository.ts` | Add `page`, `search` params, return pagination metadata |
| `src/lib/bloq/parser.ts` | Add `page`, `limit`, return pagination metadata |

### Pages
| File | Changes |
|------|---------|
| `src/app/(pages)/byte/page.tsx` | Add searchParams, use paginated data, Suspense |
| `src/app/(pages)/blip/page.tsx` | Add searchParams, use paginated data, Suspense |
| `src/app/(pages)/bloq/page.tsx` | Add pagination to existing search |

---

## Testing Strategy

### Overview

We use a **Test-Driven Development (TDD)** approach:
1. **Write tests first** - Define expected behavior
2. **Run tests (should fail)** - Verify tests catch missing functionality
3. **Implement feature** - Make tests pass
4. **Verify all tests pass** - Confirm implementation

### Test Framework

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit | Vitest | Test repository functions with mocked Supabase |
| Component | Vitest + React Testing Library | Test SearchBar, PaginationControls |
| E2E | Playwright | Test full user flows |

---

## Automated Tests

### Tier 1: Unit Tests (Repository Layer)

**Location:** `src/lib/__tests__/`

#### Test File: `src/lib/__tests__/byte-repository.test.ts`

```typescript
describe('getBytes', () => {
  it('should return first 10 bytes when page=1', async () => {
    // Arrange
    const mockSupabase = createMockSupabase({
      data: [...Array(10).keys()].map(i => ({ id: String(i), content: `byte ${i}` })),
      count: 50
    });
    
    // Act
    const result = await getBytes(1, 10);
    
    // Assert
    expect(result.data).toHaveLength(10);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.total).toBe(50);
    expect(result.pagination.totalPages).toBe(5);
    expect(result.pagination.hasMore).toBe(true);
  });

  it('should return bytes 11-20 when page=2', async () => {
    // Should return items 11-20
  });

  it('should filter by search query', async () => {
    // Should apply .ilike('content', '%query%')
  });

  it('should return empty array when no results', async () => {
    // Should return { data: [], pagination: { hasMore: false, ... } }
  });
});
```

#### Test File: `src/lib/__tests__/blip-repository.test.ts`

Same pattern as byte repository tests.

#### Test File: `src/lib/__tests__/bloq-parser.test.ts`

```typescript
describe('getBloqPosts', () => {
  it('should return first 10 posts', () => {
    const result = getBloqPosts(1, 10);
    expect(result.posts).toHaveLength(10);
    expect(result.pagination.totalPages).toBeGreaterThan(1);
  });

  it('should filter by search query', () => {
    const result = getBloqPosts(1, 10, { searchQuery: 'react' });
    expect(result.posts.every(p => 
      p.title?.toLowerCase().includes('react') ||
      p.summary?.toLowerCase().includes('react')
    )).toBe(true);
  });

  it('should combine search + category filter', () => {
    const result = getBloqPosts(1, 10, { 
      searchQuery: 'test', 
      category: 'tech' 
    });
    // Should apply both filters
  });
});
```

---

### Tier 2: Component Tests (UI Layer)

**Location:** `src/components/shared/__tests__/`

#### Test File: `src/components/shared/__tests__/SearchBar.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useRouter, useSearchParams } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}));

describe('SearchBar', () => {
  it('should render with placeholder', () => {
    render(<SearchBar placeholder="Search bytes..." />);
    expect(screen.getByPlaceholderText('Search bytes...')).toBeInTheDocument();
  });

  it('should debounce search by 300ms', async () => {
    const router = useRouter();
    render(<SearchBar />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Router.replace should NOT be called immediately
    expect(router.replace).not.toHaveBeenCalled();
    
    // Wait 300ms
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/byte?q=test&page=1');
    }, { timeout: 400 });
  });

  it('should reset page to 1 on search', async () => {
    // Should include page=1 in URL
  });

  it('should handle empty query (remove param)', async () => {
    // Should remove 'q' param when input is cleared
  });
});
```

#### Test File: `src/components/shared/__tests__/PaginationControls.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { useRouter, useSearchParams } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}));

describe('PaginationControls', () => {
  const mockPagination = {
    page: 2,
    limit: 10,
    total: 50,
    totalPages: 5,
    hasMore: true
  };

  it('should show current page and total pages', () => {
    render(<PaginationControls pagination={mockPagination} basePath="/byte" />);
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
  });

  it('should show "Showing X-Y of Z" text', () => {
    render(<PaginationControls pagination={mockPagination} basePath="/byte" />);
    expect(screen.getByText('Showing 11 - 20 of 50')).toBeInTheDocument();
  });

  it('should NOT render prev button on page 1', () => {
    render(<PaginationControls 
      pagination={{ ...mockPagination, page: 1 }} 
      basePath="/byte" 
    />);
    expect(screen.queryByText('← Prev')).not.toBeInTheDocument();
  });

  it('should NOT render next button on last page', () => {
    render(<PaginationControls 
      pagination={{ ...mockPagination, page: 5 }} 
      basePath="/byte" 
    />);
    expect(screen.queryByText('Next →')).not.toBeInTheDocument();
  });

  it('should preserve search query when navigating', () => {
    render(<PaginationControls 
      pagination={mockPagination} 
      basePath="/byte"
      searchQuery="test"
    />);
    // Next link should include ?q=test
  });
});
```

---

### Tier 3: E2E Tests (Integration)

**Location:** `tests/e2e/`

#### Test File: `tests/e2e/pagination.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Pagination', () => {
  test('byte page - initial load shows first 10', async ({ page }) => {
    await page.goto('/byte');
    
    // Should show 10 byte cards
    const cards = await page.locator('[data-testid="byte-card"]').count();
    expect(cards).toBeLessThanOrEqual(10);
    
    // Should show pagination
    await expect(page.locator('nav')).toBeVisible();
  });

  test('byte page - pagination navigates correctly', async ({ page }) => {
    await page.goto('/byte');
    
    // Click next button
    await page.click('text=Next →');
    
    // URL should update
    await expect(page).toHaveURL(/page=2/);
    
    // Should show different content
  });

  test('byte page - search resets to page 1', async ({ page }) => {
    await page.goto('/byte?page=2');
    
    // Type in search
    await page.fill('[data-testid="search-input"]', 'test');
    
    // Wait for debounce
    await page.waitForTimeout(400);
    
    // Should reset to page 1
    await exp
