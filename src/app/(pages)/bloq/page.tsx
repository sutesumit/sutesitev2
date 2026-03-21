import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import IntroCard from '@/components/shared/IntroCard';
import IntroText from './components/IntroText';
import DryKeysQuest from '@/games/dry-keys-quest';
import BloqFeed from './components/BloqFeed';
import { getBloqPostsPaginated, getAllCategories, getAllTags, getBloqPosts } from '@/lib/bloq';
import { SITE_URL, SITE_NAME, SITE_AUTHOR, pageMetadata } from '@/config/metadata';
import PaginationControls from '@/components/shared/PaginationControls';

const { bloq } = pageMetadata;

export const metadata: Metadata = {
  title: bloq.title,
  description: bloq.description,
  alternates: { canonical: `${SITE_URL}/bloq` },
  openGraph: {
    title: bloq.ogTitle,
    description: bloq.ogDescription,
    url: `${SITE_URL}/bloq`,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: bloq.ogTitle,
    description: bloq.ogDescription,
  },
};

function BlogJsonLd() {
  const allPosts = getBloqPosts();
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog | Sumit Sute',
    description: bloq.description,
    url: `${SITE_URL}/bloq`,
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR,
      url: SITE_URL,
    },
    blogPost: allPosts.slice(0, 10).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${SITE_URL}/bloq/${post.url}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt || post.publishedAt,
      description: post.summary,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

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
      <BlogJsonLd />
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
