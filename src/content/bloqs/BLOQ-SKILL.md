# Bloq Skill: Current System, Living Practice

> **Last reviewed:** 2026-04-22 | **Metric:** 32 total bloq files in `src/content/bloqs`, 25 currently visible, 7 archived or trashed | **Version:** 2.0.0

This file has three jobs:

1. Act as the technical source of truth for creating and maintaining bloqs in this repo.
2. Capture the writing patterns that have actually held up across published bloqs.
3. Preserve the practice's memory without pretending every memorable flourish is now a rule.

If code behavior and this file disagree, code behavior wins. The parser defines what the site supports. Recent published bloqs define what the voice currently sounds like. This file summarizes both.

---

## Source of Truth Hierarchy

Use this order when there is any ambiguity:

1. `src/lib/bloq/types.ts` and `src/lib/bloq/parser.ts`
2. The current `src/content/bloqs/` directory structure and frontmatter in real posts
3. This skill

This matters because the skill is descriptive and opinionated. The code is authoritative.

---

## Canonical Rules

These are the rules for repository behavior, post creation, and publishing workflow.

### Directory Structure

All bloqs use the nested year and month structure:

```text
src/content/bloqs/2026/04/2026-04-22-example-post/index.mdx
```

Why this shape is used:

- It matches the current repository organization.
- It scales better as each year fills up.
- It keeps month-based browsing and maintenance simpler.

### Folder and Slug Rules

| Item | Requirement | Notes |
|------|-------------|-------|
| Folder name | `YYYY-MM-DD-slug-name` | Date prefix should match `publishedAt` |
| Slug | kebab-case URL segment | Short, descriptive, not a sentence |
| Preferred length | 3-8 words | Recent bloqs often run longer when needed |
| `url` on site | derived from `slug` | The parser normalizes it |

### Frontmatter

Preserve field order for new posts. The parser is flexible, but consistency helps humans and agents.

```yaml
---
title: "Your Post Title"
publishedAt: "2026-04-22"
updatedAt: "2026-04-22"
summary: "A one to two sentence summary written in the bloq voice."
slug: "your-kebab-case-slug"
tags:
  - debugging
  - architecture
  - reflections
authors:
  - Sumit Sute
category: "Engineering"
image: "/images/example.png"
draft: true
featured: false
status: "published"
---
```

### Frontmatter Field Guide

| Field | Status | Requirement level | Notes |
|-------|--------|-------------------|-------|
| `title` | Supported | Required | Display title |
| `publishedAt` | Supported | Required | Quoted `YYYY-MM-DD` |
| `updatedAt` | Supported | Optional | Documented because parser supports it, even if rarely used |
| `summary` | Supported | Required | Feed cards and listing summaries |
| `slug` | Supported | Required | Must be a clean URL segment |
| `tags` | Supported | Required | Lowercased by parser |
| `authors` | Supported | Required in practice | Parser also tolerates singular author forms |
| `category` | Supported | Required in practice | Keep to the category guidance below |
| `image` | Supported | Optional | Parser supports it, current posts rarely use it |
| `draft` | Supported | Required in practice | Controls visibility in production |
| `featured` | Supported | Required in practice | Promoted in feed and listings |
| `status` | Supported | Optional | `published`, `draft`, `archived`, `trashed`; only `archived` and `trashed` affect parser visibility directly |

### Publishing State Semantics

| State | Meaning | Visible in dev | Visible in production |
|-------|---------|----------------|-----------------------|
| `draft: true` | Work in progress | Yes | No |
| `status: "draft"` | Semantic draft marker | Yes | Yes, unless `draft: true` is also set |
| `status: "archived"` | Soft deleted, kept for reference | No | No |
| `status: "trashed"` | Hidden, effectively removed | No | No |
| no `status` or `status: "published"` | Normal published post | Yes | Yes, unless `draft: true` |

Use `draft: true` to hide unfinished work. Treat `status: "draft"` as descriptive only unless the parser is later changed to enforce it. Use `archived` or `trashed` only when intentionally removing a post from active circulation.

### Categories

These categories are current and safe to use:

