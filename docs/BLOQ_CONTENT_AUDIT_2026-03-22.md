# BLOQ Content Audit

Date: 2026-03-22

This is an editorial quality audit of the content in `src/content/bloqs`. It is not a traffic or readership report. The scoring below measures how well each article aligns with the current `BLOQ-SKILL.md` expectations and the patterns visible in the corpus.

## Rubric

Scale: `1` weak, `3` solid, `5` strong.

| Metric | What it measures |
| --- | --- |
| Metadata | Frontmatter completeness, valid category, tag-count compliance, publish-state hygiene |
| Structure | `##` opening, sectioning, blockquotes, section separators |
| Depth | Substantive word count, code/examples, diagrams |
| Voice | First-person reflective voice, epigraph usage, narrative texture |
| Discoverability | Slug quality, summary usefulness, shared-tag connectivity |
| Readiness | Whether the article is publishable as-is vs draft/trashed/placeholder |

Total possible score: `30`

## Corpus Snapshot

- `26` article folders total
- `22` published posts
- `4` trashed posts
- `5` drafts
- `4` featured posts

Category spread:

- `Engineering`: 17
- `Reflections`: 6
- `Development`: 1
- `Getting Started`: 1
- `Testing`: 1

Most-used tags:

- `typescript`: 19
- `nextjs`: 13
- `ai`: 11
- `architecture`: 10
- `debugging`: 9
- `reflections`: 9
- `backend`: 8
- `experiments`: 8

## BLOQ-SKILL Improvements

### High-value fixes

1. Fix the self-reported counts.
   The header still says `Articles written: 23`, but the corpus contains `26` article files and `22` published posts.

2. Add a distinction between `all articles`, `published articles`, and `active articles`.
   Right now the skill mixes live guidance with trashed and draft history, which makes the registry and evolution log drift quickly.

3. Add an explicit quality gate before publication.
   The skill has strong voice guidance but weak enforceability. A short publish checklist should block articles that fail basic metadata, category, or tag rules.

4. Convert the tag registry from estimates to generated counts.
   Counts such as `react | 4+` and `nextjs | 4+` are already stale. This should either be updated automatically or reframed as examples instead of live counts.

5. Clarify the category contract.
   `BLOQ-SKILL.md` allows only `Engineering`, `Reflections`, `Development`, and `Getting Started`, but the corpus still contains a `Testing` category. Decide whether `Testing` is valid or deprecated, then say so explicitly.

6. Separate writing guidance from maintenance protocol.
   The file is trying to be a style guide, taxonomy registry, changelog, and release process all at once. Split it into:
   - writing voice and structure
   - metadata and taxonomy rules
   - post-publication maintenance workflow

7. Add examples of failure modes, not just ideals.
   The corpus shows recurring weak points: placeholder summaries, thin technical payoff, over-short posts, and stale draft trash. The skill should include a short "do not publish when..." section.

8. Define when a post should be `draft`, `trashed`, or removed.
   Current status hygiene is inconsistent. The skill explains the states, but the corpus still contains placeholder and obsolete pieces that count toward the file's self-description.

### Suggested additions

- Add a compact scoring card to the skill itself:
  `metadata / structure / depth / voice / discoverability / readiness`

- Add a "minimum viable publish" threshold:
  `24/30` for publish, `27+/30` for feature consideration

- Add a "featured post" rule:
  featured pieces should score strongly on depth, voice, and discoverability, not just recency.

- Add a "corpus maintenance" cadence:
  every 10 articles, refresh counts, retire placeholder drafts, and reconcile the evolution log.

- Add a note on title and summary pairing:
  creative title is good, but the summary must recover search intent clearly.

## Scorecard

Legend:

- `M` metadata
- `S` structure
- `D` depth
- `V` voice
- `X` discoverability
- `R` readiness

