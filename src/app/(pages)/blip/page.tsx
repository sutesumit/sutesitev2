import React, { Suspense } from "react";
import type { Metadata } from "next";

import PaginationControls from "@/components/shared/PaginationControls";
import IntroCard from '@/components/shared/IntroCard';
import { buildStaticMetadata } from '@/lib/metadata/builders';
import { buildBlipIndexSchema, renderJsonLd } from '@/lib/metadata/schema';
import { getAllBlipTags, getBlips } from "@/lib/blip";

import BlipCard from "./components/BlipCard";
import IntroText from "./components/IntroText";
import BlipModal from "./components/BlipModal";
import BlipFilterPanel from "./components/BlipFilterPanel";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildStaticMetadata('blip');

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const BlipPage = async (props: Props) => {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const tags = typeof searchParams.tags === 'string' ? searchParams.tags.split(',') : undefined;

  const { data: blips, pagination } = await getBlips(page, 10, searchQuery, tags);
  const allTags = await getAllBlipTags();

  return (
    <div className="container flex flex-col py-10 px-2 sm:px-0 font-roboto-mono lowercase">
      {renderJsonLd(buildBlipIndexSchema())}
      <IntroCard>
        <IntroText />
      </IntroCard>

      <div className="mt-2">
        <BlipFilterPanel
          allTags={allTags}
          initialSearchQuery={searchQuery}
          initialTags={tags}
        />
      </div>

      <div className="mt-2">
        {blips.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-600">
            {searchQuery || (tags && tags.length > 0)
              ? `no blip entries found for "${searchQuery || tags?.join(', ')}"...`
              : 'no blip entries yet...'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {blips.map((blip) => (
              <BlipCard key={blip.id} blip={blip} pageNumber={page} />
            ))}
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        <BlipModal blips={blips} pageNumber={page} />
      </Suspense>

      <PaginationControls
        pagination={pagination}
        basePath="/blip"
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default BlipPage;
