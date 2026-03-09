# Plan: Add ViewCounter and ClapsCounter to ProjectPage

## Overview
Add view counting and claps functionality to work project pages, following existing patterns in the codebase.

## Implementation Steps

### 1. Create Generic Views API Route
**File:** `src/app/api/views/[type]/[slug]/route.ts`

- Create a new dynamic API route that supports multiple content types
- Add `VALID_POST_TYPES = ['bloq', 'work']` validation
- Implement `GET` - Fetch view count from Supabase table `content_views`
- Implement `POST` - Increment view count via Supabase RPC `increment_content_view`
- Mirror pattern from `src/app/api/claps/[type]/[id]/route.ts`

### 2. Update Claps API to Support 'work' Type
**File:** `src/app/api/claps/[type]/[id]/route.ts`

- Add `'work'` to `VALID_POST_TYPES` array
- Update validation to accept 'work' as valid post type
- Remove or modify bloq-specific validation (lines 33-41, 98-106) to handle work type

### 3. Update useClaps Hook
**File:** `src/hooks/useClaps.ts`

- Update `PostType` type: `type PostType = 'bloq' | 'blip' | 'work'`

### 4. Update ClapsCounter Component
**File:** `src/components/shared/ClapsCounter.tsx`

- Update `PostType` type: `type PostType = 'bloq' | 'blip' | 'work'`

### 5. Create Generic ViewCounter Component
**File:** `src/components/shared/ViewCounter.tsx` (new file)

- Extract and generalize from `src/app/bloq/components/ViewCounter.tsx`
- Accept `slug` and `type` props
- Fetch from `/api/views/${type}/${slug}`
- Keep the BlinkingEye animation component

### 6. Create useTrackView Hook (optional but cleaner)
**File:** `src/hooks/useTrackView.ts` (new file)

- Generic hook to track views for any content type
- Call `/api/views/${type}/${slug}` with POST on mount
- Include dev mode and strict mode protections

### 7. Update ProjectPage Component
**File:** `src/app/work/components/ProjectPage.tsx`

- Import `ViewCounter` and `ClapsCounter`
- Import and use `useTrackView` hook to track page view
- Add counters below the title (after line 45)
- Layout: Display as inline-flex items with gap

## Database Requirements
- **New table:** `work_views` (or use generic `content_views` table with `type` column)
- **New RPC functions:**
  - `increment_content_view(p_type, p_slug)` - Upsert and increment
  - Or separate `increment_work_view(p_slug)` if using separate table

## File Changes Summary
| File | Action |
|------|--------|
| `src/app/api/views/[type]/[slug]/route.ts` | Create |
| `src/app/api/claps/[type]/[id]/route.ts` | Modify |
| `src/hooks/useClaps.ts` | Modify |
| `src/components/shared/ClapsCounter.tsx` | Modify |
| `src/components/shared/ViewCounter.tsx` | Create |
| `src/hooks/useTrackView.ts` | Create |
| `src/app/work/components/ProjectPage.tsx` | Modify |

## Notes
- ViewCounter is display-only (no user interaction)
- ClapsCounter is interactive with max 50 claps per user
- Both use fingerprinting for user identification (claps only)
- Dev mode tracking is skipped to avoid polluting data
