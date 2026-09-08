# Metadata Consistency Audit

Date: 2026-03-27

## Scope

This audit compares the URLs intentionally exposed by the sitemap with the metadata patterns implemented in the live App Router files. The goal is not to judge SEO quality in the abstract, but to identify where this codebase is already consistent, where it drifts, and what normalization work would give the cleanest long-term system.

Sources inspected:

- `src/app/layout.tsx`
- `src/config/metadata.ts`
- `src/app/sitemap.xml/route.ts`
- `src/app/(pages)/page.tsx`
- `src/app/(pages)/about/page.tsx`
- `src/app/(pages)/work/page.tsx`
- `src/app/(pages)/work/[slug]/page.tsx`
- `src/app/(pages)/bloq/page.tsx`
- `src/app/(pages)/bloq/[slug]/page.tsx`
- `src/app/(pages)/byte/page.tsx`
- `src/app/(pages)/byte/[serial]/page.tsx`
- `src/app/(pages)/blip/page.tsx`
- `src/app/(pages)/blip/[serial]/page.tsx`

## Sitemap Coverage

The sitemap declares five route families plus the homepage:

- `/` in [`src/app/sitemap.xml/route.ts:48`](C:\Users\Sute\Documents\v2.sutesite\src\app\sitemap.xml\route.ts:48)
- `/about` in [`src/app/sitemap.xml/route.ts:55`](C:\Users\Sute\Documents\v2.sutesite\src\app\sitemap.xml\route.ts:55)
- `/work` and `/work/[slug]` in [`src/app/sitemap.xml/route.ts:61`](C:\Users\Sute\Documents\v2.sutesite\src\app\sitemap.xml\route.ts:61) and [`src/app/sitemap.xml/route.ts:95`](C:\Users\Sute\Documents\v2.sutesite\src\app\sitemap.xml\route.ts:95)
- `/bloq` and `/bloq/[slug]` in [`src/app/sitemap.xml/route.ts:67`](C:\Users\Sute\Documents\v2.sutesite\src\app\sitemap.xml\route.ts:67) and [`src/app/sitemap.xml/route.ts:87`](C:\Users\Sute\Documents\v2.sutesite\src\app\sitemap.xml\route.ts:87)
- `/byte` and `/byte/[serial]` in [`src/app/sitemap.xml/route.ts:73`](C:\Users\Sute\Documents\v2.sutesite\src\app\sitemap.xml\route.ts:73) and [`src/app/sitemap.xml/route.ts:109`](C:\Users\Sute\Documents\v2.sutesite\src\app\sitemap.xml\route.ts:109)
- `/blip` and `/blip/[serial]` in [`src/app/sitemap.xml/route.ts:79`](C:\Users\Sute\Documents\v2.sutesite\src\app\sitemap.xml\route.ts:79) and [`src/app/sitemap.xml/route.ts:121`](C:\Users\Sute\Documents\v2.sutesite\src\app\sitemap.xml\route.ts:121)

Every sitemap route family does have page metadata. That is the good news: there are no route families in the sitemap that are completely unaccounted for in metadata.

## Current Pattern By Route Family

| Route family | Metadata export | Canonical | Open Graph | Twitter | JSON-LD | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Static `metadata` | Yes | Partial override | Partial override | No page-level JSON-LD | Inherits layout defaults for omitted fields |
| `/about` | Static `metadata` | Yes | Explicit | Explicit | `ProfilePage` | Strongest static implementation |
| `/work` | Static `metadata` | Yes | Explicit | Explicit | `ItemList` | Good list-page pattern |
| `/work/[slug]` | `generateMetadata` | Yes | Explicit | Explicit | `SoftwareSourceCode` | OG type differs from JSON-LD intent |
| `/bloq` | Static `metadata` | Yes | Explicit | Explicit | `Blog` | Strong implementation |
| `/bloq/[slug]` | `generateMetadata` | Yes | Explicit | Explicit | `BlogPosting` | Best dynamic implementation overall |
| `/byte` | Static `metadata` | Yes | Explicit | Explicit | None | No structured data on index page |
| `/byte/[serial]` | `generateMetadata` | Yes | Explicit | Explicit | `SocialMediaPosting` | Good detail pattern |
| `/blip` | Static `metadata` | Yes | Explicit | Explicit | None | No structured data on index page |
| `/blip/[serial]` | `generateMetadata` | Yes | Explicit | Explicit | `DefinedTerm` | Good detail pattern |

## What Is Already Consistent

- Every sitemap route family has a canonical URL.
- Every detail page exposed in the sitemap has page-specific metadata rather than inheriting the homepage.
- All detail pages use `generateMetadata`.
- All detail pages use JSON-LD.
- Most pages use `summary_large_image` Twitter cards.
- The sitemap is generated from the same primary content sources the pages use: MDX, project data, and Supabase-backed content.