| Category | Use when | Status |
|----------|----------|--------|
| `Engineering` | Feature work, debugging, architecture, systems thinking | Current |
| `Reflections` | Personal learning, meta-commentary, events, process | Current |
| `Development` | Tooling, workflow, setup, developer experience | Current |
| `Getting Started` | Introductory or foundational posts | Current but uncommon |
| `Testing` | Exists in historical content | Legacy, avoid for new posts unless there is a clear reason |

Default to `Engineering` or `Reflections` unless another category is obviously better.

### Tags and Related Posts

Tags are not decorative. The related-post system scores overlap by shared tags. Shared tags create discoverability and recommendation edges between bloqs.

#### Current shared tags

| Tag | Use when |
|-----|----------|
| `typescript` | TypeScript-heavy implementation or language-level reasoning |
| `react` | React components, hooks, rendering behavior |
| `nextjs` | App Router, metadata, routes, Next.js platform work |
| `debugging` | Investigation, failures, diagnosis, tracing |
| `architecture` | Boundaries, contracts, layering, trade-offs |
| `frontend` | UI, client-side behavior, interaction details |
| `backend` | APIs, services, persistence, server-side work |
| `ai` | Agents, prompting, collaboration with models |
| `experiments` | Technical experiments and exploratory builds |
| `reflections` | Personal and philosophical framing |
| `seo` | Metadata, feeds, sitemap, discoverability |
| `supabase` | Supabase-specific infra or data work |
| `devops` | Deployments, CI, pipelines, operational failures |

#### Tag rules

| Rule | Requirement level | Notes |
|------|-------------------|-------|
| Use 3-7 tags | Required | Enough signal, not taxonomy sprawl |
| Include at least 2 shared tags | Required | Helps related-post scoring |
| Lowercase tags | Required | Parser normalizes to lowercase |
| Prefer existing shared tags when they fit | Recommended | Keeps the graph connected |
| Add a new tag when the theme is genuinely new | Recommended | Do not force old vocabulary onto new work |

#### Tag selection workflow

```text
1. Pick the technical center: typescript, react, nextjs, debugging, architecture
2. Pick the domain: frontend, backend, seo, devops, ai, reflections
3. Check overlap with existing posts
4. Ask: is there a real theme here that current tags miss?
5. If yes, add the new tag without apology
```

### MDX and Component Constraints

| Item | Rule | Requirement level |
|------|------|-------------------|
| Heading depth | Start content sections at `##` | Required |
| Imports | Place directly after frontmatter | Required when needed |
| Code fences | Always include language identifiers | Required |
| Interactive MDX components | Wrap in padded container when needed | Recommended |
| Links to internal routes | Use normal route links like `/bloq/...` | Required in practice |
| Images | Use only when they earn their place | Recommended |

#### Current MDX rendering support

The site provides custom rendering for:

- headings
- paragraphs and lists
- blockquotes
- tables
- inline and fenced code
- links
- `del`
- `iframe`
- custom `Image`

Write with those primitives in mind. Do not assume arbitrary markdown plugins exist.

### Canonical Examples

#### Directory example

```text
src/content/bloqs/2026/04/2026-04-22-observe-dont-assume/index.mdx
```

#### Minimal frontmatter example

```yaml
---
title: "Observe, Don't Assume"
publishedAt: "2026-04-16"
summary: "A GitHub Action, a Telegram notification, and seven invisible ways the system failed without telling me."
slug: "debugging-invisible-failures-observe-dont-assume"
tags:
  - debugging
  - architecture
  - reflections
authors:
  - Sumit Sute
category: "Reflections"
draft: false
featured: false
---
```

#### Section opening example

```mdx
## The Setup

> "You can't trust what you send. Only what arrives."

I wanted one thing. Publish a bloq, get a Telegram notification, and move on with my life. The system had other plans.
```

---

## Agent Checklist

Follow this sequence when creating a new bloq:

1. Inspect recent bloqs, especially from the last 1-2 months.
2. Confirm the folder shape: `YYYY/MM/YYYY-MM-DD-slug/index.mdx`.
3. Choose the slug, then verify folder date, `publishedAt`, and slug all match.
4. Select 3-7 tags and ensure at least 2 are already shared tags.
5. Decide the publishing intent up front:
   - `draft: true` for work in progress
   - `status: "archived"` or `status: "trashed"` only for intentionally hidden posts
