# Metadata System Report

Comprehensive documentation of the SEO metadata, OpenGraph, Twitter Cards, JSON-LD structured data, sitemap, and robots.txt implementation.

## Overview

This site implements a complete SEO strategy using Next.js 15's Metadata API, including:
- Static and dynamic metadata for all pages
- OpenGraph and Twitter Card support
- JSON-LD structured data for rich search results
- Dynamic sitemap generation
- Robots.txt configuration

---

## Configuration Files

### Centralized Config: `src/config/metadata.ts`

Site-wide constants used across all metadata implementations:

```typescript
export const SITE_URL = 'https://sumitsute.com';
export const SITE_NAME = 'Sumit Sute Personal Dev Page';
export const SITE_AUTHOR = 'Sumit Sute';
export const DEFAULT_OG_IMAGE = '/sumit-sute-homepage.jpg';

export const pageMetadata = {
  home: { title, description, ogTitle, ogDescription },
  about: { title, description, ogTitle, ogDescription },
  work: { title, description, ogTitle, ogDescription },
  bloq: { title, description, ogTitle, ogDescription },
} as const;
```

---

## Root Layout Metadata

**File:** `src/app/layout.tsx`

### Base Metadata Object

| Property | Value |
|----------|-------|
| Title Template | `%s \| sumit sute` |
| Default Title | `sumit sute` |
| metadataBase | `https://sumitsute.com` |
| RSS Feed | `/feed.xml` |

### OpenGraph (Root)

```typescript
openGraph: {
  title: 'sumit sute',
  description: 'Projects and writing on agentic engineering...',
  url: SITE_URL,
  siteName: SITE_NAME,
  locale: 'en_US',
  images: [{ url: '/sumit-sute-homepage.jpg', width: 800, height: 600 }],
  type: 'website',
}
```

### Twitter Card (Root)

```typescript
twitter: {
  card: 'summary_large_image',
  title: 'sumit sute',
  description: 'Projects and writing on agentic engineering...',
  images: [{ url: '/sumit-sute-homepage.jpg' }],
}
```

### Root JSON-LD

Two schema objects injected into `<head>`:

1. **WebSite Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Sumit Sute's Dev Page",
  "url": "https://sumitsute.com",
  "description": "...",
  "author": { "@type": "Person", "name": "Sumit Sute" }
}
```

2. **Person Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Sumit Sute",
  "url": "https://sumitsute.com",
  "jobTitle": "Software Engineer",
  "knowsAbout": ["Web Development", "TypeScript", "React", "Next.js", "System Design"]
}
```

---

## Sitemap

**File:** `src/app/sitemap.ts`

### Configuration

- **Revalidation:** 3600 seconds (1 hour ISR)
- **Output:** `/sitemap.xml`

### URL Sources

| Source | Priority | Change Frequency |
|--------|----------|------------------|
| Homepage | 1.0 | weekly |
| /about | 0.8 | monthly |
| /work | 0.8 | weekly |
| /bloq | 0.8 | daily |
| /byte | 0.6 | daily |
| /blip | 0.6 | daily |
| /bloq/[slug] | 0.7 | monthly |
| /work/[slug] | 0.7 | monthly |
| /byte/[serial] | 0.5 | yearly |
| /blip/[serial] | 0.5 | monthly |

### Data Sources

| Content Type | Source | Query |
|--------------|--------|-------|
| Blog posts | MDX files | `getBloqPosts()` |
| Projects | Static data | `projects` array |
| Bytes | Supabase | `bytes` table |
| Blips | Supabase | `blips` table |

---

## Robots.txt

**File:** `src/app/robots.ts`

```typescript
{
  rules: {
    userAgent: '*',
    allow: '/',
    disallow: ['/api/', '/admin/'],
  },
  sitemap: 'https://sumitsute.com/sitemap.xml',
}
```

---

## Page-Level Metadata

### Static Pages

| Page | File | Metadata Type |
|------|------|---------------|
| About | `src/app/(pages)/about/page.tsx` | Static export |
| Work | `src/app/(pages)/work/page.tsx` | Static export |
| Bloq | `src/app/(pages)/bloq/page.tsx` | Static export |
| Byte | `src/app/(pages)/byte/page.tsx` | Static export |
| Blip | `src/app/(pages)/blip/page.tsx` | Static export |

### Dynamic Pages (generateMetadata)

| Page | File | Content Source |
|------|------|----------------|
| Bloq Post | `src/app/(pages)/bloq/[slug]/page.tsx` | MDX frontmatter |
| Byte Detail | `src/app/(pages)/byte/[serial]/page.tsx` | Supabase |
| Blip Detail | `src/app/(pages)/blip/[serial]/page.tsx` | Supabase |
| Project Detail | `src/app/(pages)/work/[slug]/page.tsx` | Static projects array |

---

## JSON-LD Structured Data

### Schema Types by Page

| Page | Schema Type | Purpose |
|------|-------------|---------|
| Root Layout | `WebSite` + `Person` | Site identity |
| /about | `ProfilePage` | Personal profile |
| /work | `ItemList` | Project listing |
| /bloq | `Blog` | Blog feed |
| /bloq/[slug] | `BlogPosting` | Individual article |
| /work/[slug] | `SoftwareSourceCode` | Project detail |
| /byte/[serial] | `SocialMediaPosting` | Short-form content |
| /blip/[serial] | `DefinedTerm` | Dictionary entry |

### Implementation Pattern

All JSON-LD components follow this pattern:

