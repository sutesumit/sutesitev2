# Bloq Skill — A Living Writing Practice

> **Last evolved:** 2026-03-07 | **Articles written:** 11 | **Version:** 1.8.0 (2026-03)

This skill grows with every article. It distills patterns from real writing, not hypothetical best practices. When you invoke it, you inherit the accumulated judgment of every bloq that came before.

---

## Evolution Log

A changelog of what this skill has learned over time.

| Date | Version | Article | What Changed | Proposed By |
|------|---------|---------|--------------|-------------|
| 2026-03-05 | 1.0.0 | Tag normalization pass | Established core shared tags; normalized `nextjs`, `ai`; added tag connectivity requirement; transformed from static guide to living skill | Human |
| 2026-03-05 | 1.1.0 | The Skill That Writes Itself | First article written with the skill; documented the taxonomy drift problem and the guide-to-skill transformation | Agent |
| 2026-03-05 | 1.2.0 | The Skill That Writes Itself (revision) | Shifted focus from technical report to human-AI conundrum; added symbiosis theme; proposed patterns around reading-as-mirror and honest disclosure | Human |
| 2026-03-05 | 1.3.0 | The Skill That Writes Itself (final) | Balanced narrative: orphan → normalization → skill creation → conundrum; the skill writes about itself; value is in the interaction, not just the output | Human |
| 2026-03-05 | 1.4.0 | The Skill That Writes Itself (polish) | Added hyperlink to orphan article; clarified Rohit's nudge as agentic skill.md concept; added quirks (cauliflower, ouroboros); grounded the conundrum in genuine uncertainty | Human |
| 2026-03-05 | 1.5.0 | The Skill That Writes Itself (final) | Added meta note: this article's revisions evolved the skill from 1.0.0 to 1.5.0; the skill writes about itself evolving while evolving | Human |
| 2026-03-06 | 1.6.0 | Metadata That Matters | Added per-post SEO with generateMetadata, JSON-LD BlogPosting schema, generateStaticParams; each bloq now has unique title, description, canonical URL, OpenGraph; added `seo` tag to registry | Agent |
| 2026-03-06 | 1.7.0 | The Lazy Way to Build Better Software | Documented spec-driven development approach; questions-as-specifications pattern; design for the third case; specs as documentation; added `backend` tag prominence; embedded ClapsCounter component demo in article | Agent |
| 2026-03-07 | 1.8.0 | Tag rule revision | Revised tag rules: minimum 3 tags (was 2), maximum 7; replaced "only if genuinely necessary" with prompting step to encourage organic new tag creation; goal is balance between consistency (shared tags) and freshness (new tags when they fit) | Human |

---

## Tag Registry

Tags serve discoverability and related-post suggestions. Every article must have **3-7 tags**, with **at least two shared** with other bloqs.

### Core shared tags (high connectivity)

| Tag | Articles | SEO Value | Use When |
|-----|----------|-----------|----------|
| `typescript` | 7+ | High | Any TypeScript code |
| `react` | 4+ | High | React components, hooks, patterns |
| `nextjs` | 4+ | High | Next.js features, routing, API routes |
| `debugging` | 3+ | Medium | Troubleshooting, DevTools, investigation |
| `frontend` | 2+ | Medium | UI, components, client-side work |
| `backend` | 2+ | Medium | API routes, database, server-side |
| `ai` | 3+ | High (buzz) | AI tools, agents, Claude, LLMs |
| `experiments` | 3+ | Low | Creative/technical explorations |
| `reflections` | 2+ | Low | Personal learning arcs, events |
| `seo` | 1+ | High | Metadata, OpenGraph, JSON-LD, search optimization |

### Tag rules

1. **Minimum 3 tags, maximum 7** — enough for connectivity, not so many it dilutes meaning
2. **At least 2 shared tags** — verify overlap with existing articles before publishing
3. **Prefer core tags** — use from the registry when they fit
4. **Normalize variants:**
   - `nextjs` (not `next.js` or `Next.js`)
   - `ai` (not `ai-collaboration`, `agentic-mode`, `llm`)
   - `typescript` (not `ts`)
   - `supabase` (not `postgres` when using Supabase)
5. **Lowercase except proper nouns** — `react`, `typescript`, `supabase`

### Tag selection workflow

```
1. Core technology → typescript, react, nextjs
2. Domain → frontend, backend, debugging, experiments
3. Verify → at least 2 tags must exist in other articles
4. Ask → "Is there a theme here that doesn't have a tag yet?"
5. If yes → add it freely (no permission needed)
```

The goal is balance: enough shared tags for discoverability, room for new tags when they genuinely fit.

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
└── BLOQ-SKILL.md  ← this file
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
  - debugging
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
| `tags` | Yes | 2-space indented list | Lowercase except proper nouns/brands (`react`, `supabase`). 3-7 tags, at least 2 shared. |
| `authors` | Yes | 2-space indented list | Full name. |
| `category` | Yes | Quoted string | One of: `"Engineering"`, `"Reflections"`, `"Getting Started"`, `"Development"`. |
| `draft` | Yes | `true` / `false` | `true` = visible in dev, hidden in production. |
| `featured` | Yes | `true` / `false` | `true` = promoted in the feed. |
| `status` | No | `"published"`, `"archived"`, `"trashed"` | Only set when soft-deleting. Defaults to `"published"`. |

### Categories

| Category | Use when |
|----------|----------|
| `Engineering` | Building a feature, debugging, system design, performance, code-heavy |
| `Reflections` | Events, personal learning arcs, meta-commentary on tools/process |
| `Development` | Setup, tooling, workflow, developer experience |
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

### Voice maturation trajectory

