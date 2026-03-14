import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getBytes } from "@/lib/byte";
import ByteCard from "./components/ByteCard";
import IntroCard from "./components/IntroCard";
import IntroText from "./components/IntroText";
import ByteModal from "./components/ByteModal";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'byte',
  description: 'short thoughts, updates, and quick notes from sumit sute',
  alternates: {
    canonical: 'https://sumitsute.com/byte',
  },
};

const BytePage = async () => {
  const bytes = await getBytes();

  return (
    <div className="container flex flex-col py-10 px-2 sm:px-0 font-roboto-mono lowercase">
      <IntroCard>
        <IntroText />
      </IntroCard>
      
      <div className="mt-2">
        {bytes.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-600">
            no bytes yet...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {bytes.map((byte) => (
              <ByteCard key={byte.id} byte={byte} />
            ))}
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        <ByteModal bytes={bytes} />
      </Suspense>
    </div>
  );
};

export default BytePage;
