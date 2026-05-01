import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import PaginationControls from '@/components/shared/PaginationControls';
import IntroCard from '@/components/shared/IntroCard';
import { buildStaticMetadata } from '@/lib/metadata/builders';
import { buildBloqIndexSchema, renderJsonLd } from '@/lib/metadata/schema';
import { getAllCategories, getAllTags, getBloqPosts, getBloqPostsPaginated, getFeaturedCount } from '@/lib/bloq';
import DryKeysQuest from '@/games/dry-keys-quest';

import BloqFeed from './components/BloqFeed';
import IntroText from './components/IntroText';

export const metadata: Metadata = buildStaticMetadata('bloq');

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const page = async (props: Props) => {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const featuredOnly = searchParams.featured === 'true';
  const tags = typeof searchParams.tags === 'string' ? searchParams.tags.split(',') : undefined;

  const { posts, pagination } = getBloqPostsPaginated(page, 10, {
    searchQuery,
    category,
    featuredOnly,
    tags: tags || undefined,
  });

  const categories = getAllCategories();
  const tagsList = getAllTags();
  const featuredCount = getFeaturedCount();

  return (
    <div className="container flex flex-col pb-10 px-2 sm:px-0">
      {renderJsonLd(buildBloqIndexSchema(getBloqPosts()))}
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
