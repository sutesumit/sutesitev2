# Plan: Fix Missing Metadata on Pages

## Overview

Add proper metadata (Open Graph, Twitter Cards, JSON-LD schemas) to all pages that currently lack it for proper social sharing when links are shared individually.

## Current State

### Pages WITH Custom Metadata
| Page | Path | What They Have |
|------|------|----------------|
| Blip Index | `/blip` | title, description, canonical |
| Bloq Post | `/bloq/[slug]` | title, description, OG (article), Twitter, BlogPosting JSON-LD |
| Blip Detail | `/blip/[serial]` | title, description, OG (article), Twitter, SocialMediaPosting JSON-LD |

### Pages WITHOUT Custom Metadata (Using Root Layout Defaults Only)
| Page | Path | Issue |
|------|------|-------|
| Home | `/` | No page-specific metadata |
| About | `/about` | No page-specific metadata |
| Work Index | `/work` | No page-specific metadata |
| Bloq Index | `/bloq` | No page-specific metadata |
| Work Project Detail | `/work/[slug]` | No dynamic metadata - CRITICAL |

---

## Root Layout Reference (`src/app/layout.tsx`)

```typescript
const SITE_URL = 'https://sumitsute.com';
const SITE_NAME = 'Sumit Sute Personal Dev Page';
const SITE_DESCRIPTION = "Sumit Sute's personal dev page, featuring projects and writing...";

export const metadata: Metadata = {
  title: { default: 'sumit sute', template: '%s | sumit sute' },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'sumit sute',
    description: "Projects and writing by Sumit Sute...",
    images: [{ url: '/sumit-sute-homepage.jpg', width: 800, height: 600 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'sumit sute',
    images: ['/sumit-sute-homepage.jpg'],
  },
};
```

---

## Implementation Details

### 1. Work Project Detail (`src/app/work/[slug]/page.tsx`)

**Priority: HIGH** - Most impactful fix

**Current State:**
- No `generateMetadata` export
- No dynamic metadata
- Project pages share generic homepage metadata

**Add:**
```typescript
import type { Metadata } from 'next';
import { projects } from '@/data/projectlist';

const SITE_URL = 'https://sumitsute.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  
  if (!project) {
    return { title: 'Project Not Found' };
  }

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `${SITE_URL}/work/${slug}` },
    openGraph: {
      title: project.title,
      description: project.description,
      url: `${SITE_URL}/work/${slug}`,
      siteName: 'Sumit Sute Personal Dev Page',
      type: 'article',
      publishedTime: '2024-01-01', // TODO: Add date to project data
      // Note: project.screenshot could be used for images if available
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
    },
  };
}
```

**Also Add JSON-LD:**
```typescript
function ProjectJsonLd({ project }: { project: ProjectProps }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode', // or 'Product' depending on project type
    name: project.title,
    description: project.description,
    url: `${SITE_URL}/work/${project.slug}`,
    author: {
      '@type': 'Person',
      name: 'Sumit Sute',
      url: SITE_URL,
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
```

---

### 2. Home Page (`src/app/page.tsx`)

**Priority: MEDIUM**

**Current State:**
- No metadata exports
- Inherits only from root layout

**Add to top of file:**
```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'home',
  description: 'Sumit Sute\'s personal dev page - projects and writing grounded in engineering approach',
  alternates: { canonical: 'https://sumitsute.com' },
  openGraph: {
    title: 'Sumit Sute | Developer',
    description: 'Personal dev page featuring projects and writing',
  },
  twitter: {
    title: 'Sumit Sute | Developer',
    description: 'Personal dev page featuring projects and writing',
  },
};
```

---

### 3. About Page (`src/app/about/page.tsx`)

**Priority: MEDIUM**

**Add:**
```typescript
import type { Metadata } from 'next';

const SITE_URL = 'https://sumitsute.com';

export const metadata: Metadata = {
  title: 'about',
  description: 'About Sumit Sute - journey from mechanical engineering to web development, featuring experience in journalism, photography, and community organizing',
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: 'About | Sumit Sute',
    description: 'Journey from mechanical engineering to web development',
  },
  twitter: {
    title: 'About | Sumit Sute',
    description: 'Journey from mechanical engineering to web development',
  },
};
```

---

### 4. Work Index (`src/app/work/page.tsx`)

**Priority: MEDIUM**

**Add:**
```typescript
import type { Metadata } from 'next';

const SITE_URL = 'https://sumitsute.com';

export const metadata: Metadata = {
  title: 'work',
  description: 'Projects by Sumit Sute - showcasing web development work, experiments, and side projects built with React, Next.js, and modern technologies',
  alternates: { canonical: `${SITE_URL}/work` },
  openGraph: {
    title: 'Work | Sumit Sute',
    description: 'Projects and experiments by Sumit Sute',
  },
  twitter: {
    title: 'Work | Sumit Sute',
    description: 'Projects and experiments by Sumit Sute',
  },
};
```

---

### 5. Bloq Index (`src/app/bloq/page.tsx`)

**Priority: MEDIUM**

**Add:**
```typescript
import type { Metadata } from 'next';

const SITE_URL = 'https://sumitsute.com';

export const metadata: Metadata = {
  title: 'blog',
  description: 'Writing by Sumit Sute on web development, engineering principles, and software craftsmanship',
  alternates: { canonical: `${SITE_URL}/bloq` },
  openGraph: {
    title: 'Blog | Sumit Sute',
    description: 'Writing on web development and engineering',
  },
  twitter: {
    title: 'Blog | Sumit Sute',
    description: 'Writing on web development and engineering',
  },
};
```

---

### 6. Blip Detail (`src/app/blip/[serial]/page.tsx`)

**Priority: LOW** - Fix inconsistency

**Current State:**
```typescript
twitter: {
  card: 'summary',  // ← Should be 'summary_large_image'
  title: `blip #${blip.blip_serial}`,
  description,
},
```

**Change `card` from `'summary'` to `'summary_large_image'`**

---

## Implementation Order

1. [ ] Create branch: `fix/page-metadata` ✓ (Done)
2. [ ] Modify `src/app/work/[slug]/page.tsx` - Add generateMetadata + JSON-LD
3. [ ] Modify `src/app/page.tsx` - Add static metadata
4. [ ] Modify `src/app/about/page.tsx` - Add static metadata
5. [ ] Modify `src/app/work/page.tsx` - Add static metadata
6. [ ] Modify `src/app/bloq/page.tsx` - Add static metadata
7. [ ] Modify `src/app/blip/[serial]/page.tsx` - Fix Twitter card
8. [ ] Run `npm run lint` to verify no errors
9. [ ] Commit and push

---

## Verification

After implementation, verify with:

1. **Local testing:**
   ```bash
   npm run build
   npm run start
   ```
   Then check each URL with Facebook Sharing Debugger or Twitter Card Validator

2. **Expected Results:**
   - `/work/my-project` should show project title/description when shared
   - `/about` should have specific about page metadata
   - Twitter cards should show large image preview
   - All pages should have correct canonical URLs

---

## Notes

- Project screenshots could be added to OG images if available in project data
- Consider adding `publishedTime` to project data structure for richer metadata
- Bloq index could dynamically calculate post count for description
- All pages should have consistent metadata structure once complete