```tsx
function SchemaJsonLd({ data }: { data: DataType }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SchemaType',
    // ... properties
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

### Schema Details

#### ProfilePage (About)
```json
{
  "@type": "ProfilePage",
  "mainEntity": {
    "@type": "Person",
    "name": "Sumit Sute",
    "jobTitle": "Software Engineer",
    "knowsAbout": ["Web Development", "TypeScript", "React", "Next.js", "System Design"]
  }
}
```

#### ItemList (Work)
```json
{
  "@type": "ItemList",
  "name": "Projects by Sumit Sute",
  "numberOfItems": 2,
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "url": "...", "name": "..." }
  ]
}
```

#### Blog (Bloq Index)
```json
{
  "@type": "Blog",
  "name": "Blog | Sumit Sute",
  "blogPost": [
    { "@type": "BlogPosting", "headline": "...", "datePublished": "..." }
  ]
}
```

#### BlogPosting (Bloq Detail)
```json
{
  "@type": "BlogPosting",
  "headline": "Post Title",
  "datePublished": "2024-01-01",
  "dateModified": "2024-01-02",
  "author": { "@type": "Person", "name": "Sumit Sute" },
  "publisher": { "@type": "Person", "name": "Sumit Sute" }
}
```

#### SoftwareSourceCode (Work Detail)
```json
{
  "@type": "SoftwareSourceCode",
  "name": "Project Title",
  "description": "Project description",
  "author": { "@type": "Person", "name": "Sumit Sute" }
}
```

#### SocialMediaPosting (Byte Detail)
```json
{
  "@type": "SocialMediaPosting",
  "headline": "byte #123",
  "description": "Content preview...",
  "datePublished": "2024-01-01",
  "author": { "@type": "Person", "name": "Sumit Sute" }
}
```

#### DefinedTerm (Blip Detail)
```json
{
  "@type": "DefinedTerm",
  "name": "Term",
  "description": "Definition",
  "inDefinedTermSet": {
    "@type": "DefinedTermSet",
    "name": "Blip Dictionary",
    "url": "https://sumitsute.com/blip"
  }
}
```

---

## OpenGraph Implementation

### Image Strategy

- **Default OG Image:** `/sumit-sute-homepage.jpg` (800x600)
- **Blog posts:** Use post-specific image if defined in frontmatter
- **Other pages:** Use default image

### OG Types by Page

| Page | OG Type |
|------|---------|
| Homepage | `website` |
| About | `profile` |
| Bloq index | `website` |
| Bloq post | `article` |
| Work index | `website` |
| Work detail | `article` |
| Byte index | `website` |
| Byte detail | `article` |
| Blip index | `website` |
| Blip detail | `article` |

---

## Twitter Cards

All pages use `summary_large_image` card type.

### Properties Set
- `card`: Always `summary_large_image`
- `title`: Page-specific
- `description`: Page-specific
- `images`: Default or page-specific

---

## Canonical URLs

All pages include canonical URL in metadata:

```typescript
alternates: {
  canonical: `${SITE_URL}/path/to/page`,
}
```

---

## RSS Feed

Configured in root layout:

```typescript
alternates: {
  types: {
    'application/rss+xml': '/feed.xml',
  },
}
```

---

## Testing & Validation

### Recommended Tools

1. **Google Rich Results Test**
   - https://search.google.com/test/rich-results

2. **Schema.org Validator**
   - https://validator.schema.org/

3. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator

4. **Facebook Sharing Debugger**
   - https://developers.facebook.com/tools/debug/

5. **Sitemap Validation**
   - https://sumitsute.com/sitemap.xml

### Validation Checklist

- [ ] All pages have unique titles
- [ ] All pages have unique descriptions
- [ ] Canonical URLs are set
- [ ] OG images render correctly
- [ ] Twitter cards display properly
- [ ] JSON-LD validates without errors
- [ ] Sitemap is accessible and valid XML
- [ ] Robots.txt allows important pages

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root metadata + WebSite/Person JSON-LD
│   ├── sitemap.ts          # Dynamic sitemap
│   ├── robots.ts           # Robots.txt
│   └── (pages)/
│       ├── about/
│       │   └── page.tsx    # ProfilePage JSON-LD
│       ├── bloq/
│       │   ├── page.tsx    # Blog JSON-LD
│       │   └── [slug]/
│       │       └── page.tsx # BlogPosting JSON-LD
│       ├── byte/
│       │   ├── page.tsx    # OG/Twitter metadata
│       │   └── [serial]/
│       │       └── page.tsx # SocialMediaPosting JSON-LD
│       ├── blip/
│       │   ├── page.tsx    # OG/Twitter metadata
│       │   └── [serial]/
│       │       └── page.tsx # DefinedTerm JSON-LD
│       └── work/
│           ├── page.tsx    # ItemList JSON-LD
│           └── [slug]/
│               └── page.tsx # SoftwareSourceCode JSON-LD
├── config/
│   └── metadata.ts         # Centralized constants
└── lib/
    ├── bloq/               # Blog post data
    ├── byte/               # Byte data (Supabase)
    └── blip/               # Blip data (Supabase)
```

---

## Recent Changes

### 2026-03-21

- Added dynamic sitemap (`src/app/sitemap.ts`)
- Added robots.txt (`src/app/robots.ts`)
- Added OG/Twitter metadata to `/byte` index page
- Added OG/Twitter metadata to `/blip` index page
- Added `DefinedTerm` JSON-LD to blip detail pages
- Added `ProfilePage` JSON-LD to about page
- Added `ItemList` JSON-LD to work index page
- Added `Blog` JSON-LD to bloq index page
- Enhanced canonical URLs using centralized `SITE_URL` constant