6. Write the summary before the body so the piece has a center of gravity.
7. Write the post.
8. After publication, decide whether the skill actually learned something new.

---

## New Post Template

Use this when drafting a fresh post.

```mdx
---
title: "Your Title"
publishedAt: "2026-04-22"
summary: "One to two sentences that carry both the technical topic and the human tension."
slug: "your-kebab-case-slug"
tags:
  - debugging
  - architecture
  - reflections
authors:
  - Sumit Sute
category: "Engineering"
draft: true
featured: false
---

## Opening Section

> "A self-authored line that captures the article's pressure point."

Open with a moment, a premise, or a concrete tension.

---

## What I Thought Was Happening

Name the mistaken belief, not just the implementation task.

---

## What Actually Happened

Walk through the friction, dead ends, code, and shift in understanding.

```typescript
// Show real code and explain why it matters
```

---

## What Changed In My Head

End with takeaways, reflection, or a forward-looking synthesis.
```

## Revision and Update Template

Use this when an existing article teaches the skill something new.

```markdown
- Re-check technical guidance against parser and current repo structure
- Decide whether the new article adds:
  - a stable pattern
  - a candidate pattern
  - a tag update
  - a maintenance note only
- Update header metrics if the repo count changed
- Add an evolution entry only if the article changed the practice, not just because it exists
```

---

## Evolving Patterns

These are current dominant patterns in the bloq voice and structure. They are not all mandatory. They are what has actually held up across recent posts.

### Voice Position

| Pattern | Status | Notes |
|---------|--------|-------|
| First-person singular | Dominant | "I built", "I thought", "I missed" |
| Reflective practitioner | Dominant | Learning in public without pretending mastery arrived first |
| Technically precise, conversational delivery | Dominant | Explain clearly, but like talking to a sharp friend |
| Honest about agent collaboration | Dominant | Neither evangelism nor cynicism |
| Senior-engineer framing through trade-offs | Growing stronger | Increasingly explains principles, not just events |

### Stable Patterns From Recent Bloqs

These have shown up repeatedly across March and April 2026 posts:

1. Open with a sharp premise, scene, or pressure point.
2. Use an epigraph at the article opening, and often before major sections.
3. Show the mistaken belief first, not only the broken implementation.
4. Name the failure mode when possible: `scope leak`, `contract leak`, `silent failure`, `wrong trigger`, `lying success`.
5. Embed technical explanation inside the narrative instead of switching into tutorial voice.
6. Generalize outward near the end: move from one bug to a broader principle about engineering, agency, or judgment.

### Structural Guidance

| Pattern | Requirement level | Notes |
|---------|-------------------|-------|
| Start sections with `##` | Required | Layout owns the page title |
| Open with a concrete moment or claim | Recommended | Recent posts do this consistently |
| Use epigraphs | Recommended | One at the start is common; section-level epigraphs are increasingly common |
| Use `---` between major sections | Recommended | Helps pacing and scannability |
| Show false starts and wrong turns | Dominant pattern | The dead end often carries the insight |
| End with takeaways, reflection, or forward-looking synthesis | Recommended | Do not default to a dry recap |

### Writing Devices That Fit the Current Practice

| Device | Status | Notes |
|--------|--------|-------|
| Epigraph blockquotes | Strongly established | Often self-authored, occasionally quoted when clearly marked |
| Parenthetical asides | Established | Good for self-awareness and interior monologue |
| Failure taxonomies | Emerging into stable pattern | Especially in debugging and architecture posts |
| ASCII diagrams | Established | Useful when they clarify system behavior |
| Mermaid diagrams | Allowed | Keep them simple and purposeful |
| Strikethrough via `<del>` | Occasional | Use sparingly so it still feels intentional |
| Embedded live components | Established | Best when the article is about the thing being embedded |

### What the Voice Is Not

- Not tutorial-first prose with "Step 1, Step 2" pacing by default
- Not impersonal documentation voice
- Not generic startup optimism
- Not uncritical AI boosterism
- Not emoji-heavy writing
- Not breathless punctuation

### Do Not Overfit One Article

Not every striking sentence, metaphor, or section gimmick deserves promotion into the skill.

