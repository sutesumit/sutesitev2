# Project Counters

**Branch:** `feature/project-counters`  
**Status:** Merged to main

---

## What

Extends ClapsCounter and adds ViewsCounter for project detail pages at `/work/[slug]`.

---

## Files Changed

| File | Action |
|------|--------|
| `src/app/api/project/views/[slug]/route.ts` | Created |
| `src/app/work/components/ViewCounter.tsx` | Created |
| `src/app/work/components/TrackProjectView.tsx` | Created |
| `src/app/work/[slug]/page.tsx` | Modified |
| `src/app/work/components/ProjectPage.tsx` | Modified |
| `src/components/shared/ClapsCounter.tsx` | Modified |
| `src/hooks/useAnalytics.ts` | Modified |

---

## Code Flow

```
┌─────────────────────────────────────────────────────────────┐
│           User visits /work/[slug] page                     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│ TrackProjectView.tsx     │    │   ViewCounter.tsx        │
│ (useEffect on mount)     │    │   (useEffect on mount)   │
│                          │    │                          │
│ POST /api/project/views/ │    │   GET /api/project/views/ │
│ [slug]                   │    │   [slug]                  │
└──────────────────────────┘    └──────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase: project_views table                  │
│              increment_project_view(slug) RPC               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              ProjectPage.tsx (render)                       │
│                                                             │
│   <ViewCounter slug={project.slug} />                       │
│   <ClapsCounter postId={project.slug} postType="project" /> │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Logic

### 1. PostType Extension (src/components/shared/ClapsCounter.tsx)

```typescript
// Before
type PostType = 'bloq' | 'blip';

// After
type PostType = 'bloq' | 'blip' | 'project';
```

The existing `ClapsCounter` component works unchanged - just pass `postType="project"`.

### 2. API Endpoint (src/app/api/project/views/[slug]/route.ts)

```typescript
// GET - Fetch view count
export async function GET(request, { params }) {
    const { slug } = await params;
    const { data } = await supabase
        .from('project_views')
        .select('views')
        .eq('slug', slug)
        .single();
    
    return NextResponse.json({ views: data?.views ?? 0 });
}

// POST - Increment view count
export async function POST(request, { params }) {
    const { slug } = await params;
    const { data } = await supabase.rpc('increment_project_view', {
        p_slug: slug
    });
    
    return NextResponse.json({ views: data });
}
```

### 3. TrackProjectView Component

```typescript
export default function TrackProjectView({ slug }: TrackProjectViewProps) {
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[ProjectView] Tracking skipped (Development Mode)`);
            return;
        }

        fetch(`/api/project/views/${slug}`, {
            method: 'POST',
            cache: 'no-store',
        }).catch(console.warn);
    }, [slug]);

    return null;
}
```

### 4. useAnalytics Hook Extension

```typescript
// Added to useAnalytics.ts
const hasTrackedProjectView = useRef(false);

const trackProjectView = useCallback(async (slug: string) => {
    if (process.env.NODE_ENV === 'development') return;
    if (hasTrackedProjectView.current) return;
    hasTrackedProjectView.current = true;

    await fetch(`/api/project/views/${slug}`, {
        method: 'POST',
        cache: 'no-store',
    });
}, []);
```

---

## Database

### Table: project_views

| Column | Type | Description |
|--------|------|-------------|
| `slug` | TEXT | Primary key (project slug) |
| `views` | INTEGER | View count, default 0 |
| `created_at` | TIMESTAMPTZ | Record creation |
| `updated_at` | TIMESTAMPTZ | Last increment |

### Function: increment_project_view

```sql
CREATE FUNCTION increment_project_view(p_slug TEXT) RETURNS INTEGER AS $$
BEGIN
    INSERT INTO project_views (slug, views) VALUES (p_slug, 1)
    ON CONFLICT (slug) DO UPDATE
    SET views = project_views.views + 1, updated_at = now()
    RETURNING views INTO v_views;
    RETURN v_views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Why Counters May Not Show

| Reason | Solution |
|--------|----------|
| Running in dev mode | Use `npm run build && npm run start` |
| DB migration not run | Execute `002-project-views.sql` in Supabase |
| Claps table missing 'project' support | Already handled by existing schema |
| API returning error | Check Network tab for errors |

---

## Manual Tests

1. **View counter display:**
   - Navigate to `/work/[slug]`
   - ViewCounter shows in project footer

2. **View increment:**
   - Note view count
   - Refresh page
   - Count increments by 1

3. **Claps counter:**
   - Click clap button
   - Count increments (max 50)
   - Button becomes disabled at max

4. **Network verification:**
   - Open DevTools → Network tab
   - Visit `/work/[slug]`
   - Verify POST to `/api/project/views/[slug]`
   - Click clap → verify POST to `/api/claps/project/[slug]`

5. **Database verification:**
   ```sql
   SELECT * FROM project_views;
   SELECT * FROM claps WHERE post_type = 'project';
   ```

---

## Test Results (2026-03-13)

### API Tests
| Test | Result | Details |
|------|--------|---------|
| GET `/api/project/views/art` | ✅ Pass | Returns `{"views":2}` |
| POST `/api/project/views/art` | ✅ Pass | Increments count to `{"views":2}` |

### UI Tests
| Test | Result | Details |
|------|--------|---------|
| ViewCounter renders | ✅ Pass | Blinking eye icon visible in HTML |
| Page loads | ✅ Pass | `/work/art` displays correctly |

### Prerequisites
- Database table `project_views` exists in Supabase
- RPC function `increment_project_view` exists in Supabase

**Status: Merged to main**

---

## Enhancement Log

### 2026-03-13: Iframe Scaling Fix

**Issue:** The project page iframe appeared too small/zoomed out because scale was calculated based only on container width.

**Solution:** Changed scaling to use `getBoundingClientRect()` and calculate scale based on minimum of width and height ratio.

**Files Changed:**
| File | Action |
|------|--------|
| `src/app/work/components/ProjectPage.tsx` | Modified - improved iframe scaling |
| `src/app/work/components/WorkProjectCard.tsx` | Modified - added ViewCounter and ClapsCounter |

**Code Change:**
```typescript
// Before:
const updateScale = () => {
  if (containerRef.current) {
    setIframeScale(containerRef.current.offsetWidth / IFRAME_W);
  }
};

// After:
const updateScale = () => {
  if (containerRef.current) {
    const { width, height } = containerRef.current.getBoundingClientRect();
    const scaleX = width / IFRAME_W;
    const scaleY = height / IFRAME_H;
    setIframeScale(Math.min(scaleX, scaleY));
  }
};
```

**Testing:**
- Build passes
- Page loads correctly at HTTP 200
- Iframe scaling now uses ResizeObserver for responsive scaling
