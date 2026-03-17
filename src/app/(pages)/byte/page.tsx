import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getBytes } from "@/lib/byte";
import ByteCard from "./components/ByteCard";
import IntroCard from '@/components/shared/IntroCard';
import IntroText from "./components/IntroText";
import ByteModal from "./components/ByteModal";
import SearchBar from "@/components/shared/SearchBar";
import PaginationControls from "@/components/shared/PaginationControls";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'byte',
  description: 'short thoughts, updates, and quick notes from sumit sute',
  alternates: {
    canonical: 'https://sumitsute.com/byte',
  },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const BytePage = async (props: Props) => {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  
  const { data: bytes, pagination } = await getBytes(page, 10, searchQuery);

  return (
    <div className="container flex flex-col py-10 px-2 sm:px-0 font-roboto-mono lowercase">
      <IntroCard>
        <IntroText />
      </IntroCard>

      <div className="mt-2 p-2 blue-border">
        <SearchBar 
          placeholder="Search bytes..." 
          initialValue={searchQuery}
          basePath="/byte"
        />
      </div>
      
      <div className="mt-2">
        {bytes.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-600">
            {searchQuery ? `no bytes found for "${searchQuery}"...` : 'no bytes yet...'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {bytes.map((byte) => (
              <ByteCard key={byte.id} byte={byte} pageNumber={page} />
            ))}
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        <ByteModal bytes={bytes} pageNumber={page} />
      </Suspense>

      <PaginationControls 
        pagination={pagination}
        basePath="/byte"
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default BytePage;