That foundation is solid. This is not a system with missing metadata. It is a system with drift between otherwise good implementations.

## Inconsistencies Worth Fixing

### 1. Site identity is duplicated and has already drifted

The root layout defines its own site constants in [`src/app/layout.tsx:13`](C:\Users\Sute\Documents\v2.sutesite\src\app\layout.tsx:13), while the rest of the app uses `src/config/metadata.ts`.

Current mismatch:

- Layout `SITE_NAME`: `Sumit Sute's Dev Page` in [`src/app/layout.tsx:14`](C:\Users\Sute\Documents\v2.sutesite\src\app\layout.tsx:14)
- Shared config `SITE_NAME`: `Sumit Sute Personal Dev Page` in [`src/config/metadata.ts:2`](C:\Users\Sute\Documents\v2.sutesite\src\config\metadata.ts:2)

Effect:

- `openGraph.siteName` can differ between layout-level defaults and page-level overrides.
- Root `WebSite` JSON-LD uses a different site name than route metadata.
- This makes the metadata system harder to reason about because the supposed source of truth is not actually singular.

### 2. The root layout description contains mojibake

The description string in [`src/app/layout.tsx:15`](C:\Users\Sute\Documents\v2.sutesite\src\app\layout.tsx:15) contains `â€”` instead of a proper dash. That is small, but it is exactly the kind of defect that spreads into snippets, schema, and share previews.

### 3. Home page metadata uses a different composition pattern than the other static pages

The homepage only sets:

- `title`
- `description`
- `alternates.canonical`
- `openGraph.title`
- `openGraph.description`
- `twitter.title`
- `twitter.description`

See [`src/app/(pages)/page.tsx:11`](C:\Users\Sute\Documents\v2.sutesite\src\app\(pages)\page.tsx:11).

By contrast, `/about`, `/work`, `/bloq`, `/byte`, and `/blip` explicitly set `openGraph.url`, `openGraph.siteName`, `openGraph.type`, and `twitter.card`.

Because Next merges metadata, the homepage is not broken. But it is inconsistent in authorship style:

- Home relies on inherited defaults.
- Other pages define a fuller page-local contract.

If someone later changes root defaults, the homepage will change in ways the other static pages do not.

### 4. Centralized page metadata only covers some sections

`pageMetadata` in [`src/config/metadata.ts:7`](C:\Users\Sute\Documents\v2.sutesite\src\config\metadata.ts:7) includes only:

- `home`
- `about`
- `work`
- `bloq`

But the sitemap also treats `byte` and `blip` as first-class route families. Their metadata is still hardcoded locally in:

- [`src/app/(pages)/byte/page.tsx:14`](C:\Users\Sute\Documents\v2.sutesite\src\app\(pages)\byte\page.tsx:14)
- [`src/app/(pages)/blip/page.tsx:14`](C:\Users\Sute\Documents\v2.sutesite\src\app\(pages)\blip\page.tsx:14)

This creates an uneven system:

- Some top-level sections are centrally configured.
- Some top-level sections are not.

That is manageable now, but it is the kind of asymmetry that makes copy updates and future refactors more error-prone.

### 5. JSON-LD coverage is inconsistent on index pages

Index pages with JSON-LD:

- `/about` -> `ProfilePage`
- `/work` -> `ItemList`
- `/bloq` -> `Blog`

Index pages without JSON-LD:

- `/` -> none beyond root `WebSite` and `Person`
- `/byte` -> none
- `/blip` -> none

This is not necessarily wrong, but the pattern is inconsistent. If the intent is that each route family exposed in the sitemap should also describe itself structurally, then `byte` and `blip` index pages are the current gaps.

Potential schema directions:

- `/byte` could use `CollectionPage` or `ItemList`
- `/blip` could use `DefinedTermSet` or `CollectionPage`
- `/` could add a page-level `WebPage` or `CollectionPage` if you want the homepage itself to be explicit rather than only the site identity

### 6. `work/[slug]` sends mixed signals about content type

Project detail pages use:

- Open Graph `type: 'article'` in [`src/app/(pages)/work/[slug]/page.tsx:24`](C:\Users\Sute\Documents\v2.sutesite\src\app\(pages)\work\[slug]\page.tsx:24)
- JSON-LD `@type: 'SoftwareSourceCode'` in [`src/app/(pages)/work/[slug]/page.tsx:41`](C:\Users\Sute\Documents\v2.sutesite\src\app\(pages)\work\[slug]\page.tsx:41)

This is not invalid, but it is semantically awkward. A project page is being described:

- socially as an article
- structurally as software

