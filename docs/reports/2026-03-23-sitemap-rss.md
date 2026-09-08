# Sitemap and RSS Feed Implementation Report

## What

This site implements XML feeds with human-readable XSLT stylesheets:

| Feed | URL | XSLT | Revalidate |
|------|-----|------|------------|
| Sitemap | `/sitemap.xml` | `/sitemap.xsl` | 6 hours |
| RSS | `/feed.xml` | `/feed.xsl` | 6 hours |

---

## Why

### Sitemap Benefits

1. **Discovery** - Helps search engines find all pages, especially dynamic content
2. **Priority** - Communicates which pages are more important
3. **Freshness** - Indicates when content was last modified
4. **Indexing Speed** - New content gets indexed faster

### RSS Benefits

1. **Subscriptions** - Readers can follow updates without visiting
2. **Syndication** - Content can be aggregated by other platforms
3. **Notifications** - Readers get notified of new content

### XSLT Stylesheet Benefits

1. **Human-Readable** - Browsers render styled HTML instead of raw XML
2. **Brand Consistent** - Matches site design (dark mode, monospace, lowercase)
3. **Crawler Compatible** - Search engines and RSS readers parse raw XML

### Why No Robots.txt

Removed because:
- No sensitive crawlable paths
- Search engines discover sitemaps via standard `/sitemap.xml` location
- Minimal value for a personal site

---

## How

### Implementation

| File | Purpose |
|------|---------|
| `src/app/sitemap.xml/route.ts` | Generates sitemap XML |
| `src/app/feed.xml/route.ts` | Generates RSS XML |
| `public/sitemap.xsl` | Sitemap stylesheet |
| `public/feed.xsl` | RSS stylesheet |

### Revalidation Strategy

ISR (Incremental Static Regeneration) caches are refreshed on-demand:

| Feed | Time | Rationale |
|------|------|-----------|
| Sitemap | 6 hours | Search engines crawl ~daily |
| RSS | 6 hours | Low-traffic personal site, delayed updates acceptable |

**How ISR works:**
- Cache expires after X seconds
- Next request **after** expiry triggers regeneration
- NOT a cron job - only runs when visited
- Results cached at CDN edge

### Content Sources

**Sitemap:**
- Static pages (home, about, work, bloq, byte, blip)
- Blog posts (bloqs) from MDX files
- Projects from static data
- Bytes from Supabase
- Blips from Supabase

**RSS:**
- Blog posts (bloqs) from MDX files
- Bytes from Supabase
- Sorted by publish date, limited to 50 items

### XSLT Features

- **Dark mode only** - matches site's default theme
- **Tailwind slate colors** - `#0f172a` bg, `#cbd5e1` text, `#60a5fa` accent
- **Monospace font** - Roboto Mono
- **Lowercase text** - consistent with site aesthetic
- **Tree format (sitemap)** - URLs grouped by section

---

## Content Priority Strategy (Sitemap)

| Content Type | Priority | Change Frequency | Rationale |
|--------------|----------|------------------|-----------|
| Homepage | 1.0 | weekly | Most important entry point |
| Main pages | 0.8 | weekly/monthly | Core navigation |
| Blog posts | 0.7 | monthly | Stable content |
| Projects | 0.7 | monthly | Portfolio items |
| Bytes | 0.5 | yearly | Archived content |
| Blips | 0.5 | monthly | May receive updates |

---

## Verification

### Browser
- `https://sumitsute.com/sitemap.xml` - styled sitemap
- `https://sumitsute.com/feed.xml` - styled RSS

### Raw XML
```bash
curl https://sumitsute.com/sitemap.xml
curl https://sumitsute.com/feed.xml
```

### Google Search Console
1. Submit sitemap at `https://search.google.com/search-console`
2. Monitor indexing status

---

## User Interface

Links on homepage (`HomeContent.tsx`):

```tsx
<div className="mt-4 text-xs opacity-50 transition-opacity hover:opacity-100">
  <Link href="/sitemap.xml">sitemap</Link>
</div>
```

RSS link in footer (existing `CopyLink` component).

---

## Technical Notes

- **Framework**: Next.js 15 App Router with custom route handlers
- **Generation**: Server-side, on-demand with ISR
- **Content-Type**: `application/xml` with cache headers
- **XSLT**: Static files served from `/public`
