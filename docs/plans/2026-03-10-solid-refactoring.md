# SOLID Refactoring Plan

Status: Partially executed — Waves overlapping the telegram/jotbot service refactor are done

This document outlines a comprehensive plan to refactor the codebase to follow SOLID principles.

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [SOLID Violations Summary](#solid-violations-summary)
3. [Proposed File Structure](#proposed-file-structure)
4. [File Renames and Moves](#file-renames-and-moves)
5. [Implementation Waves](#implementation-waves)
6. [Detailed Refactoring Tasks](#detailed-refactoring-tasks)

---

## Executive Summary

The codebase has **15 high-priority** and **12 medium-priority** SOLID violations. The most critical issues are:

1. **`telegram-bot.ts`** - 263 lines handling bot init, commands, database operations, and formatting
2. **`bloq.ts`** - 350 lines mixing filesystem I/O, parsing, filtering, and statistics
3. **`dither-shader.tsx`** - 484 lines with 18 props and hardcoded algorithms
4. **API route duplication** - `validateApiKey`, `parseContent`, `noStoreHeaders` duplicated across files

---

## SOLID Violations Summary

### Single Responsibility Principle (SRP) - 15 Violations

| Severity | File | Issue |
|----------|------|-------|
| CRITICAL | `lib/telegram-bot.ts` | Bot init + 7 command handlers + DB operations + formatting |
| HIGH | `lib/bloq.ts` | Filesystem + parsing + filtering + statistics + search |
| HIGH | `components/ui/dither-shader.tsx` | 4 dithering algorithms + 4 color modes + image loading + canvas rendering |
| HIGH | `api/blip/route.ts` | Auth + parsing + DB + notifications |
| HIGH | `api/blip/[serial]/route.ts` | Duplicates validation/parsing from parent |
| HIGH | `api/visit/route.ts` | Visit insert + previous visitor + unique count |
| MEDIUM | `data/projectlist.tsx` | Data + types + helper functions |
| MEDIUM | `components/layout/Footer.tsx` | Analytics tracking + presentation |
| MEDIUM | `app/bloq/components/BloqFeed.tsx` | URL state + filtering + rendering |
| MEDIUM | `app/blip/components/BlipModal.tsx` | Modal + keyboard + clipboard + scroll lock |
| MEDIUM | `hooks/useClaps.ts` | Fingerprint + API + state + optimistic updates |
| MEDIUM | `api/github-activity/route.ts` | Query generation + API + data transformation |
| MEDIUM | `api/claps/[type]/[id]/route.ts` | Type validation + post validation + clap operations |
| LOW | `app/bloq/components/FilterPanel.tsx` | Search + category + tag filtering |
| LOW | `hooks/useAnalytics.ts` | Site visits + blog views |

### Open/Closed Principle (OCP) - 8 Violations

| Severity | File | Issue |
|----------|------|-------|
| HIGH | `components/ui/dither-shader.tsx` | Switch statements for dither/color modes |
| MEDIUM | `lib/telegram-bot.ts` | Adding commands requires modifying initBot() |
| MEDIUM | `components/ui/code-block.tsx` | Hard-coded syntax highlighter and theme |
| MEDIUM | `api/blip/route.ts` | Adding content types requires modifying parseContent() |
| MEDIUM | `api/claps/[type]/[id]/route.ts` | Post type validation hardcoded |
| LOW | `components/shared/HoverTextTyper.tsx` | Hard-coded animation timing |
| LOW | `lib/bloq.ts` | Filter functions hardcoded |
| LOW | `lib/feed.ts` | Hardcoded site constants |

### Interface Segregation Principle (ISP) - 4 Violations

| Severity | File | Issue |
|----------|------|-------|
| HIGH | `components/ui/dither-shader.tsx` | 18 props, many mode-specific |
| MEDIUM | `app/bloq/components/FilterPanel.tsx` | 10 props mixing concerns |
| MEDIUM | `types/location.ts` | 29-field interface, clients use subset |
| LOW | `lib/bloq.ts` | BloqPost has many optional fields |

### Dependency Inversion Principle (DIP) - 12 Violations

| Severity | File | Issue |
|----------|------|-------|
| HIGH | `hooks/useCurrentVisitorLocation.ts` | Hard-coded ipapi.co URL |
| HIGH | All API routes | Direct Supabase client instantiation |
| HIGH | `api/blip/route.ts` | Direct Telegram bot instantiation |
| HIGH | `api/github-activity/route.ts` | Direct fetch to GitHub API |
| MEDIUM | `lib/telegram-bot.ts` | Duplicates blip.ts DB operations |
| MEDIUM | `hooks/useClaps.ts` | Hard-coded API paths, localStorage key |
| MEDIUM | `components/layout/Footer.tsx` | Direct hook dependencies |
| MEDIUM | `app/bloq/components/BloqFeed.tsx` | Direct Next.js navigation hooks |
| MEDIUM | `components/shared/ClapsCounter.tsx` | Direct useClaps dependency |
| MEDIUM | `lib/feed.ts` | Imports data sources directly |
| LOW | `app/blip/components/BlipCard.tsx` | Inline date formatting |
| LOW | `lib/bloq.ts` | Hardcoded content path |

---

## Proposed File Structure

### New Directory Structure

```
src/
├── app/                          # Next.js App Router (unchanged)
├── components/
│   ├── ui/
│   │   ├── code-block/           # Folder for code-block components
│   │   ├── dither-shader/        # Folder with strategies/processors
│   │   └── tooltip/
│   ├── shared/
│   │   ├── accordion/
│   │   ├── card-background/
│   │   ├── claps-counter/
│   │   ├── copy-link/
│   │   ├── hover-text-typer/
│   │   ├── live-repo-links/
│   │   └── scramble-text/
│   ├── layout/
│   │   ├── header/               # Header + Navigation + navConfig
│   │   └── footer/               # Footer + VisitorAnalytics
│   ├── home/
│   │   ├── bio-section/
│   │   └── project-list/
│   ├── bloq/
│   │   └── wrappers/             # Client wrappers for MDX
│   └── specific/
│       ├── seeding-plant/
│       ├── falling-leaves/
│       └── theme-toggle/
│
├── lib/
│   ├── utils/                    # Pure utilities
│   │   ├── cn.ts
│   │   ├── base62.ts
│   │   └── fingerprint.ts        # NEW: Extracted from useClaps
│   │
│   ├── api/                      # NEW: Shared API utilities
│   │   ├── responses.ts
│   │   ├── validation.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   │
│   ├── bloq/                     # Reorganized from bloq.ts
│   │   ├── types.ts
│   │   ├── reader.ts
│   │   ├── parser.ts
│   │   ├── filters.ts
│   │   ├── statistics.ts
│   │   ├── search.ts
│   │   ├── related.ts
│   │   └── index.ts
│   │
│   ├── blip/                     # Reorganized from blip.ts
│   │   ├── types.ts
│   │   ├── repository.ts
│   │   └── index.ts
│   │
│   ├── telegram/                 # Reorganized from telegram-bot.ts
│   │   ├── bot.ts
│   │   ├── commands/
│   │   │   ├── start.ts
│   │   │   ├── subscribe.ts
│   │   │   ├── list.ts
│   │   │   ├── get.ts
│   │   │   ├── edit.ts
│   │   │   ├── delete.ts
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── formatters.ts
│   │   ├── replies.ts
│   │   └── index.ts
│   │
│   ├── feed/
│   │   ├── generator.ts
│   │   ├── formatters.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── search/
│   │   └── fuse.ts
│   │
│   └── supabase/
│       ├── client.ts
│       └── server.ts
│
├── services/                     # NEW: Service layer
│   ├── analytics/
│   │   ├── AnalyticsService.interface.ts
│   │   ├── AnalyticsService.ts
│   │   └── index.ts
│   ├── location/
│   │   ├── LocationService.interface.ts
│   │   ├── IpApiLocationService.ts
│   │   └── index.ts
│   ├── claps/
│   │   ├── ClapsService.interface.ts
│   │   ├── ClapsService.ts
│   │   └── index.ts
│   └── github/
│       ├── GitHubService.interface.ts
│       ├── GitHubService.ts
│       └── index.ts
│
├── hooks/
│   ├── useClaps.ts
│   ├── useAnalytics.ts
│   └── useLocation.ts            # Renamed from useCurrentVisitorLocation
│
├── types/
│   ├── bloq.ts                   # Moved from lib/bloq.ts
│   ├── blip.ts
│   ├── location/
│   │   ├── LocationData.ts
│   │   ├── NetworkInfo.ts
│   │   ├── CountryMetadata.ts
│   │   └── index.ts
│   ├── api.ts
│   └── index.ts
│
├── data/
│   ├── projects/
│   │   ├── projectData.ts
│   │   ├── projectHelpers.ts
│   │   └── index.ts
│   ├── skills/
│   │   └── skillData.ts
│   ├── navigation/
│   │   └── navConfig.ts
│   ├── github.ts
│   └── education.ts
│
└── content/
    └── bloqs/
```

---

## File Renames and Moves

### Component Renames (Folder Structure)

| Current | Proposed |
|---------|----------|
| `components/ui/code-block.tsx` | `components/ui/code-block/CodeBlock.tsx` |
| `components/ui/code-block-dynamic.tsx` | `components/ui/cod
Block/DynamicCodeBlock.tsx` |
| `components/ui/dither-shader.tsx` | `components/ui/dither-shader/DitherShader.tsx` |
| `components/ui/tooltip.tsx` | `components/ui/tooltip/Tooltip.tsx` |
| `components/shared/Accordion.tsx` | `components/shared/accordion/Accordion.tsx` |
| `components/shared/CardBackground.tsx` | `components/shared/card-background/CardBackground.tsx` |
| `components/shared/ClapsCounter.tsx` | `components/shared/claps-counter/ClapsCounter.tsx` |
| `components/shared/CopyLink.tsx` | `components/shared/copy-link/CopyLink.tsx` |
| `components/shared/HoverTextTyper.tsx` | `components/shared/hover-text-typer/HoverTextTyper.tsx` |
| `components/shared/LiveRepoLinks.tsx` | `components/shared/live-repo-links/LiveRepoLinks.tsx` |
| `components/shared/ScrambleText.tsx` | `components/shared/scramble-text/ScrambleText.tsx` |
| `components/layout/Header.tsx` | `components/layout/header/Header.tsx` |
| `components/layout/Footer.tsx` | `components/layout/footer/Footer.tsx` |
| `components/home/BioSection.tsx` | `components/home/bio-section/BioSection.tsx` |
| `components/home/ProjectList.tsx` | `components/home/project-list/ProjectList.tsx` |
| `components/bloq/SeedingPlantWrappedWrapper.tsx` | `components/bloq/wrappers/SeedingPlantWrapper.tsx` |
| `components/specific/ToggleTheme.tsx` | `components/specific/theme-toggle/ThemeToggle.tsx` |

### Lib Reorganization

| Current | Proposed |
|---------|----------|
| `lib/supabaseClient.ts` | `lib/supabase/client.ts` |
| `lib/supabaseServerClient.ts` | `lib/supabase/server.ts` |
| `lib/search.ts` | `lib/search/fuse.ts` |
| `lib/telegram-bot.ts` | `lib/telegram/bot.ts` (plus command files) |
| `lib/telegram-replies.ts` | `lib/telegram/replies.ts` |
| `lib/bloq.ts` | `lib/bloq/` folder with multiple files |
| `lib/blip.ts` | `lib/blip/repository.ts` |
| `lib/feed.ts` | `lib/feed/` folder |

### Hook and Data Renames

| Current | Proposed |
|---------|----------|
| `hooks/useCurrentVisitorLocation.ts` | `hooks/useLocation.ts` |
| `data/skilllist.tsx` | `data/skills/skillData.ts` |
| `data/education.tsx` | `data/education.ts` |
| `data/projectlist.tsx` | `data/projects/projectData.ts` + `projectHelpers.ts` |
| `data/seedingplant.ts` | `public/animations/seeding-plant.json` |
| `data/fallingLeaves.ts` | `public/animations/falling-leaves.json` |

---

## Implementation Waves

### Wave 1: Foundation (4-6 hours)
Create shared utilities and service interfaces.

**Files to Create:**
- `lib/api/responses.ts`, `lib/api/validation.ts`, `lib/api/constants.ts`
- `lib/utils/fingerprint.ts`
- `services/location/LocationService.interface.ts`, `IpApiLocationService.ts`
- `services/claps/ClapsService.interface.ts`, `ClapsService.ts`
- `services/github/GitHubService.interface.ts`, `GitHubService.ts`

### Wave 2: Lib Reorganization (8-12 hours)
Split large lib files into focused modules.

**Files to Create:**
- `lib/bloq/types.ts`, `reader.ts`, `parser.ts`, `filters.ts`, `statistics.ts`, `search.ts`, `related.ts`, `index.ts`
- `lib/telegram/bot.ts`, `commands/*.ts`, `middleware/auth.ts`, `formatters.ts`
- `lib/blip/types.ts`, `repository.ts`, `index.ts`
- `lib/feed/generator.ts`, `formatters.ts`, `types.ts`
- `lib/supabase/client.ts`, `server.ts`

### Wave 3: API Route Refactoring (4-6 hours)
Remove duplication using shared utilities.

**Files to Modify:**
- `app/api/blip/route.ts` - Use `lib/api/validation.ts`
- `app/api/blip/[serial]/route.ts` - Remove duplicated functions
- `app/api/visit/route.ts` - Use `lib/api/responses.ts`
- `app/api/github-activity/route.ts` - Use `services/github/`
- `app/api/claps/[type]/[id]/route.ts` - Use `services/claps/`

### Wave 4: Component Refactoring (8-12 hours)
Split large components, implement strategy pattern.

**Tasks:**
- Refactor `dither-shader.tsx` into folder with strategies and processors
- Split `Footer.tsx` into `Footer.tsx` + `VisitorAnalytics.tsx`
- Extract filtering logic from `BloqFeed.tsx` to custom hook
- Extract keyboard/scroll hooks from `BlipModal.tsx`
- Split `FilterPanel.tsx` into focused components

### Wave 5: Hook Refactoring (2-4 hours)
Use service abstractions in hooks.

**Files to Modify:**
- `hooks/useClaps.ts` - Use `ClapsService`, extract fingerprint
- `hooks/useAnalytics.ts` - Use `AnalyticsService`
- `hooks/useCurrentVisitorLocation.ts` - Rename to `useLocation.ts`, use `LocationService`

### Wave 6: Data File Cleanup (2-3 hours)
Separate data from logic.

**Tasks:**
- Split `projectlist.tsx` into `projectData.ts` + `projectHelpers.ts`
- Rename `skilllist.tsx` to `skillData.ts`
- Change `education.tsx` extension to `.ts`
- Move animation JSONs to `public/animations/`

### Wave 7: Component Folder Structure (4-6 hours)
Organize components into consistent folder structure.

**Tasks:**
- Move all UI components to `components/ui/*/`
- Move all shared components to `components/shared/*/`
- Move all layout components to `components/layout/*/`
- Move all home components to `components/home/*/`

---

## Detailed Refactoring Examples

### Example 1: API Utilities

```typescript
// lib/api/constants.ts
export const noStoreHeaders = { cache: 'no-store' as const };
export const MAX_CONTENT_LENGTH = 1000;

// lib/api/validation.ts
export function validateApiKey(authHeader: string | null): boolean {
  if (!authHeader) return false;
  return authHeader === 'Bearer ' + process.env.API_KEY;
}

export function parseContent(body: string, contentType: string): string | null {
  // Handle JSON, form-urlencoded, and plain text
}

// lib/api/responses.ts
export const jsonError = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });
```

### Example 2: Location Service (DIP)

```typescript
// services/location/LocationService.interface.ts
export interface LocationService {
  fetchLocation(): Promise<LocationData | null>;
}

// services/location/IpApiLocationService.ts
export class IpApiLocationService implements LocationService {
  constructor(private baseUrl = 'https://ipapi.co/json/') {}
  
  async fetchLocation(): Promise<LocationData | null> {
    const res = await fetch(this.baseUrl);
    return res.ok ? res.json() : null;
  }
}

// hooks/useLocation.ts
export function useLocation(service = new IpApiLocationService()) {
  const [location, setLocation] = useState<LocationData | null>(null);
  useEffect(() => { service.fetchLocation().then(setLocation); }, [service]);
  return location;
}
```

### Example 3: Dither Strategy Pattern (OCP)

```typescript
// components/ui/dither-shader/strategies/DitherStrategy.interface.ts
export interface DitherStrategy {
  getThreshold(x: number, y: number, time: number, gridSize: number): number;
}

// components/ui/dither-shader/strategies/BayerStrategy.ts
export class BayerStrategy implements DitherStrategy {
  getThreshold(x: number, y: number, _: number, gridSize: number): number {
    // Bayer matrix implementation
  }
}

// Usage - no switch statement needed
const strategies: Record<string, DitherStrategy> = {
  bayer: new BayerStrategy(),
  halftone: new HalftoneStrategy(),
  // Adding new strategy = just add to object, no code modification
};
```

---

## Success Criteria

After refactoring, the codebase should meet:

1. **No file exceeds 200 lines** (except data files)
2. **No function exceeds 50 lines**
3. **No interface has more than 8 properties** (use composition)
4. **No switch statements** for algorithm selection (use strategy pattern)
5. **All API routes use shared utilities** for common operations
6. **All services have interfaces** for dependency injection
7. **All types are in `types/`** directory
8. **All components follow folder structure** with index.ts exports

---

## Estimated Total Effort

| Wave | Estimated Time |
|------|----------------|
| Wave 1: Foundation | 4-6 hours |
| Wave 2: Lib Reorganization | 8-12 hours |
| Wave 3: API Routes | 4-6 hours |
| Wave 4: Components | 8-12 hours |
| Wave 5: Hooks | 2-4 hours |
| Wave 6: Data Files | 2-3 hours |
| Wave 7: Folder Structure | 4-6 hours |
| **Total** | **32-49 hours** |