| Stage | Characteristics | Example |
|-------|-----------------|---------|
| Early | Tentative, explains basics, apologetic | "I'm not sure if this is right, but..." |
| Current | Confident uncertainty, philosophical undercurrent | "I'm not sure I understand all of it. But I can read the graphs now." |
| Aspiration | Senior engineer voice — assumes competence, explains trade-offs not basics, points to principles | "The GC was never broken. It was doing exactly what it was told." |

### Aspiration: Senior Engineer Voice

The senior engineer voice:
- **Assumes reader competence.** Don't explain what a function is. Explain why this function matters.
- **Privileges trade-offs over best practices.** "The monolithic design was a choice, not an accident."
- **Points to principles, not steps.** "Every leak came down to the same thing: something kept a reference alive."
- **Owns uncertainty without apologizing.** "I'm still not sure I understand all of it."
- **Speaks from experience, not authority.** "What struck me is..." not "You should..."

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
- Exhaustive API references (prefer narrative over reference)
- Uncritical AI boosterism (the voice is nuanced, sometimes skeptical)
- Emoji-heavy or exclamation-mark-heavy
- **Em dashes (—).** Never use them. They feel generated and robotic. Use commas, colons, or periods instead.

---

## Distilled Patterns

Patterns that have emerged across multiple articles. These are observations that have held up.

### What consistently works

- **Open with a specific moment.** A PR comment, a broken build, a cauliflower at the vegetable shop. Ground the reader in time and place.
- **One epigraph per major section.** Not just the opening — use blockquotes as section anchors.
- **Show the wrong path first.** The dead end teaches more than the solution.
- **End forward-looking.** A question, a next step, an invitation — not a summary.
- **Name the thing.** "Context object," "Domain Layer" — giving something a name creates clarity.
- **ASCII diagrams over images.** They fit the brutalist aesthetic and stay in flow.

### What consistently fails

- **Tutorial structure.** "Step 1, Step 2" kills narrative momentum.
- **Apologizing for uncertainty.** Own it. "I'm not sure" is honest, not weak.
- **Summarizing at the end.** The reader just read it. Give them something new.
- **Generic titles.** "How to Build X" vs. "The Ghost in the Footer."

### Pattern proposals (pending verification)

*Agents may propose patterns here. They graduate to "consistently works" after appearing in 3+ articles.*

| Pattern | Proposed In | Status |
|---------|-------------|--------|
| Connectivity as constraint | The Skill That Writes Itself | Pending (1/3) — requiring minimum shared tags forces discovery of common themes |
| Reading as mirror | The Skill That Writes Itself (revision) | Pending (1/3) — reading AI output reveals what you actually think; the draft shows gaps |
| Honest disclosure | The Skill That Writes Itself (revision) | Pending (1/3) — admitting AI involvement is part of learning in public; hiding it is performing a false authorship |
| Design for the third case | The Lazy Way to Build Better Software | Pending (1/3) — when building for two, ask what happens with three; reveals whether to unify or separate |
| Specs as documentation | The Lazy Way to Build Better Software | Pending (1/3) — the spec written before coding becomes the mental model for future maintenance |

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
  - debugging
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

## Agent Invocation Protocol

When an agent is tasked with creating a new bloq:

### Before writing
1. **Read this skill completely.** The patterns exist because they earned their place.
2. **Scan existing articles.** Verify tag connectivity, absorb voice.
3. **Check the tag registry.** Plan for at least 2 shared tags.

### During writing
1. Follow frontmatter template exactly — field order, quoting, indentation
2. Write in first person, narrative arc
3. Include epigraph blockquotes (self-authored)
4. Show wrong approaches, not just solutions
5. Use ASCII diagrams over images
6. End reflectively, not summarizing
7. Tag casing: lowercase except proper nouns (`react`, `typescript`, `supabase`)
8. Do not add emoji
9. Keep the philosophical undercurrent — every post should say something about learning, agency, or building
10. Ensure at least 2 tags from the core shared tags list, minimum 3 tags total
11. Normalize tag names: `nextjs` not `next.js`, `ai` not `ai-collaboration`
12. After selecting core tags, ask: "Is there a theme here that doesn't have a tag yet?" — add freely if yes

### After publication
1. **Update Evolution Log** — what did this article teach?
2. **Refine Distilled Patterns** — did you notice something new?
3. **Propose new patterns** — add to "pending verification" if noticed
4. **Propose voice aspirations** — how should the voice mature?
5. **Update tag registry** — any new shared tags emerge?
6. **Increment version:**
   - Minor (1.0 → 1.1): refinements, new patterns
   - Major (1.0 → 2.0): structural changes, new sections
7. **Update header:** date, article count, version

---

## Post-Article Update Checklist

After every new article is published, the agent or human should:

```markdown
- [ ] Add entry to Evolution Log (date, version, article, what changed, proposed by)
- [ ] Update tag registry if new shared tags emerged
- [ ] Refine Distilled Patterns if new observations hold
- [ ] Propose new patterns in "pending verification" if noticed
- [ ] Update voice maturation notes if voice evolved
- [ ] Increment version (minor for refinements, major for structural changes)
- [ ] Update header: Last evolved date, Articles written count, Version
```

---

## Quick Reference

### Essential tags (pick 2+)
`typescript` | `react` | `nextjs` | `debugging` | `frontend` | `backend` | `ai` | `experiments` | `reflections` | `seo`

### Tag limits
3-7 tags per article, at least 2 shared with existing articles

### Voice checklist
- [ ] First person singular
- [ ] Specific opening moment
- [ ] At least one epigraph
- [ ] Wrong approach shown
- [ ] Forward-looking close
- [ ] No tutorial steps
- [ ] No emoji

### File structure
```
src/content/bloqs/YYYY/YYYY-MM-DD-slug/index.mdx
```
