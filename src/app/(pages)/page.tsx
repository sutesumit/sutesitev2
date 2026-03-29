import type { Metadata } from 'next';

import { Suspense } from 'react';

import { LatestUpdates } from '@/components/home/LatestUpdates';
import { LatestUpdatesSkeleton } from '@/components/home/LatestUpdatesSkeleton';
import { HomeContent } from "@/components/home/HomeContent";
import { buildStaticMetadata } from '@/lib/metadata/builders';
import { buildHomeSchema, renderJsonLd } from '@/lib/metadata/schema';

export const metadata: Metadata = buildStaticMetadata('home');

export default async function Home() {
  return (
    <>
      {renderJsonLd(buildHomeSchema())}
      <HomeContent>
        <Suspense fallback={<LatestUpdatesSkeleton />}>
          <LatestUpdates />
        </Suspense>
      </HomeContent>
    </>
  );
}
