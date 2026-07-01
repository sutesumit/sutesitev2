import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import PaginationControls from '@/components/shared/PaginationControls';
import IntroCard from '@/components/shared/IntroCard';
import { buildStaticMetadata } from '@/lib/metadata/builders';
import { buildBloqIndexSchema, renderJsonLd } from '@/lib/metadata/schema';
import { getAllCategories, getAllTags, getBloqPosts, getFeaturedCount, type BloqPost } from '@/lib/bloq';
import { liveSessionToBloqPost } from '@/lib/live-bloq';
import { listSessions } from '@/lib/live-bloq/repository';
import { searchBlogPosts } from '@/lib/search';
import { createPaginationInfo, normalizePage, normalizeSearchQuery } from '@/types/pagination';
import DryKeysQuest from '@/games/dry-keys-quest';

import BloqFeed from './components/BloqFeed';
import IntroText from './components/IntroText';

export const metadata: Metadata = buildStaticMetadata('bloq');

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const PAGE_SIZE = 10;

const page = async (props: Props) => {
  const searchParams = await props.searchParams;
  const page = normalizePage(searchParams.page, 1);
  const searchQuery = normalizeSearchQuery(searchParams.q);
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const featuredOnly = searchParams.featured === 'true';
  const tags = typeof searchParams.tags === 'string' ? searchParams.tags.split(',') : undefined;

  // Get static MDX posts
  const mdxPosts = getBloqPosts();

  // Get live sessions (active + closed, exclude cancelled) and convert to BloqPost
  const allSessions = await listSessions();
  const livePosts: BloqPost[] = allSessions
    .filter((s) => s.status !== 'cancelled')
    .map(liveSessionToBloqPost);

  // Merge and sort by date descending
  const allPosts: BloqPost[] = [...mdxPosts, ...livePosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Apply filters
  let filtered = allPosts;
  if (featuredOnly) {
    filtered = filtered.filter((p) => p.featured);
  }
  if (category) {
    filtered = filtered.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
  }
  if (tags && tags.length > 0) {
    const lowerTags = tags.map((t) => t.toLowerCase());
    filtered = filtered.filter((p) =>
      p.tags?.some((t) => lowerTags.includes(t.toLowerCase()))
    );
  }
  if (searchQuery) {
    filtered = searchBlogPosts(filtered, searchQuery);
  }

  // Paginate
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const from = (safePage - 1) * PAGE_SIZE;
  const posts = filtered.slice(from, from + PAGE_SIZE);
  const pagination = createPaginationInfo(safePage, PAGE_SIZE, total);

  const categories = getAllCategories(livePosts);
  const tagsList = getAllTags(livePosts);
  const featuredCount = getFeaturedCount(livePosts);

  return (
    <div className="container flex flex-col pb-10 px-2 sm:px-0">
      {renderJsonLd(buildBloqIndexSchema(allPosts))}
      <IntroCard className="mt-10">
        <DryKeysQuest />
        <IntroText />
      </IntroCard>

      <div className="mt-2">
        <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
          <BloqFeed
            initialPosts={posts}
            allCategories={categories}
            allTags={tagsList}
            featuredCount={featuredCount}
            pagination={pagination}
            currentFilters={{ category, tags: tags || [], featuredOnly }}
            initialSearchQuery={searchQuery}
          />
        </Suspense>
      </div>

      <PaginationControls
        pagination={pagination}
        basePath="/bloq"
        searchQuery={searchQuery}
        extraParams={{
          category,
          tags: tags?.join(','),
          featured: featuredOnly ? 'true' : undefined,
        }}
      />
    </div>
  );
};

export default page;
