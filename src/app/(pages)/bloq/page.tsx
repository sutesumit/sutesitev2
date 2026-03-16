import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import IntroCard from '@/components/shared/IntroCard';
import IntroText from './components/IntroText';
import DryKeysQuest from '@/games/dry-keys-quest';
import BloqFeed from './components/BloqFeed';
import { getBloqPostsPaginated, getAllCategories, getAllTags } from '@/lib/bloq';
import { SITE_URL, pageMetadata } from '@/config/metadata';
import PaginationControls from '@/components/shared/PaginationControls';

const { bloq } = pageMetadata;

export const metadata: Metadata = {
  title: bloq.title,
  description: bloq.description,
  alternates: { canonical: `${SITE_URL}/bloq` },
  openGraph: {
    title: bloq.ogTitle,
    description: bloq.ogDescription,
  },
  twitter: {
    title: bloq.ogTitle,
    description: bloq.ogDescription,
  },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const page = async (props: Props) => {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const tags = typeof searchParams.tags === 'string' ? searchParams.tags.split(',') : undefined;

  const { posts, pagination } = getBloqPostsPaginated(page, 10, {
    searchQuery,
    category,
    tags: tags || undefined,
  });
  
  const categories = getAllCategories();
  const tagsList = getAllTags();

  return (
    <div className="container flex flex-col pb-10 px-2 sm:px-0">
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
            pagination={pagination}
            currentFilters={{ category, tags: tags || [] }}
            initialSearchQuery={searchQuery}
          />
        </Suspense>
      </div>

      <PaginationControls 
        pagination={pagination}
        basePath="/bloq"
        searchQuery={searchQuery}
      />
    </div>
  )
}

export default page
