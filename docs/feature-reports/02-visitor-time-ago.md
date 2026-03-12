# Visitor Time Ago

**Branch:** `feature/visitor-time-ago`  
**Status:** Complete

---

## What

Displays "time ago" alongside last visitor location in footer (e.g., "Mumbai, IN · 5m ago").

---

## Files Changed

| File | Action |
|------|--------|
| `src/lib/formatTimeAgo.ts` | Created |
| `src/app/api/visit/route.ts` | Modified |
| `src/hooks/useAnalytics.ts` | Modified |
| `src/components/layout/footer/Footer.tsx` | Modified |
| `src/components/layout/footer/VisitorAnalytics.tsx` | Refactored |
| `src/app/layout.tsx` | Modified |

---

## Bugs Fixed

### 1. API Not Called When Location Lookup Fails

**Problem:** `VisitorAnalytics.tsx` guarded `trackSiteVisit` with `if (locationData)`. If ipapi.co failed (rate limited/network error), the API was never hit.

**Fix:** Call `trackSiteVisit(locationData)` unconditionally - the API handles null location data.

### 2. State Not Shared Between Hook Instances

**Problem:** Each `useAnalytics()` call created isolated state. `VisitorAnalytics` updated its state, but `Footer` read from a different instance.

```
VisitorAnalytics.tsx → useAnalytics() → Instance A (state updated here)
Footer.tsx → useVisitorData() → useAnalytics() → Instance B (state never updated!)
```

**Fix:** Refactored `VisitorAnalytics.tsx` to use React Context instead of a custom hook:

```typescript
const VisitorDataContext = createContext<VisitorData>({...});
export const useVisitorData = () => useContext(VisitorDataContext);
```

### 3. Context Provider Never Mounted

**Problem:** `VisitorAnalytics` was exported but never used in the layout. The Context provider didn't exist, so `useVisitorData()` always returned default null values.

**Fix:** Added `VisitorAnalytics` wrapper in `src/app/layout.tsx`:

```typescript
import Footer, { VisitorAnalytics } from "../components/layout/Footer";

// In return statement:
<VisitorAnalytics>
  <main>{children}</main>
  <Footer />
</VisitorAnalytics>
```

---

## Debugging Process

When `useVisitorData()` returned all nulls:

1. **Added console.log to Footer** - Confirmed null values were being read
2. **Added console.log to VisitorAnalytics useEffect** - Never fired, meaning component wasn't running
3. **Searched for VisitorAnalytics usage** - Found it was exported but never imported/mounted in layout
4. **Added VisitorAnalytics wrapper to layout.tsx** - Feature started working

---

## Code Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Page Load                                │
│         layout.tsx wraps with VisitorAnalytics              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           VisitorAnalytics.tsx (useEffect)                  │
│                                                             │
│   1. Gets locationData from useCurrentVisitorLocation()     │
│   2. Calls trackSiteVisit(locationData)                     │
│   3. Updates local state: setVisitorData(...)               │
│   4. Provides state via VisitorDataContext                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  POST /api/visit                            │
│                                                             │
│   1. Insert current visit into 'visits' table               │
│   2. Query: SELECT from visits WHERE ip != current_ip       │
│      ORDER BY created_at DESC LIMIT 1                       │
│   3. Return: { lastVisitorLocation, lastVisitTime, ... }    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Footer.tsx (render)                            │
│                                                             │
│   const { lastVisitorLocation, lastVisitTime } =            │
│     useVisitorData();  // reads from Context                │
│                                                             │
│   const displayText = lastVisitorLocation                   │
│     ? (lastVisitTime                                        │
│         ? `${lastVisitorLocation} · ${formatTimeAgo(...)}`  │
│         : lastVisitorLocation)                              │
│     : 'Bengaluru, In';                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Logic Details

### 1. API Query (src/app/api/visit/route.ts)

```typescript
const { data: prevVisits } = await queryClient
    .from('visits')
    .select('city, country, created_at')
    .neq('ip', body.ip)           // Exclude CURRENT visitor
    .order('created_at', { ascending: false })
    .limit(1);

const lastVisitor = prevVisits?.[0] ?? null;

return NextResponse.json({ 
    lastVisitorLocation: lastVisitor 
        ? `${lastVisitor.city}, ${lastVisitor.country}` 
        : null,
    lastVisitTime: lastVisitor?.created_at ?? null,
    ...
});
```

**Important:** The query excludes the current IP (`.neq('ip', body.ip)`). This means:
- Shows PREVIOUS visitor's data, not your own
- If you're the first/only visitor → returns `null`
- Privacy feature: you don't see your own visit

### 2. Time Formatting (src/lib/formatTimeAgo.ts)

```typescript
export function formatTimeAgo(dateString: string | null | undefined): string {
    if (!dateString) return '';

    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${monthName} ${day}`;  // e.g., "Jan 15"
}
```

### 3. Display Logic (src/components/layout/footer/Footer.tsx)

```typescript
const { lastVisitorLocation, lastVisitTime, visitorCount } = useVisitorData();

const displayText = lastVisitorLocation 
    ? (lastVisitTime 
        ? `${lastVisitorLocation} · ${formatTimeAgo(lastVisitTime)}` 
        : lastVisitorLocation)
    : 'Bengaluru, In';  // Default fallback
```

| Condition | Display |
|-----------|---------|
| Both location + time | "Mumbai, IN · 5m ago" |
| Only location | "Mumbai, IN" |
| Neither (null) | "Bengaluru, In" |

### 4. Dev Mode Protection

```typescript
const trackSiteVisit = useCallback(async (currentLocation) => {
    if (process.env.NODE_ENV === 'development') {
        return;  // API never called in dev
    }
    // ... rest of tracking logic
}, []);
```

---

## Why Time Ago May Not Show

| Reason | Solution |
|--------|----------|
| Running in dev mode (`npm run dev`) | Use `npm run build && npm run start` |
| You're the only visitor | Wait for another visitor, or remove `.neq('ip', body.ip)` |
| visits table is empty | Insert test data or visit from different IP |
| API call failing | Check browser Network tab for errors |
| Context not wrapping Footer | Ensure VisitorAnalytics wraps the layout |

---

## Manual Tests

1. **Production build:**
   ```bash
   npm run build && npm run start
   ```
   Visit site → footer shows "City, CC · Xm ago" (if previous visits exist)

2. **First visitor scenario:**
   - Clear visits table
   - Visit site → shows default "Bengaluru, In"
   - Visit from different IP → now shows previous visitor

3. **Network debugging:**
   - Open DevTools → Network tab
   - Filter for "visit"
   - Check POST `/api/visit` response for `lastVisitTime` field
