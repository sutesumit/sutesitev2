# Debug Report: Visit Tracking API Always Returning Same Data

**Date:** 2026-03-12  
**Issue:** `/api/visit` endpoint always returning `{"lastVisitorLocation":"Bengaluru, IN","lastVisitTime":"2026-03-11T06:31:53.400857+00:00","visitorCount":313}` regardless of actual visitors

---

## Initial Problem

The visit tracking feature was supposed to:
1. Record each visitor's IP and location to a Supabase `visits` table
2. Return the last visitor's location and total visitor count

However, the API kept returning the same static response from March 11, 2026.

---

## Investigation Steps

### Step 1: Initial Code Review

Reviewed `src/app/api/visit/route.ts` and identified a potential issue with the `.neq('ip', body.ip)` filter that excludes the current visitor's IP.

**Hypothesis:** The filter was returning the same "last other visitor" because all requests were being made from the same IP.

**Verdict:** This was a red herring - not the root cause.

### Step 2: Added Server-Side Debug Logging

Added console.log statements to the API route to inspect:
- What data was being received (`body.ip`, `body.city`, etc.)
- What the database query was returning

**Discovery:**
```
[DEBUG visit API] body.ip: undefined body.city: undefined body.country_code: undefined
```

The API was receiving **empty data** from the frontend.

### Step 3: Investigated Location Service

The frontend fetches visitor location using `IpApiLocationService` (ipapi.co). The service appeared to work (returned 200 OK), but the data wasn't being sent to the API properly.

### Step 4: Added Client-Side Debug Logging

Added console.log statements to trace the data flow:
1. `IpApiLocationService.fetchLocation()`
2. `useLocation` hook
3. `VisitorAnalytics` component
4. `trackSiteVisit` function

**Critical Discovery - The Race Condition:**

```
1. [DEBUG VisitorAnalytics] locationData: null
2. [DEBUG trackSiteVisit] Sending to API: null     ← SENT BEFORE LOCATION ARRIVES!
3. [DEBUG useLocation] Received data: { ip: "49.204..." }  ← LOCATION ARRIVES LATER
4. [DEBUG VisitorAnalytics] locationData: { ip: "49.204..." }  ← UPDATED TOO LATE
```

The timeline revealed:
1. Component renders → `trackSiteVisit(null)` called
2. `hasTrackedVisit.current = true` set immediately
3. Location fetch completes → `locationData` updates
4. `trackSiteVisit(locationData)` called again
5. **`hasTrackedVisit.current` is already `true`** → returns early, doesn't send!

---

## Failed Attempts

### Attempt 1: Fix `.neq()` Filter
- Modified the query to conditionally apply the IP filter
- This was a good improvement but didn't solve the main issue

### Attempt 2: Change Location Service
- Switched from ipapi.co to ipwho.is (thinking ipapi was rate-limited)
- Reverted back when user confirmed ipapi.co was working

### Attempt 3: Fix Backend Insert Condition
- Changed `if (body.city || body.country_code)` to `if (body.ip)`
- This ensured records could be inserted with just IP, even if location failed
- This was a good defensive fix but not the root cause

---

## Root Cause Identified

**Primary Bug: Race Condition in Frontend**

The `hasTrackedVisit` ref was being set to `true` on the first render, before the async location fetch completed. When the location data arrived later, the tracking function would return early because the flag was already set.

```
Timeline (BUGGY):
1. Component mounts
2. useEffect triggers trackSiteVisit(null)
3. hasTrackedVisit.current = true  ← SETS TOO EARLY!
4. Location fetch completes (async)
5. locationData updates
6. useEffect triggers again with locationData
7. trackSiteVisit() checks hasTrackedVisit.current (true) → returns early!
```

---

## Final Fix

### Frontend Fix (`VisitorAnalytics.tsx`)

```typescript
const trackSiteVisit = useCallback(async (currentLocation: LocationData | null) => {
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    // Don't track if we don't have location data yet
    if (!currentLocation || !currentLocation.ip) {
      return;  // ← Returns early WITHOUT setting hasTrackedVisit
    }

    if (hasTrackedVisit.current) return;
    hasTrackedVisit.current = true;
    
    // ... API call
}, []);
```

Key change: Return early when location is missing, **before** setting `hasTrackedVisit.current = true`.

### Backend Fix (`route.ts`)

```typescript
// Changed from: if (body.city || body.country_code)
// To:
if (body.ip) {
    // Insert with IP, location fields optional
}
```

This ensures records are inserted even if location lookup fails.

---

## What Worked

1. **Wait for location data** - Don't track visit until we have valid location data
2. **Don't block on null** - Return early without setting the "already tracked" flag
3. **IP-only insert** - Allow inserting records with just an IP address

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/layout/footer/VisitorAnalytics.tsx` | Added null check before tracking |
| `src/app/api/visit/route.ts` | Changed insert condition to require only IP |
| `src/hooks/useLocation.ts` | (No functional change, cleanup) |
| `src/services/location/IpApiLocationService.ts` | (No functional change, cleanup) |

---

## Commit

```
fix: resolve race condition in visit tracking

- Wait for location data before tracking visit in frontend
- Insert visit record if IP exists (location optional)
- Fix query to handle undefined IP properly

Root cause: trackSiteVisit was called before location fetch completed,
setting hasTrackedVisit=true with null data, blocking subsequent attempts.
```

Merged to `main` on 2026-03-12
