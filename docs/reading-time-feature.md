# Reading Time Feature

Automatically calculates and displays estimated reading time for bloq posts.

## Overview

The reading time feature provides visitors with an estimate of how long it will take to read a bloq post. It's calculated automatically when posts are parsed and displayed on bloq cards.

## How It Works

### 1. Calculation (`src/lib/bloq/reading-time.ts`)

Reading time is calculated using a standard 200 words-per-minute rate:

```
Reading Time = ceil(Word Count / 200)
```

Minimum reading time is 1 minute.

#### MDX Content Processing

Before counting words, the utility strips MDX-specific syntax:

| Syntax | Handling |
|--------|----------|
| Frontmatter (`---`) | Removed |
| Import statements | Removed |
| JSX components (`<Component />`) | Removed |
| Code fence markers (` ``` `) | Removed (code content kept) |
| Images (`![alt](url)`) | Removed |
| Links (`[text](url)`) | Converted to `text` |

### 2. Integration (`src/lib/bloq/parser.ts`)

Reading time is calculated during post parsing:

```typescript
readingTime: data.readingTime ?? calculateReadingTime(content)
```

- Automatically calculated from MDX body content
- Can be manually overridden via frontmatter `readingTime: 5`
- Cached in memory with the rest of the post data

### 3. Display (`src/app/bloq/components/BloqCard/parts.tsx`)

The `BloqReadingTime` component displays the reading time with a clock icon:

```tsx
<BloqReadingTime readingTime={post.readingTime} />
// Output: 🕐 5 min read
```

## UI Components

### BloqReadingTime

| Prop | Type | Description |
|------|------|-------------|
| `readingTime` | `number?` | Reading time in minutes. Returns `null` if not provided |
| `className` | `string?` | Additional CSS classes |

### BloqDate (Updated)

Now includes a Calendar icon for visual consistency:

```tsx
<BloqDate post={post} />
// Output: 📅 Mar 11, 2026
```

### Card Display Locations

Both `BloqDate` and `BloqReadingTime` appear in:

- **BloqCardList** - Card feed view
- **BloqCardDetail** - Expanded card view

## Frontmatter Override

To manually set reading time (for special cases):

```yaml
---
title: "My Post"
readingTime: 10  # Override automatic calculation
---
```

## File Structure

```
src/
├── lib/bloq/
│   ├── reading-time.ts    # Calculation utility
│   ├── parser.ts          # Integration point
│   └── types.ts           # BloqPost.readingTime?: number
└── app/bloq/components/BloqCard/
    ├── parts.tsx          # BloqReadingTime & BloqDate components
    ├── BloqCardList.tsx   # List view display
    └── BloqCardDetail.tsx # Detail view display
```

## Configuration

| Setting | Value | Location |
|---------|-------|----------|
| Words per minute | 200 | `reading-time.ts` |
| Minimum time | 1 minute | `reading-time.ts` |
| Display format | "X min read" | `parts.tsx` |
