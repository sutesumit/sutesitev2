# ADR-001: Fetch GitHub heatmap data one month at a time

## Status
Accepted

## Date
2026-05-03

## Context
The contribution heatmap on `/work` originally booted by fetching one GitHub activity payload and then allowed month navigation entirely on the client.

That approach created three problems:
- older months eventually fell outside the fetched dataset, so navigation could show misleading empty states
- the UI had no truthful way to distinguish "valid zero-contribution month" from "we never loaded this month"
- the initial implementation encouraged stretching one server response to cover open-ended backward navigation

We wanted to preserve the game-like experience of the heatmap while supporting unlimited backward navigation.

We also wanted to keep these constraints:
- GitHub token usage must remain server-side
- the browser should not talk directly to GitHub
- revisiting a month in the same session should not trigger another fetch
- month changes should not replay the full boot screen

## Decision
Use month-on-demand fetching for the contribution heatmap.

The final design is:
- the client requests `/api/github-activity?year=YYYY&month=MM`
- the API contract uses calendar months `1-12`
- the GitHub service fetches a bounded contribution range for exactly that month
- the client caches each loaded month in memory using a `YYYY-MM` key
- the first page load keeps the existing boot flow
- later uncached month navigation shows an inline loading grid instead of blanking the component or replaying boot

## Alternatives Considered

### Fetch a large calendar snapshot once at boot
- Pros: simple initial implementation, no navigation-time fetches
- Cons: older navigation eventually outruns the loaded data, encourages oversized responses, makes state ambiguous
- Rejected: did not scale truthfully with unlimited backward navigation

### Windowed prefetch
- Pros: smoother sequential browsing, fewer visible loading states
- Cons: higher implementation complexity, more speculative network traffic, more cache bookkeeping
- Rejected: useful later, but not necessary for the first correct version

### Fresh fetch on every navigation with no client cache
- Pros: very simple mental model
- Cons: duplicate requests for revisits, avoidable latency, unnecessary server/GitHub load
- Rejected: session-local cache was low cost and clearly improved UX

### Keep the previous month visible until the next month loads
- Pros: avoids an empty transition
- Cons: visually misleading because the header changes before the board does, makes the interface feel stale during loading
- Rejected: a loading grid was a more honest state transition

## Consequences

### Positive
- Unlimited backward navigation is now supported one month at a time
- The API contract is explicit and easier to reason about
- Cached revisits are instant within a session
- The UI can cleanly distinguish loading, loaded, and error states
- GitHub credentials remain confined to the server route and service layer

### Negative
- First visit to an uncached month now incurs network latency
- The client now owns month cache bookkeeping
- The API route and GitHub service must agree on month-boundary handling

### Neutral
- Internal React month state remains `0-11` where local date math already uses JavaScript `Date`
- Public API input/output uses `1-12` months to avoid off-by-one confusion at the boundary

## Notes
- Cached months are session-local only; a full page reload clears the in-memory cache
- The route still benefits from server-side caching/revalidation, so repeated visits across sessions are not forced to hit GitHub every time
- The loading grid intentionally replaces stale board contents during uncached month navigation
