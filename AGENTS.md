# AGENTS.md - Agent Coding Guidelines

This file provides guidelines for AI agents working on this codebase.

## Project Overview

- **Framework**: Next.js 15 with React 19 and TypeScript
- **Styling**: Tailwind CSS with CSS variables for theming
- **Path Alias**: `@/*` maps to `./src/*`
- **Build Tool**: Turbopack for development

## Build/Lint/Test Commands

```bash
# Development
npm run dev              # Start dev server with turbopack

# Production
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint (extends next/core-web-vitals, next/typescript)

# No test framework configured
```

There is no test suite configured for this project. Do not add tests.

## Code Style Guidelines

### TypeScript

- **Strict Mode**: Enabled in `tsconfig.json`
- **Type Inference**: Prefer explicit types for function parameters and return types
- **Unknown Errors**: When catching errors, use `error: unknown` and check with `instanceof Error`

```typescript
// Good
export async function GET() {
  try {
    // ...
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

### Imports

- Use path alias `@/` for absolute imports from `src/`
- Separate React import from other imports
- Order: React imports → external libraries → internal modules

```typescript
import React, { Suspense } from 'react'
import { someLib } from 'external-lib'
import { getData } from '@/lib/utils'
import { SomeComponent } from '@/components/ui'
```

### Components

- Use `.tsx` for React components, `.ts` for utilities
- Use arrow function syntax for page components: `const Page = () => {...}`
- Export as default for page components
- Use named exports for utility functions
- Prefer Server Components by default (no "use client" unless needed)

### Styling with Tailwind

- Use `cn()` utility from `@/lib/utils` to merge classes
- Use CSS variables for colors (defined in Tailwind config)
- Use semantic class names

```typescript
import { cn } from '@/lib/utils'

function Component({ className }: { className?: string }) {
  return <div className={cn("base-class", className)}>...</div>
}
```

### Naming Conventions

- **Components**: PascalCase (`BloqCard`, `TagBadge`)
- **Functions/variables**: camelCase (`getBloqPosts`, `isLoading`)
- **Files**: kebab-case for utilities (`bloq.ts`), PascalCase for components (`BloqCard.tsx`)
- **Constants**: SCREAMING_SNAKE_CASE for configuration constants

### File Organization

```
src/
├── app/              # Next.js App Router pages
│   ├── api/          # API routes
│   └── [slug]/       # Dynamic routes
├── components/
│   ├── ui/           # Reusable UI components
│   ├── shared/       # Shared components
│   ├── layout/       # Layout components
│   ├── home/         # Home page components
│   └── specific/     # Specific page components
├── lib/              # Utility functions and helpers
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── data/             # Static data files
```

### Error Handling

- Always return proper HTTP status codes in API routes
- Use `NextResponse.json()` with error messages
- Log errors appropriately (console.error for server-side)
- Never expose sensitive information in error responses

### Database/API Clients

- Server-side clients in `src/lib/` (e.g., `supabaseServerClient.ts`)
- Client-side clients in appropriate locations
- Environment variables for secrets (never commit `.env` files)

### MDX Content

- Blog posts stored in `src/content/bloqs/`
- Directory structure: `src/content/bloqs/YYYY/post-slug/`
- Required frontmatter: `title`, `publishedAt`, `summary`
- Optional: `tags`, `category`, `authors`, `image`, `draft`, `featured`, `status`

### API Routes

- Use named exports for HTTP methods: `export async function GET()`, `POST()`, etc.
- Return `NextResponse.json()` with proper status codes
- Handle missing environment variables with descriptive errors
