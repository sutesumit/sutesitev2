# Plan: Blip Permalink Metadata Customization

## Goal
Add unique metadata (title, description, OG tags, Twitter cards, JSON-LD) for individual blips via a dynamic route `/blip/[serial]`, while preserving the existing modal-based browsing experience at `/blip`.

## Architecture

### Current State
- `/blip` - Lists all blips, clicking opens modal with query param `?blip=XXX`
- No metadata for blip pages
- BlipModal copies permalink as `/blip?blip=XXX`

### Target State
- `/blip` - Unchanged (modal browsing experience)
- `/blip/[serial]` - NEW: Standalone page for individual blip with full metadata
- BlipModal copies permalink as `/blip/[serial]` (SEO-friendly)

## Implementation Steps

### Step 1: Add server-side blip fetcher by serial
**File:** `src/lib/blip.ts`

Add new function:
```typescript
export async function getBlipBySerial(serial: string): Promise<Blip | null>
```
- Query Supabase for blip with matching `blip_serial`
- Return null if not found

### Step 2: Create dynamic route `/blip/[serial]/page.tsx`
**File:** `src/app/blip/[serial]/page.tsx` (NEW)

Include:
- `generateMetadata()` - Dynamic metadata per blip:
  - Title: `blip #${serial} | sumit sute`
  - Description: Truncated blip content (first ~150 chars)
  - OG tags with blip content
  - Twitter card
  - Canonical URL: `https://sumitsute.com/blip/${serial}`
- JSON-LD structured data (SocialMediaPosting or Comment schema)
- Page component rendering:
  - Blip content (reuse BlipCard styling or create BlipDetail component)
  - "Back to all blips" link
  - ClapsCounter
  - Full timestamp

### Step 3: Update BlipModal permalink
**File:** `src/app/blip/components/BlipModal.tsx`

Change line ~46:
```typescript
// FROM:
navigator.clipboard.writeText(window.location.href)
// TO:
navigator.clipboard.writeText(`${window.location.origin}/blip/${activeBlip.blip_serial}`)
```

### Step 4: Add static metadata to main `/blip` page
**File:** `src/app/blip/page.tsx`

Add metadata export:
```typescript
export const metadata: Metadata = {
  title: 'blip',
  description: 'Short thoughts and updates by Sumit Sute',
  openGraph: { ... },
  twitter: { ... },
}
```

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/blip.ts` | MODIFY | Add `getBlipBySerial()` |
| `src/app/blip/[serial]/page.tsx` | CREATE | Dynamic route with metadata |
| `src/app/blip/components/BlipModal.tsx` | MODIFY | Update permalink to use `/blip/[serial]` |
| `src/app/blip/page.tsx` | MODIFY | Add static metadata |

## Metadata Structure (per blip)

Following the pattern from `layout.tsx` and `bloq/[slug]/page.tsx`:

```typescript
{
  title: `blip #${serial}`,
  description: truncatedContent,
  alternates: {
    canonical: `${SITE_URL}/blip/${serial}`,
  },
  openGraph: {
    title: `blip #${serial}`,
    description: truncatedContent,
    url: `${SITE_URL}/blip/${serial}`,
    siteName: 'Sumit Sute Personal Dev Page',
    type: 'article',
    publishedTime: blip.created_at,
  },
  twitter: {
    card: 'summary',
    title: `blip #${serial}`,
    description: truncatedContent,
  },
}
```

## JSON-LD Schema

```typescript
{
  '@context': 'https://schema.org',
  '@type': 'SocialMediaPosting',
  headline: `blip #${serial}`,
  articleBody: blip.content,
  datePublished: blip.created_at,
  author: {
    '@type': 'Person',
    name: 'Sumit Sute',
    url: SITE_URL,
  },
}
```

## Notes

- Pagination on `/blip` is independent and unaffected
- Dynamic route uses `serial` (string) not `id` (UUID) for cleaner URLs
- Error handling: Return 404 for non-existent serials
