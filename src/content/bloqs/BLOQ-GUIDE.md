# Bloq Guide — Writing & Managing Articles

This guide covers how to create, format, and manage bloq articles, along with the voice and style conventions that keep the writing consistent.

---

## Directory Structure

```
src/content/bloqs/
├── 2025/
│   ├── 2025-11-23-setting-up-blog-series/
│   │   └── index.mdx
│   └── 2025-12-09-building-last-visitor-feature/
│       └── index.mdx
├── 2026/
│   └── 2026-02-18-vibe-shift-hackathon/
│       └── index.mdx
└── BLOQ-GUIDE.md  ← this file
```

Each article lives in its own folder containing an `index.mdx` file. The folder can also hold colocated assets (images, embedded components) alongside the post content.

### Folder naming

```
YYYY-MM-DD-slug-name/
```

- Date should match the `publishedAt` frontmatter value.
- Slug should be kebab-case, 3–6 words, descriptive.

---

## Frontmatter Template

Copy this exactly. Preserve the field order.

```yaml
---
title: "Your Post Title Here"
publishedAt: "2025-01-30"
summary: "A one-to-two sentence summary for feed cards. Write in the bloq voice."
slug: "your-kebab-case-slug"
tags:
  - react
  - typescript
  - supabase
authors:
  - Sumit Sute
category: "Engineering"
draft: true
featured: false
---
```

### Field rules

| Field | Required | Format | Notes |
|-------|----------|--------|-------|
| `title` | Yes | Quoted string | The display title. Can be creative/literary, not just descriptive. |
| `publishedAt` | Yes | `"YYYY-MM-DD"` (quoted) | Must match the date prefix in the folder name. |
| `summary` | Yes | Quoted string, 1–2 sentences | Written in the bloq voice. Appears on feed cards. |
| `slug` | Yes | `"kebab-case-slug"` (quoted) | URL path. Must be a valid URL segment, never a sentence. |
| `tags` | Yes | 2-space indented list | Lowercase except proper nouns/brands (`react`, `Next.js`, `Claude`). |
| `authors` | Yes | 2-space indented list | Full name. |
| `category` | Yes | Quoted string | One of: `"Engineering"`, `"Reflections"`, `"Getting Started"`. |
| `draft` | Yes | `true` / `false` | `true` = visible in dev, hidden in production. |
| `featured` | Yes | `true` / `false` | `true` = promoted in the feed. |
| `status` | No | `"published"`, `"archived"`, `"trashed"` | Only set when soft-deleting. Defaults to `"published"`. |

### Categories

| Category | Use when |
|----------|----------|
| `Engineering` | Building a feature, debugging, system design, performance, code-heavy |
| `Reflections` | Events, personal learning arcs, meta-commentary on tools/process |
| `Getting Started` | Introductory or foundational setup posts |

---

## Removing / Hiding Articles

### Draft mode (work in progress)
Set `draft: true`. Visible in `npm run dev`, hidden in production.

### Soft delete (archived / trashed)
Set `status: "archived"` or `status: "trashed"`. Hidden everywhere. File stays for reference.

### Hard delete
Delete the entire folder.

---

## Voice & Style Guide

These conventions are distilled from the existing bloqs. Follow them to keep the voice consistent, whether writing manually or prompting an AI agent.

### Identity

- **First person, singular.** "I built", "I wanted", "I realised."
- **Reflective practitioner.** You are learning in public. You don't pretend to have had the answer before you started.
- **Comfortable with uncertainty.** "I'm not sure if…", "Maybe I'll add this later when I finally have a learned opinion."
- **Self-aware about the human-agent dynamic.** You work alongside AI agents and you write about that friction honestly — neither evangelising nor dismissing.

### Tone

- **Conversational but precise.** Technical explanations should be rigorous. Prose should feel like talking to a sharp friend over coffee, not lecturing a classroom.
- **Anti-tutorial.** Never write "Step 1, Step 2." Write "Here's what happened when I tried X." Show the dead ends, the wrong turns, the moment a cauliflower at the vegetable shop triggered an architectural insight.
- **Self-deprecating humour is welcome.** "At this point, I wasn't debugging. I was bargaining."
- **Philosophical undercurrent.** Each post should surface at least one broader insight — about agency, tools, creative practice, or what it means to build things in the age of AI.

### Structural conventions

- **Start with a `##` heading**, not `#`. The `#` heading is reserved for the title rendered by the layout.
- **Epigraph blockquotes.** Open a post or major section with a short, self-authored philosophical one-liner in a blockquote:
  ```markdown
  > "A developer's homepage often feels like an empty hallway."
  ```
- **Section dividers.** Use `---` (standard horizontal rule) between major sections.
- **Progressive narrative arc.** Structure the post as: problem → attempt → friction/failure → insight → reflection. Not: definition → implementation → conclusion.
- **Closing section.** End with either:
  - Bullet-point takeaways distilling the journey into portable wisdom, OR
  - A reflective closing paragraph that points forward, OR
  - A call to action inviting the reader to build their own version.

