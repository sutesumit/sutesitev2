import type { Metadata } from 'next';

import { Suspense } from 'react';
import { HomeContent } from "@/components/home/HomeContent";
import { SITE_URL, pageMetadata } from '@/config/metadata';
import { LatestUpdates } from '@/components/home/LatestUpdates';
import { LatestUpdatesSkeleton } from '@/components/home/LatestUpdatesSkeleton';

const { home } = pageMetadata;

export const metadata: Metadata = {
  title: home.title,
  description: home.description,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: home.ogTitle,
    description: home.ogDescription,
  },
  twitter: {
    title: home.ogTitle,
    description: home.ogDescription,
  },
};

export default async function Home() {
  return (
    <HomeContent>
      <Suspense fallback={<LatestUpdatesSkeleton />}>
        <LatestUpdates />
      </Suspense>
    </HomeContent>
  );
}
