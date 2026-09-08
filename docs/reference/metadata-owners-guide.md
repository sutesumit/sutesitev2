# Metadata Owner's Guide

This guide explains where to edit metadata now that the metadata system has been centralized.

## The Simple Rule

- Change static section metadata copy in `src/config/metadata.ts`
- Change dynamic page metadata copy in the content source for that item
- Change metadata structure and defaults in `src/lib/metadata/builders.ts`
- Change JSON-LD schema structure in `src/lib/metadata/schema.tsx`

## 1. Change Static Section Copy

Edit:

- `src/config/metadata.ts`

This is the main control surface for section-level metadata copy.

It owns:

- `/`
- `/about`
- `/work`
- `/bloq`
- `/byte`
- `/blip`

Change this file when you want to update:

- page title
- page description
- Open Graph title
- Open Graph description
- page path
- page-level schema kind

## 2. Change One Dynamic Page's Copy

Edit the content source, not the route file.

### Bloq post

Edit:

- `src/content/bloqs/.../index.mdx`

Metadata comes from frontmatter and post content fields such as:

- `title`
- `summary`
- `publishedAt`
- `updatedAt`
- `image`
- `tags`

### Work project

Edit:

- `src/data/projects/projectData.tsx`

Metadata comes from project fields such as:

- `title`
- `description`
- `screenshot`

### Byte item

Edit:

- the byte content source in the byte data layer

Metadata is derived from:

- `byte_serial`
- `content`
- `created_at`

### Blip item

Edit:

- the blip content source in the blip data layer

Metadata is derived from:

- `term`
- `meaning`
- `tags`
- `created_at`
- `updated_at`

## 3. Change Metadata Structure Or Defaults

Edit:

- `src/lib/metadata/builders.ts`

This file controls how metadata objects are assembled for both static and dynamic pages.

Change this file when you want to update:

- canonical URL rules
- default OG image behavior
- Twitter card defaults
- shared Open Graph structure
- shared Twitter structure
- common metadata field shape

## 4. Change JSON-LD Structure

Edit:

- `src/lib/metadata/schema.tsx`

This file controls page-level structured data generation.

Change this file when you want to update:

- `WebSite`
- `Person`
- `WebPage`
- `ProfilePage`
- `ItemList`
- `Blog`
- `CollectionPage`
- `DefinedTermSet`
- `BlogPosting`
- `SoftwareSourceCode`
- `SocialMediaPosting`
- `DefinedTerm`

## 5. What You Should Usually Avoid

Avoid editing metadata directly in route files for routine copy changes.

Route files should mainly:

- choose a static section key, or
- fetch dynamic content and pass it into shared builders

If you find yourself changing hardcoded metadata copy in a route file, it is usually worth asking whether that belongs in:

- `src/config/metadata.ts`, or
- the page's content source

## 6. Quick Editing Examples

### Change the About page description

Edit:

- `src/config/metadata.ts`

### Change the metadata structure for all static pages

Edit:

- `src/lib/metadata/builders.ts`

### Change one bloq post's metadata

Edit:

- that post's `index.mdx`

### Change how BlogPosting JSON-LD is rendered

Edit:

- `src/lib/metadata/schema.tsx`

## 7. Confidence Checklist

Before changing metadata, ask:

- Is this a section-wide copy change?
- Is this a single content-item change?
- Is this a metadata structure change?
- Is this a schema change?

If you answer that first, the right file is usually obvious.
