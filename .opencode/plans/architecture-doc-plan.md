# Plan: Create ARCHITECTURE.md and Update README.md

## Goal
Create a comprehensive `ARCHITECTURE.md` in the project root and minimally update `README.md` to reference it.

---

## File 1: ARCHITECTURE.md (New - Root)

### Structure

```markdown
# Architecture Overview

## Table of Contents
1. System Overview
2. Tech Stack
3. Directory Structure
4. Core Modules
5. Data Flow Diagrams
6. API Reference
7. Services Layer
8. Component Architecture
9. Database Schema
10. External Integrations
11. Deployment
12. Development Guidelines
```

### Content Sections

#### 1. System Overview
- High-level description: Personal portfolio with blog, blips (micro-posts), and interactive art
- Key features: MDX blog, Telegram bot integration, visitor analytics, GitHub activity feed
- Architecture pattern: Next.js App Router with service layer

#### 2. Tech Stack
- Framework: Next.js 15, React 19, TypeScript
- Styling: Tailwind CSS, Motion, next-themes
- Content: MDX with next-mdx-remote, gray-matter
- Database: Supabase (PostgreSQL)
- Bot: grammy (Telegram)
- Search: Fuse.js
- Icons: Lucide, Tabler, Radix

#### 3. Directory Structure
```
src/
├── app/              # Next.js App Router
│   ├── api/          # API routes (7 endpoints)
│   ├── bloq/         # Blog pages
│   ├── blip/         # Micro-posts pages
│   ├── work/         # Portfolio pages
│   └── ...
├── components/
│   ├── ui/           # Reusable UI (dither-shader, code-block, tooltip)
│   ├── shared/       # Shared components (accordion, claps-counter)
│   ├── layout/       # Header, Footer
│   ├── home/         # Home page specific
│   └── specific/     # Page-specific (theme-toggle, animations)
├── lib/              # Utilities and helpers
│   ├── api/          # Shared API utilities
│   ├── bloq/         # Blog content management
│   ├── blip/         # Micro-post repository
│   ├── feed/         # RSS feed generation
│   ├── telegram/     # Telegram bot
│   ├── supabase/     # Database clients
│   └── utils/        # Pure utilities
├── services/         # Service layer (interfaces + implementations)
│   ├── location/     # IP geolocation
│   ├── claps/        # Claps API
│   └── github/       # GitHub GraphQL
├── hooks/            # React hooks
├── types/            # TypeScript definitions
├── data/             # Static data
└── content/          # MDX blog posts
```

#### 4. Core Modules

**lib/bloq/** - Blog Content Management
- `reader.ts` - Filesystem reading
- `parser.ts` - MDX frontmatter parsing
- `filters.ts` - Filter by tags, category, date
- `statistics.ts` - View counts, read time
- `related.ts` - Related posts algorithm

**lib/telegram/** - Telegram Bot
- `bot.ts` - Bot initialization
- `commands/handlers.ts` - Command handlers
- `middleware/auth.ts` - API key validation
- `repository.ts` - Subscriber DB operations

**lib/blip/** - Micro-posts
- `repository.ts` - CRUD operations
- `types.ts` - Blip type definitions

#### 5. Data Flow Diagrams

**Page Request Flow:**
```
User Request → Next.js Server → Page Component
                                    ↓
                              lib/bloq/reader.ts
                                    ↓
                              lib/bloq/parser.ts
                                    ↓
                              MDX Compilation
                                    ↓
                              Rendered Page
```

**API Request Flow:**
```
External Request → API Route → Validation (lib/api/)
                                  ↓
                            Service Layer
                                  ↓
                            Supabase Client
                                  ↓
                            Response (lib/api/responses.ts)
```

**Telegram Bot Flow:**
```
Telegram API → Webhook → lib/telegram/bot.ts
                              ↓
                        Command Handler
                              ↓
                        Repository → Supabase
                              ↓
                        Reply to Telegram
```

#### 6. API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/blip` | GET, POST | List/create micro-posts |
| `/api/blip/[serial]` | GET, PUT, DELETE | Single blip operations |
| `/api/visit` | POST | Track visitor analytics |
| `/api/claps/[type]/[id]` | GET, POST | Get/add claps |
| `/api/github-activity` | GET | Fetch GitHub activity |
| `/api/telegram/webhook` | POST | Telegram bot webhook |
| `/api/bloq/views/[slug]` | POST | Increment blog view count |
| `/feed.xml` | GET | RSS feed |

#### 7. Services Layer

Pattern: Interface + Implementation (DIP)

```typescript
// services/location/LocationService.interface.ts
export interface LocationService {
  fetchLocation(): Promise<LocationData | null>;
}

// services/location/IpApiLocationService.ts
export class IpApiLocationService implements LocationService { ... }
```

Services:
- `LocationService` - IP geolocation (ipapi.co)
- `ClapsService` - Claps CRUD operations
- `GitHubService` - GitHub GraphQL API

#### 8. Component Architecture

**Strategy Pattern (DitherShader):**
```
DitherShader.tsx
├── strategies/
│   ├── BayerStrategy.ts
│   ├── NoiseStrategy.ts
│   ├── HalftoneStrategy.ts
│   └── CrosshatchStrategy.ts
└── processors/
    ├── OriginalProcessor.ts
    ├── GrayscaleProcessor.ts
    ├── DuotoneProcessor.ts
    └── CustomPaletteProcessor.ts
```

**Component Categories:**
- `ui/` - Generic, reusable (no business logic)
- `shared/` - Shared across pages (may have business logic)
- `layout/` - Header, Footer, Navigation
- `home/` - Home page specific
- `specific/` - Single page specific

#### 9. Database Schema

**Tables:**
- `blips` - Micro-posts (serial, content, created_at, content_type)
- `subscribers` - Telegram subscribers (chat_id, created_at)
- `visitor_analytics` - Visitor tracking (ip, location data, timestamp)
- `claps` - Claps count (type, id, count)
- `blog_views` - Blog view counts (slug, count)

#### 10. External Integrations

- **Supabase** - PostgreSQL database, real-time subscriptions
- **Telegram** - Bot for notifications and subscriber management
- **GitHub** - GraphQL API for activity feed
- **ipapi.co** - IP geolocation

#### 11. Deployment

- **Platform:** Vercel (recommended for Next.js)
- **Build:** `npm run build`
- **Environment Variables:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `TELEGRAM_BOT_TOKEN`
  - `API_KEY`
  - `GITHUB_TOKEN`

#### 12. Development Guidelines

Reference to AGENTS.md for:
- Code style
- Import conventions
- Component patterns
- Error handling

---

## File 2: README.md (Update)

### Changes

1. **Add link to ARCHITECTURE.md** after "Built With" section
2. **Add quick start section** (minimal - just 3 commands)
3. **Keep existing content** (about me, contact)

### New Content to Add

```markdown
## 🚀 Quick Start

```bash
npm install    # Install dependencies
npm run dev    # Start development server
npm run build  # Build for production
```

For detailed architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).
```

---

## Implementation Order

1. Create `ARCHITECTURE.md` in root with all sections
2. Update `README.md` with quick start and architecture link
3. Verify markdown renders correctly

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `ARCHITECTURE.md` | Create (new) |
| `README.md` | Modify (add quick start + link) |

---

## Estimated Time

- ARCHITECTURE.md: ~30-45 minutes
- README.md update: ~5 minutes
- Total: ~40-50 minutes