If the project pages are portfolio entries rather than essays, this would be cleaner if their OG strategy and schema strategy felt more aligned.

### 7. `bloq/[slug]` bypasses the shared metadata config

The bloq detail page hardcodes its own `SITE_URL` constant in [`src/app/(pages)/bloq/[slug]/page.tsx:23`](C:\Users\Sute\Documents\v2.sutesite\src\app\(pages)\bloq\[slug]\page.tsx:23) and hardcodes `siteName` in [`src/app/(pages)/bloq/[slug]/page.tsx:54`](C:\Users\Sute\Documents\v2.sutesite\src\app\(pages)\bloq\[slug]\page.tsx:54).

This is minor, but it is exactly the sort of “almost centralized” drift that later turns into silent inconsistency.

### 8. Sitemap `lastModified` is not trustworthy for static pages and projects

The sitemap currently sets `lastModified: new Date()` for:

- `/`
- `/about`
- `/work`
- `/bloq`
- `/byte`
- `/blip`
- all `/work/[slug]`

See [`src/app/sitemap.xml/route.ts:48`](C:\Users\Sute\Documents\v2.sutesite\src\app\sitemap.xml\route.ts:48) through [`src/app/sitemap.xml/route.ts:99`](C:\Users\Sute\Documents\v2.sutesite\src\app\sitemap.xml\route.ts:99).

That means every sitemap regeneration claims those URLs were just modified, even if nothing changed.

This matters to the metadata audit because the sitemap is acting as the declared inventory and freshness layer for the same pages whose metadata you want to standardize. Right now:

- metadata is mostly content-derived
- sitemap freshness is partly content-derived and partly “time of request”

That weakens the overall consistency story.

## Recommended Normalized Pattern

If the goal is a system that stays coherent as the site grows, the cleanest pattern would be:

1. One shared site identity source
   - `SITE_URL`
   - `SITE_NAME`
   - `SITE_AUTHOR`
   - default descriptions
   - default OG image

2. One shared per-section metadata config for every sitemap-listed top-level family
   - `home`
   - `about`
   - `work`
   - `bloq`
   - `byte`
   - `blip`

3. One helper pattern for static pages
   - title
   - description
   - canonical
   - OG title, description, url, siteName, type
   - Twitter card, title, description

4. One helper pattern for dynamic detail pages
   - derive title and description from content
   - derive canonical from route
   - derive OG and Twitter from the same source object
   - attach schema matching the page’s real content model

5. One explicit rule for index-page JSON-LD
   - either every first-class section gets page-level schema
   - or only sections with strong semantic types do
   - but the rule should be deliberate, not accidental

6. One explicit rule for sitemap freshness
   - use true content timestamps where available
   - avoid `new Date()` as a fallback for stable pages unless the page genuinely changes on each deployment or data refresh

## Tailored Recommendations For This Site

### High priority

- Import shared constants into [`src/app/layout.tsx`](C:\Users\Sute\Documents\v2.sutesite\src\app\layout.tsx) and remove duplicate site identity values.
- Fix the mojibake in the layout description.
- Extend `pageMetadata` to include `byte` and `blip`.
- Update the homepage metadata to explicitly set the same core fields the other static pages set.

### Medium priority

- Decide whether `/byte` and `/blip` index pages should get JSON-LD. I would recommend yes, because they are sitemap-listed, navigable content collections, and already treated as named sections of the site.
- Refactor `bloq/[slug]` to use shared constants instead of hardcoded `SITE_URL` and `siteName`.
- Revisit the Open Graph type for `work/[slug]` so the portfolio/project story is more internally coherent.

### Medium-to-high priority

- Make sitemap `lastModified` values honest. For static pages and projects, either:
  - attach real content update timestamps, or
  - use a stable build/content timestamp source, or
  - omit freshness precision you cannot justify

## Suggested Future Shape

If you decide to improve consistency, the next report-worthy milestone would be a small metadata system refactor with:

- a `buildStaticPageMetadata(sectionKey, path, ogType)` helper
- a `buildDetailMetadata(...)` helper for dynamic pages
- a `buildJsonLdScript(data)` helper for script output
- a single config map that mirrors the sitemap families exactly

That would bring the sitemap, metadata, Open Graph, Twitter, and JSON-LD systems into the same conceptual model instead of leaving them as adjacent implementations.

## Bottom Line

This site already has broad metadata coverage. The main issue is not missing metadata, but uneven generation patterns:

- site identity is duplicated
- top-level section config is incomplete
- homepage behavior is more implicit than the other sections
- structured data coverage is uneven across section indexes
- sitemap freshness semantics are less disciplined than the rest of the metadata stack

If you normalize those few areas, you will have a metadata system that is not just comprehensive, but internally legible and much easier to maintain.
