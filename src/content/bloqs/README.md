# Article Management SOP

This guide explains how to add, remove, and manage articles on the blog.

## Directory Structure

All articles are stored in `src/content/bloqs`. We use a year-based folder structure:

```
src/content/bloqs/
├── 2024/
│   ├── article-slug-folder/
│   │   └── index.mdx
│   └── another-article/
│       └── index.mdx
├── 2025/
└── ...
```

Each article lives in its own folder containing an `index.mdx` file. This folder structure allows you to restart colocated assets (images, etc.) alongside the post content in the future.

## Adding a New Article

1.  **Create a Folder**: Inside the current year's directory (e.g., `src/content/bloqs/2025/`), create a new folder. The folder name will be used as the URL slug if you don't specify one in the frontmatter, but it's best practice to keep it kebab-case (e.g., `my-new-post`).

2.  **Create Index File**: Inside your new folder, create a file named `index.mdx`.

3.  **Add Frontmatter**: Copy the following template to the top of your `index.mdx` file:

```yaml
---
title: "Your Post Title Here"
publishedAt: "2025-01-30"
summary: "A brief summary of your post for the feed cards."
slug: "your-custom-slug-here"
featured: false
draft: true
category: "Engineering"
tags:
  - Next.js
  - React
authors:
  - Your Name
---

Start writing your content here...
```

4.  **Write Content**: Write your article using MDX (Markdown + React components).

## Removing / Hiding Articles

You have three options for removing articles, depending on your intent:

### Option 1: Draft Mode (For Work In Progress)
Set `draft: true` in the frontmatter.
- **Development**: The post will still be visible when running `npm run dev`.
- **Production**: The post will be **hidden** from the live site.

### Option 2: Soft Delete (Archived/Trashed)
Set `status: 'archived'` or `status: 'trashed'` in the frontmatter.
- **Development**: The post will be **hidden** (filtered out).
- **Production**: The post will be **hidden**.
- **Use Case**: When you want to remove a post but keep the file for future reference.

```yaml
---
title: "Old Post"
status: "archived" 
# ... other fields
---
```

### Option 3: Hard Delete (Permanent)
Simply delete the entire folder for the article (e.g., delete `src/content/bloqs/2025/my-old-post/`).
- **Effect**: The post is permanently gone.

## Metadata Reference

- **status**: `published` (default), `draft`, `archived`, `trashed`.
- **draft**: `true` or `false`. (Overrides status if set to true in production).
- **slug**: The URL path for the article. If omitted, the folder name is used.
- **publishedAt**: Date in `YYYY-MM-DD` format.