| Article | Status | M | S | D | V | X | R | Total | Notes |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| I Was Productive Before I Was Competent | published | 5 | 5 | 5 | 5 | 5 | 5 | 30.0 | Best-balanced model for current bloq voice |
| Diary of a Memory Hunter: 9 Experiments in React Performance | published | 5 | 5 | 5 | 4.5 | 5 | 5 | 29.5 | Strong technical depth and structure |
| From Soloist to Symphony | published | 5 | 5 | 5 | 4.5 | 5 | 5 | 29.5 | Excellent systems framing and examples |
| The Bot That Talks to My Database | published | 5 | 5 | 5 | 4.5 | 5 | 5 | 29.5 | Rich technical walkthrough with strong narrative spine |
| Vibing Your Way Into a Wall | published | 5 | 5 | 5 | 4.5 | 5 | 5 | 29.5 | Clear reflective voice and strong thematic cohesion |
| My AI is Smarter Than Me | published | 5 | 5 | 5 | 4.5 | 5 | 5 | 29.5 | Strong reflective essay with durable thesis |
| The Bug That Returned 200 OK | published | 5 | 5 | 5 | 4.5 | 5 | 5 | 29.5 | Strong lesson density and memorable hook |
| The YAGNI in Reverse | published | 5 | 4.5 | 5 | 5 | 5 | 5 | 29.5 | Strong voice, slightly looser structure than the leaders |
| The Lazy Way to Build Better Software | published | 5 | 5 | 4 | 5 | 5 | 5 | 29.0 | Strong framing, could use a little more technical depth |
| The Ghost in the Footer | published | 5 | 5 | 4 | 4.5 | 5 | 5 | 28.5 | Strong early exemplar of the voice |
| The Skill That Writes Itself | published | 5 | 4.5 | 4.5 | 4.5 | 5 | 5 | 28.5 | Strong meta-writing piece, good reference post for the skill |
| So I Built My Own View Counter | published | 5 | 5 | 3.5 | 4.5 | 5 | 5 | 28.0 | Good technical post, a bit tag-heavy at the ceiling |
| The Testing Infrastructure We Have, and the One We Need | published | 5 | 4.5 | 4 | 4.5 | 5 | 5 | 28.0 | Strong thesis, structure slightly less polished |
| Booting the Bloq Engine | published | 5 | 5 | 4.5 | 4 | 4 | 5 | 27.5 | Good origin story, summary/search alignment could be tighter |
| The ASCII UX Toy (for React) | published | 5 | 3 | 4.5 | 4.5 | 5 | 5 | 27.0 | Technically solid, structure is less disciplined |
| Metadata That Matters | published | 5 | 4.5 | 3 | 4.5 | 5 | 5 | 27.0 | Clean and useful, lighter than the strongest engineering posts |
| When a Shortcut Becomes a Surface | published | 5 | 5 | 4.5 | 3.5 | 4 | 5 | 27.0 | Reworked around Jotbot's system design and now publishable |
| I Added an RSS Feed | published | 5 | 5 | 3.5 | 3.5 | 4 | 5 | 26.0 | Thoughtful, but discoverability and payoff could be sharper |
| When Not To Unify | trashed | 5 | 5 | 4.5 | 5 | 5 | 1 | 25.5 | Strong article hidden by status, worth reconsidering |
| The Great Scroll of 2026: Why I Finally Paginated My Tiny Website | published | 5 | 4 | 3 | 3.5 | 5 | 5 | 25.5 | Interesting premise, could be tighter and more concrete |
| Plans, Agents, and the Illusion of Completion | published | 5 | 3.5 | 2 | 4.5 | 5 | 5 | 25.0 | Strong idea, currently light on technical evidence |
| When Bun Took Over My Node | published | 5 | 4 | 2 | 3.5 | 5 | 4 | 23.5 | Useful debugging post, but quite short |
| I Tried to Take Notes at Vibe Shift | published | 5 | 4 | 3 | 2.5 | 4 | 5 | 23.5 | Reflective, but less structurally aligned with the later voice |
| When Z-Index Lies to You | trashed | 5 | 4.5 | 3 | 4.5 | 5 | 1 | 23.0 | Promising but currently parked in trash |
| Hello World | trashed | 5 | 1 | 1 | 1 | 3 | 1 | 12.0 | Placeholder only |
| Second Post | trashed | 3 | 1 | 1 | 1 | 2 | 1 | 9.0 | Placeholder, invalid by current category and tag rules |

## What Is Working

- The best posts are now very consistent on voice.
- Engineering articles usually pair lived experience with technical substance instead of reading like tutorials.
- The tag graph is reasonably connected around `typescript`, `nextjs`, `ai`, `architecture`, and `debugging`.
- The strongest recent posts consistently open with a scene, use epigraphs well, and close with a broader insight.

## What Needs Attention

- The skill file is drifting faster than it is being maintained.
- Corpus bookkeeping is manual, so counts, tag frequencies, and category rules go stale.
- A few weak or placeholder posts still sit inside the corpus and distort the skill's self-understanding.
- Some published posts are good ideas but under-supported with code, diagrams, or concrete evidence.
- "Feature-worthy" is not yet defined, even though the corpus clearly has a top tier.

## Recommended Next Moves

1. Update `BLOQ-SKILL.md` to reflect `26` article files and `22` published posts.
2. Add a small pre-publish scorecard and threshold to the skill.
3. Decide whether to revive `When Not To Unify` and `When Z-Index Lies to You`, or remove them from active bookkeeping entirely.
4. Clean or archive the placeholder posts so they stop polluting category and quality signals.
5. Rebuild the tag registry from the real corpus counts instead of hand-maintaining `x+` estimates.
