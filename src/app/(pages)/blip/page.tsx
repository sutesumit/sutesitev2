import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getBlips } from "@/lib/glossary";
import BlipCard from "./components/BlipCard";
import IntroCard from '@/components/shared/IntroCard';
import IntroText from "./components/IntroText";
import BlipModal from "./components/BlipModal";
import SearchBar from "@/components/shared/SearchBar";
import PaginationControls from "@/components/shared/PaginationControls";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'blip',
  description: 'glossary of terms and definitions from sumit sute',
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
  
  const { data: blips, pagination } = await getBlips(page, 10, searchQuery);

  return (
    <div className="container flex flex-col py-10 px-2 sm:px-0 font-roboto-mono lowercase">
      <IntroCard>
        <IntroText />
      </IntroCard>

      <div className="mt-4 mb-4">
        <SearchBar 
          placeholder="Search glossary..." 
          initialValue={searchQuery}
          basePath="/blip"
        />
      </div>
      
      <div className="mt-2">
        {blips.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-600">
            {searchQuery ? `no glossary entries found for "${searchQuery}"...` : 'no glossary entries yet...'}
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
        <BlipModal blips={blips} />
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
