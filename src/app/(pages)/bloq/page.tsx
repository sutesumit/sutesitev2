import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import IntroCard from '@/components/shared/IntroCard';
import IntroText from './components/IntroText';
import DryKeysQuest from './components/DryKeysQuest';
import BloqFeed from './components/BloqFeed';
import { getBloqPosts, getAllCategories, getAllTags } from '@/lib/bloq';
import { SITE_URL, pageMetadata } from '@/config/metadata';

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

const page = () => {
  const posts = getBloqPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

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
            allTags={tags} 
          />
        </Suspense>
      </div>
    </div>
  )
}

export default page