### Writing devices

- **Strikethrough for self-correction.** Use `<del>` tags as a literary device to show the author editing her own thoughts in real time:
  ```markdown
  (<del>I keep thinking about</del> those Aceternity UI code blocks I <del>haven't</del> integrated <del>yet.</del>)
  ```
- **ASCII/plaintext diagrams.** Prefer text-based visuals over images. They fit the brutalist aesthetic and stay in the reader's flow:
  ```text
  JS Heap
    ^
    |     ┌───
    |  ───┘   └─┐
    |           └─ (abort) ── drop
    +----------------------------> time
  ```
- **Mermaid diagrams.** Use for system architecture and data flow. Keep them simple.
- **Inline code flow notation.** For quick pipelines: `` `Click` → `Key.tsx` → `useIntroGame.ts` → `State Update` ``
- **Parenthetical asides.** Use parentheses for tangential thoughts, interior monologue, or wry commentary.
- **Plaintext checklists as literary devices** (not functional checkboxes):
  ```text
  Can I understand a file in under 60 seconds?
  [ ] yes
  [ ] maybe
  [ ] with the agent open
  ```

### Code

- Always include language identifiers on fenced code blocks (` ```typescript `, ` ```sql `, ` ```bash `).
- Annotate code blocks with comments that explain *why*, not *what*.
- When sharing full component code, show the file tree first, then walk through files in logical order.
- Prefer real, working code over pseudocode. If the code is from the actual project, keep it accurate.

### MDX components

- Import statements go directly after the frontmatter closing `---`.
- Wrap interactive components in a `<div>` with padding: `<div className="py-4">`.
- Mention when a component is ornamental vs functional for accessibility context.

### What the voice is NOT

- Tutorial-style step-by-step instructions
- Impersonal, corporate, or documentation-tone
- Exhaustive API references — prefer narrative over reference
- Uncritical AI boosterism — the voice is nuanced, sometimes skeptical
- Emoji-heavy or exclamation-mark-heavy

---

## Writing a Technical Feature or Learning Bloq

When documenting a progressive feature build or a learning experiment, follow this recipe:

### 1. Title
Creative, literary, slightly oblique. Not "How to Build a View Counter" but "So I Built My Own View Counter" or "The Ghost in the Footer."

### 2. Summary
One to two sentences in the bloq voice. Hint at the human story, not just the tech:
> "A small story about making a static Next.js site feel a little less alone, and the detours through RLS logic that taught me why trust has to live on the server."

### 3. Opening section
Set the scene. Why did you start this? What itch, what PR comment, what broken build? Ground it in a specific moment.

### 4. The build (middle sections)
Walk through the work as a narrative. For each section:
- State the sub-problem
- Show what you tried (including wrong approaches)
- Show the code that solved it
- Reflect briefly on what it taught you

Use `##` headings for each section. Use diagrams (ASCII, mermaid) to make architecture visible.

### 5. Closing
Choose one of the three closing patterns:
- **Takeaways**: 3–5 bullet points. Start each with a dash and a bold phrase.
- **Reflection**: A paragraph that connects the technical work back to a broader theme.
- **Call to action**: Invite the reader to try it themselves.

### Template skeleton

```mdx
---
title: "Your Creative Title"
publishedAt: "2026-03-01"
summary: "One line about what this is and why it matters, in the bloq voice."
slug: "your-slug-here"
tags:
  - react
  - typescript
authors:
  - Sumit Sute
category: "Engineering"
draft: true
featured: false
---

## Opening Heading

> "A self-authored epigraph that captures the post's theme."

The scene-setting paragraph. What triggered this work? Ground it in a moment.

---

## The Problem / The Setup

What were you trying to solve? What constraints did you have?

---

## First Attempt (or: The Wrong Way)

What did you try first? What went wrong?

```typescript
// The code that didn't work, or the naive approach
```

---

## The Fix / The Insight

What actually worked? Why?

```typescript
// The working code, annotated
```

---

## What I Took Away

- **Takeaway one.** Explanation.
- **Takeaway two.** Explanation.
- **Takeaway three.** Explanation.
```

---

## Agent Instructions

When using an AI agent to draft or edit bloq posts, include these constraints in your prompt:

1. Follow the frontmatter template exactly — field order, quoting, indentation.
2. Write in first person. Do not use "we" unless referring to a specific collaboration.
3. Do not write tutorial-style steps. Write a narrative with a progressive arc.
4. Include at least one epigraph blockquote (self-authored, not famous quotes).
5. Show wrong approaches and dead ends, not just the solution.
6. End with a reflective closing, not a summary of what was covered.
7. Use ASCII diagrams over images wherever possible.
8. Tag casing: lowercase except proper nouns (`react`, `typescript`, `Next.js`, `Supabase`).
9. Do not add emoji.
10. Keep the philosophical undercurrent — every post should say something about learning, agency, or building.
