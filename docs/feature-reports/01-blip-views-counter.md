# Blip Views Counter

**Branch:** `feature/blip-views-counter`  
**Status:** Tested - Ready for Merge

---

## What

Implements view counting for Blips - displays view count with blinking eye icon, increments on each page visit.

---

## Files Changed

| File | Action |
|------|--------|
| `src/app/api/blip/views/[serial]/route.ts` | Created |
| `src/app/blip/components/ViewCounter.tsx` | Created |
| `src/app/blip/components/TrackView.tsx` | Created |
| `src/app/blip/[serial]/page.tsx` | Modified |
| `src/app/blip/components/BlipCardContent.tsx` | Modified |
| `src/app/blip/components/BlipModal.tsx` | Modified |

---

## Code Flow

```
┌─────────────────────────────────────────────────────────────┐
│           User visits /blip/[serial] page                   │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   TrackView.tsx          │    │   ViewCounter.tsx        │
│   (useEffect on mount)   │    │   (useEffect on mount)   │
│                          │    │                          │
│   POST /api/blip/views/  │    │   GET /api/blip/views/   │
│   [serial]               │    │   [serial]               │
└──────────────────────────┘    └──────────────────────────┘
              │                               │
              ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│              POST /api/blip/views/[serial]                  │
│                                                             │
│   Calls RPC: increment_blip_view(p_serial)                 │
│   → INSERT or UPDATE blip_views table                       │
│   → Returns { views: number }                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Footer Display (BlipCardContent.tsx)           │
│                                                             │
│   <ViewCounter serial={blip.blip_serial} />                │
│   → Shows: 👁 001 (blinking eye + formatted count)          │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Logic

### 1. API Endpoint (src/app/api/blip/views/[serial]/route.ts)

```typescript
// GET - Fetch view count
export async function GET(request, { params }) {
    const { serial } = await params;
    const { data } = await supabase
        .from('blip_views')
        .select('views')
        .eq('serial', serial)
        .single();
    
    return NextResponse.json({ views: data?.views ?? 0 });
}

// POST - Increment view count
export async function POST(request, { params }) {
    const { serial } = await params;
    const { data } = await supabase.rpc('increment_blip_view', {
        p_serial: serial
    });
    
    return NextResponse.json({ views: data });
}
```

### 2. TrackView Component (src/app/blip/components/TrackView.tsx)

```typescript
export default function TrackView({ serial }: TrackViewProps) {
    useEffect(() => {
        // Skip in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[BlipView] Tracking skipped (Development Mode)`);
            return;
        }

        // Fire and forget - increment view
        fetch(`/api/blip/views/${serial}`, {
            method: 'POST',
            cache: 'no-store',
        }).catch(console.warn);
    }, [serial]);

    return null;  // No UI rendered
}
```

### 3. ViewCounter Component (src/app/blip/components/ViewCounter.tsx)

```typescript
export default function ViewCounter({ serial }: ViewCounterProps) {
    const [views, setViews] = useState<number | null>(null);

    useEffect(() => {
        fetch(`/api/blip/views/${serial}`, { method: 'GET' })
            .then(res => res.json())
            .then(data => setViews(data.views ?? 0));
    }, [serial]);

    const formattedCount = views === null 
        ? 'xxx' 
        : views.toString().padStart(3, '0');

    return (
        <span>
            <BlinkingEye />
            <ScrambleText text={formattedCount} />
        </span>
    );
}
```

### 4. Blinking Eye Animation

Uses CSS keyframes `blink-open` and `blink-closed` with 4s cycle:
- Eye open for 95% of cycle
- Eye closed for 5% of cycle

---

## Database

### Table: blip_views

| Column | Type | Description |
|--------|------|-------------|
| `serial` | TEXT | Primary key (blip serial) |
| `views` | INTEGER | View count, default 0 |
| `created_at` | TIMESTAMPTZ | Record creation |
| `updated_at` | TIMESTAMPTZ | Last increment |

### Function: increment_blip_view

```sql
CREATE FUNCTION increment_blip_view(p_serial TEXT) RETURNS INTEGER AS $$
BEGIN
    INSERT INTO blip_views (serial, views) VALUES (p_serial, 1)
    ON CONFLICT (serial) DO UPDATE
    SET views = blip_views.views + 1, updated_at = now()
    RETURNING views INTO v_views;
    RETURN v_views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Why Views May Not Show

| Reason | Solution |
|--------|----------|
| Running in dev mode | Use `npm run build && npm run start` |
| DB migration not run | Execute `001-blip-views.sql` in Supabase |
| API returning error | Check Network tab for 500 errors |
| First visit (null state) | Shows "xxx" until loaded |

---

## Manual Tests

1. **View counter display:**
   - Navigate to `/blip`
   - Each BlipCard shows 👁 + number in footer

2. **View increment:**
   - Note view count on a blip
   - Open blip detail page
   - Return to `/blip` — count incremented by 1

3. **Network verification:**
   - Open DevTools → Network tab
   - Visit `/blip/[serial]`
   - Verify POST to `/api/blip/views/[serial]`

4. **Database verification:**
   ```sql
   SELECT * FROM blip_views ORDER BY views DESC;
   ```

---

## Enhancement Log

### 2026-03-12: Track Views on Modal Open

**Issue:** Views were only tracked when visiting `/blip/[serial]` page, not when opening blip in modal via `/blip?blip=I`.

**Solution:** Added `TrackView` component to `BlipModal.tsx` so views are tracked when modal opens.

**Files Changed:**
| File | Action |
|------|--------|
| `src/app/blip/components/BlipModal.tsx` | Modified - added TrackView import and render |

**Code Change:**
```typescript
// Added import
import TrackView from './TrackView'

// Added inside modal card (line 152)
{activeBlip && <TrackView serial={activeBlip.blip_serial} />}
```

**Decision:** Count both modal open and dedicated page visit as separate views (no deduplication).

**Testing:**
- API tests passed: GET/POST to `/api/blip/views/[serial]` working
- Build passed after enhancement

**Test Results:**
| Test | Result | Details |
|------|--------|---------|
| GET `/api/blip/views/I` | ✅ Pass | Returns `{"views":3}` |
| POST `/api/blip/views/I` | ✅ Pass | Increments to `{"views":4}` |
| Invalid serial | ✅ Pass | Returns 404 `{"error":"Blip not found"}` |
| Build | ✅ Pass | No TypeScript errors |
| Modal tracking | ✅ Pass | TrackView renders in BlipModal |
