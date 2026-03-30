# Architecture Overview

This document provides a comprehensive overview of the portfolio website architecture, including tech stack, directory structure, core modules, data flows, and development patterns.

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Core Modules](#4-core-modules)
5. [Data Flow Diagrams](#5-data-flow-diagrams)
6. [API Reference](#6-api-reference)
7. [Services Layer](#7-services-layer)
8. [Component Architecture](#8-component-architecture)
9. [Database Schema](#9-database-schema)
10. [External Integrations](#10-external-integrations)
11. [Deployment](#11-deployment)
12. [Development Guidelines](#12-development-guidelines)

---

## 1. System Overview

### Description

Personal portfolio website showcasing interactive digital art, blog posts (bloqs), micro-posts (blips), and projects. The site features MDX-powered blog content, Telegram bot integration for notifications, visitor analytics, and GitHub activity feeds.

### Key Features

- **MDX Blog (Bloqs)** - Rich content with interactive components
- **Micro-posts (Blips)** - Short-form content via Telegram or web
- **Interactive Art** - WebGL dithering shaders, animations
- **Visitor Analytics** - IP-based location tracking
- **GitHub Activity** - GraphQL-powered activity feed
- **Telegram Bot** - Subscriber management and notifications

### Architecture Pattern

Next.js 15 App Router with a service layer implementing Dependency Inversion Principle (DIP). The codebase follows SOLID principles with:

- **Service interfaces** for external dependencies
- **Strategy pattern** for algorithm selection
- **Single responsibility** modules

---

## 2. Tech Stack

### Framework & Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.x | React framework with App Router |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Turbopack | - | Development bundler |

### Styling

| Technology | Purpose |
|------------|---------|
| Tailwind CSS | Utility-first CSS |
| Motion | Animations |
| next-themes | Dark/light mode |
| class-variance-authority | Component variants |

### Content & Data

| Technology | Purpose |
|------------|---------|
| MDX (next-mdx-remote) | Rich content authoring |
| gray-matter | Frontmatter parsing |
| Supabase | PostgreSQL database |
| Fuse.js | Client-side search |

### Integrations

| Technology | Purpose |
|------------|---------|
| grammy | Telegram bot framework |
| Lucide / Tabler / Radix | Icon libraries |
| react-syntax-highlighter | Code highlighting |

---

## 3. Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (7 endpoints)
│   │   ├── blip/           # Micro-posts CRUD
│   │   ├── bloq/views/     # Blog view tracking
│   │   ├── claps/          # Claps system
│   │   ├── github-activity/# GitHub GraphQL proxy
│   │   ├── telegram/       # Bot webhook
│   │   └── visit/          # Visitor analytics
│   ├── bloq/               # Blog pages
│   ├── blip/               # Micro-posts pages
│   ├── work/               # Portfolio pages
│   └── feed.xml/           # RSS feed
│
├── components/
│   ├── ui/                 # Generic, reusable UI
│   │   ├── dither-shader/  # WebGL dithering (strategy pattern)
│   │   ├── code-block.tsx  # Syntax highlighting
│   │   └── tooltip.tsx     # Radix tooltip wrapper
│   ├── shared/             # Shared across pages
│   │   ├── ClapsCounter.tsx
│   │   ├── CardBackground.tsx
│   │   └── ...
│   ├── layout/             # Header, Footer
│   │   ├── footer/         # Footer + VisitorAnalytics
│   │   └── Header.tsx
│   ├── home/               # Home page specific
│   ├── bloq/               # Blog MDX wrappers
│   └── specific/           # Single-page components
│
├── lib/                    # Core utilities
│   ├── api/                # Shared API utilities
│   │   ├── responses.ts    # JSON response helpers
│   │   ├── validation.ts   # Auth & content validation
│   │   └── constants.ts    # Shared constants
│   ├── bloq/               # Blog content management
│   │   ├── reader.ts       # Filesystem reading
│   │   ├── parser.ts       # MDX frontmatter parsing
│   │   ├── filters.ts      # Filter by tags, category, date
│   │   ├── statistics.ts   # View counts, read time
│   │   ├── related.ts      # Related posts algorithm
│   │   └── types.ts        # Type definitions
│   ├── blip/               # Micro-posts
│   │   ├── repository.ts   # CRUD operations
│   │   └── types.ts
│   ├── telegram/           # Telegram bot
│   │   ├── bot.ts          # Bot initialization
│   │   ├── commands/       # Command handlers
│   │   ├── middleware/     # API key validation
│   │   ├── formatters.ts   # Message formatting
│   │   └── repository.ts   # Subscriber DB ops
│   ├── feed/               # RSS feed generation
│   │   ├── generator.ts
│   │   └── formatters.ts
│   ├── supabase/           # Database clients
│   │   ├── client.ts       # Browser client
│   │   └── server.ts       # Server client
│   ├── utils/              # Pure utilities
│   │   └── fingerprint.ts  # Browser fingerprinting
│   ├── utils.ts            # cn() and helpers
│   ├── base62.ts           # Base62 encoding
│   └── search.ts           # Fuse.js configuration
│
├── services/               # Service layer (DIP)
│   ├── location/           # IP geolocation
│   │   ├── LocationService.interface.ts
│   │   └── IpApiLocationService.ts
│   ├── claps/              # Claps operations
│   │   ├── ClapsService.interface.ts
│   │   └── ApiClapsService.ts
│   └── github/             # GitHub GraphQL
│       ├── GitHubService.interface.ts
│       └── GitHubGraphQLService.ts
│
├── hooks/                  # React hooks
│   ├── useClaps.ts
│   ├── useAnalytics.ts
│   └── useCurrentVisitorLocation.ts
│
├── types/                  # TypeScript definitions
├── data/                   # Static data files
│   ├── projectlist.tsx
│   ├── skilllist.tsx
│   └── education.ts
│
└── content/                # MDX blog posts
    └── bloqs/
        └── YYYY/post-slug/
            └── page.mdx
```

---

## 4. Core Modules

### lib/bloq/ - Blog Content Management

Handles all blog-related operations with single-responsibility modules:

| File | Responsibility |
|------|----------------|
| `reader.ts` | Filesystem operations, directory scanning |
| `parser.ts` | MDX frontmatter extraction, content parsing |
| `filters.ts` | Filter posts by tags, category, date |
| `statistics.ts` | View counts, reading time calculation |
| `related.ts` | Related posts algorithm |
| `types.ts` | TypeScript interfaces (`BloqPost`, `BloqMetadata`) |

### lib/telegram/ - Telegram Bot

Modular bot implementation:

| File | Responsibility |
|------|----------------|
| `bot.ts` | Bot initialization, command registration |
| `commands/handlers.ts` | All command handlers (start, subscribe, etc.) |
| `middleware/auth.ts` | API key validation |
| `formatters.ts` | Message formatting utilities |
| `repository.ts` | Subscriber database operations |

### lib/blip/ - Micro-posts

| File | Responsibility |
|------|----------------|
| `repository.ts` | CRUD operations for blips |
| `types.ts` | `Blip` interface and types |

### lib/api/ - Shared API Utilities

| File | Responsibility |
|------|----------------|
| `responses.ts` | `jsonError()`, `jsonSuccess()` helpers |
| `validation.ts` | `validateApiKey()`, `parseContent()` |
| `constants.ts` | `noStoreHeaders`, limits |

---

## 5. Data Flow Diagrams

### Page Request Flow

```
User Request → Next.js Server → Page Component
                                    │
                              lib/bloq/reader.ts
                                    │
                              lib/bloq/parser.ts
                                    │
                              MDX Compilation
                                    │
                              Rendered Page
```

### API Request Flow

```
External Request → API Route → Validation (lib/api/)
                                │
                          Service Layer
                                │
                          Supabase Client
                                │
                          Response (lib/api/responses.ts)
```

### Telegram Bot Flow

```
Telegram API → Webhook → lib/telegram/bot.ts
                            │
                      Command Handler
                            │
                      Repository → Supabase
                            │
                      Reply to Telegram
```

### Claps Flow

```
User Click → ClapsCounter → useClaps hook
                              │
                        ApiClapsService
                              │
                        POST /api/claps/[type]/[id]
                              │
                        Supabase Update
```

---

## 6. API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/blip` | GET | List all blips |
| `/api/blip` | POST | Create new blip |
| `/api/blip/[serial]` | GET | Get single blip |
| `/api/blip/[serial]` | PUT | Update blip |
| `/api/blip/[serial]` | DELETE | Delete blip |
| `/api/visit` | POST | Track visitor analytics |
| `/api/claps/[type]/[id]` | GET | Get clap count |
| `/api/claps/[type]/[id]` | POST | Increment claps |
| `/api/github-activity` | GET | Fetch GitHub activity |
| `/api/telegram/webhook` | POST | Telegram bot webhook |
| `/api/bloq/views/[slug]` | POST | Increment blog view count |
| `/feed.xml` | GET | RSS feed |

### Authentication

API routes requiring authentication use Bearer token:

```typescript
Authorization: Bearer <API_KEY>
```

Validated via `lib/api/validation.ts:validateApiKey()`.

---

## 7. Services Layer

Implements Dependency Inversion Principle with interface + implementation pattern.

### LocationService

```typescript
// services/location/LocationService.interface.ts
export interface LocationService {
  fetchLocation(): Promise<LocationData | null>;
}

// services/location/IpApiLocationService.ts
export class IpApiLocationService implements LocationService {
  async fetchLocation(): Promise<LocationData | null> {
    // Fetches from ipapi.co
  }
}
```

### ClapsService

```typescript
// services/claps/ClapsService.interface.ts
export interface ClapsService {
  getClaps(type: string, id: string): Promise<number>;
  addClap(type: string, id: string): Promise<number>;
}

// services/claps/ApiClapsService.ts
export class ApiClapsService implements ClapsService {
  // HTTP calls to /api/claps/
}
```

### GitHubService

```typescript
// services/github/GitHubService.interface.ts
export interface GitHubService {
  fetchActivity(): Promise<GitHubActivity[]>;
}

// services/github/GitHubGraphQLService.ts
export class GitHubGraphQLService implements GitHubService {
  // GraphQL queries to GitHub API
}
```

---

## 8. Component Architecture

### Strategy Pattern: DitherShader

The dithering component uses strategy pattern for extensibility:

```
components/ui/dither-shader/
├── DitherShader.tsx           # Main component
├── types.ts                   # Type definitions
├── strategies/
│   ├── DitherStrategy.interface.ts
│   ├── BayerStrategy.ts       # Ordered dithering
│   ├── NoiseStrategy.ts       # Random noise
│   ├── HalftoneStrategy.ts    # Halftone pattern
│   └── CrosshatchStrategy.ts  # Crosshatch pattern
├── processors/
│   ├── ColorProcessor.interface.ts
│   ├── OriginalProcessor.ts   # No color change
│   ├── GrayscaleProcessor.ts  # Grayscale conversion
│   ├── DuotoneProcessor.ts    # Two-color palette
│   └── CustomPaletteProcessor.ts
└── utils/
    └── colorUtils.ts          # Color manipulation
```

Adding a new dithering strategy requires only:
1. Create new strategy implementing `DitherStrategy`
2. Add to strategy registry
3. No modification to existing code

### Component Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| `ui/` | Generic, reusable, no business logic | DitherShader, CodeBlock, Tooltip |
| `shared/` | Shared across pages, may have business logic | ClapsCounter, CardBackground |
| `layout/` | Page structure | Header, Footer |
| `home/` | Home page specific | BioSection, ProjectList |
| `bloq/` | Blog MDX wrappers | SeedingPlantWrapper |
| `specific/` | Single page specific | ThemeToggle, FallingLeaves |

---

## 9. Database Schema

### Tables

#### blips

```sql
CREATE TABLE blips (
  serial INTEGER PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  content_type TEXT DEFAULT 'text'
);
```

#### subscribers

```sql
CREATE TABLE subscribers (
  chat_id BIGINT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### visits

```sql
CREATE TABLE visits (
  id BIGSERIAL PRIMARY KEY,
  ip TEXT UNIQUE NOT NULL,
  visit_count INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  city TEXT,
  region TEXT,
  country TEXT
);
```

`visits` is a visitor-state table, not an append-only event log. One row represents one IP, `visit_count` is the absolute total visits for that IP, and row count is the site's unique visitor count.

#### claps

```sql
CREATE TABLE claps (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  count INTEGER DEFAULT 0
);
```

#### blog_views

```sql
CREATE TABLE blog_views (
  slug TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0
);
```

---

## 10. External Integrations

### Supabase

- PostgreSQL database hosting
- Server and client SDKs
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Telegram Bot

- Framework: grammy
- Webhook endpoint: `/api/telegram/webhook`
- Commands: `/start`, `/subscribe`, `/unsubscribe`, `/list`, `/get`, `/edit`, `/delete`
- Environment variable: `TELEGRAM_BOT_TOKEN`

### GitHub GraphQL

- Activity feed via GraphQL API
- Service: `GitHubGraphQLService`
- Environment variable: `GITHUB_TOKEN`

### IP Geolocation

- Provider: ipapi.co
- Service: `IpApiLocationService`
- No API key required (free tier)

---

## 11. Deployment

### Platform

Recommended: **Vercel** (optimized for Next.js)

### Build Commands

```bash
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role (server) |
| `TELEGRAM_BOT_TOKEN` | Yes | Telegram bot token |
| `API_KEY` | Yes | API authentication key |
| `GITHUB_TOKEN` | Yes | GitHub personal access token |

### Deployment Checklist

1. Set all environment variables in Vercel
2. Configure Telegram webhook URL
3. Verify Supabase connection
4. Test all API endpoints

---

## 12. Development Guidelines

For detailed development guidelines including:

- Code style and formatting
- Import conventions
- Component patterns
- Error handling
- TypeScript best practices

See **[AGENTS.md](./AGENTS.md)**

### Quick Reference

- **Path alias**: Use `@/*` for imports from `src/`
- **Components**: Arrow function syntax, default export for pages
- **Styling**: Use `cn()` utility for class merging
- **Errors**: Use `error: unknown` with `instanceof Error` check
- **API routes**: Named exports (`GET`, `POST`, etc.)
