import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getBlips, getAllBlipTags } from "@/lib/blip";
import BlipCard from "./components/BlipCard";
import IntroCard from '@/components/shared/IntroCard';
import IntroText from "./components/IntroText";
import BlipModal from "./components/BlipModal";
import BlipFilterPanel from "./components/BlipFilterPanel";
import PaginationControls from "@/components/shared/PaginationControls";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'blip',
  description: 'terms and definitions from sumit sute',
  alternates: {
    canonical: 'https://sumitsute.com/blip',
  },
};

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
              <BlipCard key={blip.id} blip={blip} />
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