Promote something only when it is:

- repeatable
- useful to future writing
- aligned with the broader voice
- visible across more than one post

The skill should capture patterns, not souvenirs.

---

## Distilled Patterns

### What Consistently Works

- Ground the post in a specific pressure point, not a vague topic.
- Let the reader feel the mistaken belief before revealing the fix.
- Name the architectural or debugging pattern once it becomes visible.
- Alternate concrete evidence with broader interpretation.
- End with a sentence or section that widens the frame.

### What Consistently Fails

- Generic "how to build X" framing when the real value is in the journey.
- Listing steps without the tension that made them necessary.
- Explaining basics the audience probably already knows.
- Treating AI involvement as either magic or embarrassment.
- Summaries that only repeat what the reader just finished reading.

### Candidate Patterns

Promote from candidate to stable only after repeated use in multiple bloqs.

| Pattern | Status | Note |
|---------|--------|------|
| Failure taxonomy as structure | Candidate, close to stable | Strong in recent debugging and agent-work posts |
| "Wrong assumption first" framing | Candidate, close to stable | Repeated across several March-April posts |
| Section epigraph cadence | Candidate, close to stable | Increasingly frequent in newer bloqs |
| Broader engineering principle in closing beat | Stable enough to encourage | A strong current habit |

---

## Evolution Log

Only log entries that changed the practice, not every article publication.

| Date | Version | Trigger | What Changed | Proposed By |
|------|---------|---------|--------------|-------------|
| 2026-03-12 | 1.13.0 | SEO slug refactoring | Added guidance around slug normalization and slug-to-directory alignment | Agent |
| 2026-03-12 | 1.14.0 | Supabase data migration | Recorded slug migration implications for historical data | Agent |
| 2026-03-14 | 1.15.0 | Robust planning reflections | Strengthened planning and anti-vague-spec guidance | Human |
| 2026-03-17 | 1.16.0 | Testing infrastructure bloq | Added test-infrastructure observations and maintenance ideas | Agent |
| 2026-04-22 | 2.0.0 | Full skill refresh | Reframed the skill into canonical rules plus evolving patterns; updated repo facts, frontmatter support, tag rationale, maintenance protocol, and current voice guidance | Agent |

---

## Maintenance Protocol

After a new published bloq, use this routine:

1. Re-check whether the repo metrics changed:
   - total bloq files
   - currently visible bloqs
   - archived or trashed count
2. Update the header only when the metric values change.
3. Add an evolution log entry only if the article taught the skill something reusable.
4. Promote a candidate pattern only after repeated use, not excitement.
5. Review whether any new tags have become genuinely shared tags.
6. Re-read the current parser and types if technical guidance might have changed.

### Header Metric Guidance

Do not guess the counts. Derive them from the repo before editing the header.

Suggested checks:

```powershell
Get-ChildItem -Path src/content/bloqs -Recurse -Filter index.mdx
Select-String -Path (Get-ChildItem -Path src/content/bloqs -Recurse -Filter index.mdx).FullName -Pattern '^status:\s+"(archived|trashed)"'
```

### Review Checklist

```markdown
- [ ] Folder examples match the current preferred structure
- [ ] Frontmatter fields match parser support
- [ ] Category guidance still matches real usage
- [ ] Tag advice still reflects related-post behavior
- [ ] "Required" items are truly required
- [ ] Voice guidance reflects repeated practice, not one-off style
```

---

## Quick Reference

### Technical essentials

- Preferred path: `src/content/bloqs/YYYY/MM/YYYY-MM-DD-slug/index.mdx`
- Required in practice: `title`, `publishedAt`, `summary`, `slug`, `tags`, `authors`, `category`, `draft`, `featured`
- Optional but supported: `updatedAt`, `image`, `status`
- Tag target: 3-7 tags, at least 2 shared tags

### Writing essentials

- Open with tension, not topic labeling
- Use at least one strong epigraph when it fits
- Show the wrong assumption, not just the fix
- Explain technical ideas through the story
- End by widening the frame

### Final reminder

This skill is allowed to evolve. It is not allowed to drift.

When in doubt, prefer accuracy over lore and repeatable patterns over cleverness.
