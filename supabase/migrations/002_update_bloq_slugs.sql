-- Migration: Update bloq slugs in Supabase
-- This script updates the 'slug' in 'bloq_views' and 'post_id' in 'claps' tables.

DO $$
BEGIN
    -- Update bloq_views table
    -- hello-world -> hello-world-nextjs-blog-start
    UPDATE bloq_views SET slug = 'hello-world-nextjs-blog-start' WHERE slug = 'hello-world';
    -- second-post -> testing-listing-and-filtering
    UPDATE bloq_views SET slug = 'testing-listing-and-filtering' WHERE slug = 'second-post';
    -- setting-up-blog-series -> building-mdx-blog-system-nextjs-ai
    UPDATE bloq_views SET slug = 'building-mdx-blog-system-nextjs-ai' WHERE slug = 'setting-up-blog-series';
    -- building-last-visitor-feature -> building-real-time-last-visitor-feature
    UPDATE bloq_views SET slug = 'building-real-time-last-visitor-feature' WHERE slug = 'building-last-visitor-feature';
    -- bun-took-over-node -> fixing-bun-overriding-node-commands
    UPDATE bloq_views SET slug = 'fixing-bun-overriding-node-commands' WHERE slug = 'bun-took-over-node';
    -- ascii-interactive-keyboard-in-react -> interactive-ascii-keyboard-component-react
    UPDATE bloq_views SET slug = 'interactive-ascii-keyboard-component-react' WHERE slug = 'ascii-interactive-keyboard-in-react';
    -- view-counter-nextjs-supabase-postgres -> building-view-counter-nextjs-supabase
    UPDATE bloq_views SET slug = 'building-view-counter-nextjs-supabase' WHERE slug = 'view-counter-nextjs-supabase-postgres';
    -- vibe-shift-hackathon-notes-and-reflections -> vibe-shift-hackathon-ai-art-reflections
    UPDATE bloq_views SET slug = 'vibe-shift-hackathon-ai-art-reflections' WHERE slug = 'vibe-shift-hackathon-notes-and-reflections';
    -- react-memory-leaks-performance-experiments -> debugging-react-memory-leaks-performance-guide
    UPDATE bloq_views SET slug = 'debugging-react-memory-leaks-performance-guide' WHERE slug = 'react-memory-leaks-performance-experiments';
    -- architecture-was-already-there -> mapping-system-architecture-with-ai
    UPDATE bloq_views SET slug = 'mapping-system-architecture-with-ai' WHERE slug = 'architecture-was-already-there';
    -- the-skill-that-writes-itself -> agentic-writing-skills-ai-collaboration
    UPDATE bloq_views SET slug = 'agentic-writing-skills-ai-collaboration' WHERE slug = 'the-skill-that-writes-itself';
    -- metadata-that-matters -> nextjs-seo-optimization-metadata-jsonld
    UPDATE bloq_views SET slug = 'nextjs-seo-optimization-metadata-jsonld' WHERE slug = 'metadata-that-matters';
    -- spec-driven-claps -> spec-driven-development-clap-feature-nextjs
    UPDATE bloq_views SET slug = 'spec-driven-development-clap-feature-nextjs' WHERE slug = 'spec-driven-claps';
    -- i-added-an-rss-feed -> how-to-add-rss-feed-nextjs
    UPDATE bloq_views SET slug = 'how-to-add-rss-feed-nextjs' WHERE slug = 'i-added-an-rss-feed';
    -- orchestrating-agents -> multi-agent-orchestration-software-engineering
    UPDATE bloq_views SET slug = 'multi-agent-orchestration-software-engineering' WHERE slug = 'orchestrating-agents';
    -- the-bot-that-talks-to-my-database -> build-telegram-bot-interface-nextjs-database
    UPDATE bloq_views SET slug = 'build-telegram-bot-interface-nextjs-database' WHERE slug = 'the-bot-that-talks-to-my-database';
    -- when-not-to-unify -> api-architecture-when-to-unify-vs-separate
    UPDATE bloq_views SET slug = 'api-architecture-when-to-unify-vs-separate' WHERE slug = 'when-not-to-unify';
    -- when-z-index-lies -> fixing-css-stacking-context-z-index-issues
    UPDATE bloq_views SET slug = 'fixing-css-stacking-context-z-index-issues' WHERE slug = 'when-z-index-lies';
    -- blipincli -> build-interactive-nodejs-cli-typescript
    UPDATE bloq_views SET slug = 'build-interactive-nodejs-cli-typescript' WHERE slug = 'blipincli';
    -- vibing-your-way-into-a-wall -> lessons-learned-collaborating-with-ai-agents
    UPDATE bloq_views SET slug = 'lessons-learned-collaborating-with-ai-agents' WHERE slug = 'vibing-your-way-into-a-wall';
    -- danger-of-ai-fix-it-commands -> how-to-learn-from-ai-not-just-delegate
    UPDATE bloq_views SET slug = 'how-to-learn-from-ai-not-just-delegate' WHERE slug = 'danger-of-ai-fix-it-commands';

    -- Update claps table
    UPDATE claps SET post_id = 'hello-world-nextjs-blog-start' WHERE post_id = 'hello-world' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'testing-listing-and-filtering' WHERE post_id = 'second-post' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'building-mdx-blog-system-nextjs-ai' WHERE post_id = 'setting-up-blog-series' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'building-real-time-last-visitor-feature' WHERE post_id = 'building-last-visitor-feature' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'fixing-bun-overriding-node-commands' WHERE post_id = 'bun-took-over-node' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'interactive-ascii-keyboard-component-react' WHERE post_id = 'ascii-interactive-keyboard-in-react' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'building-view-counter-nextjs-supabase' WHERE post_id = 'view-counter-nextjs-supabase-postgres' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'vibe-shift-hackathon-ai-art-reflections' WHERE post_id = 'vibe-shift-hackathon-notes-and-reflections' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'debugging-react-memory-leaks-performance-guide' WHERE post_id = 'react-memory-leaks-performance-experiments' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'mapping-system-architecture-with-ai' WHERE post_id = 'architecture-was-already-there' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'agentic-writing-skills-ai-collaboration' WHERE post_id = 'the-skill-that-writes-itself' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'nextjs-seo-optimization-metadata-jsonld' WHERE post_id = 'metadata-that-matters' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'spec-driven-development-clap-feature-nextjs' WHERE post_id = 'spec-driven-claps' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'how-to-add-rss-feed-nextjs' WHERE post_id = 'i-added-an-rss-feed' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'multi-agent-orchestration-software-engineering' WHERE post_id = 'orchestrating-agents' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'build-telegram-bot-interface-nextjs-database' WHERE post_id = 'the-bot-that-talks-to-my-database' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'api-architecture-when-to-unify-vs-separate' WHERE post_id = 'when-not-to-unify' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'fixing-css-stacking-context-z-index-issues' WHERE post_id = 'when-z-index-lies' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'build-interactive-nodejs-cli-typescript' WHERE post_id = 'blipincli' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'lessons-learned-collaborating-with-ai-agents' WHERE post_id = 'vibing-your-way-into-a-wall' AND post_type = 'bloq';
    UPDATE claps SET post_id = 'how-to-learn-from-ai-not-just-delegate' WHERE post_id = 'danger-of-ai-fix-it-commands' AND post_type = 'bloq';
END $$;
