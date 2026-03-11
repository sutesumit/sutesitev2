import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getBlips } from "@/lib/blip";
import BlipCard from "./components/BlipCard";
import IntroCard from "./components/IntroCard";
import IntroText from "./components/IntroText";
import BlipModal from "./components/BlipModal";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'blip',
  description: 'short thoughts, updates, and quick notes from sumit sute',
  alternates: {
    canonical: 'https://sumitsute.com/blip',
  },
};

const BlipPage = async () => {
  const blips = await getBlips();

  return (
    <div className="container flex flex-col py-10 px-2 sm:px-0 font-roboto-mono lowercase">
      {/* <div className='page-title my-2'>
        <p className="font-bold">blip</p>
      </div> */}
      <IntroCard>
        <IntroText />
      </IntroCard>
      
      <div className="mt-2">
        {blips.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-600">
            no blips yet...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {blips.map((blip) => (
              <BlipCard key={blip.id} blip={blip} />
            ))}
          </div>
        )}
      </div>

      {/* Modal — must be wrapped in Suspense because it uses useSearchParams */}
      <Suspense fallback={null}>
        <BlipModal blips={blips} />
      </Suspense>
    </div>
  );
};

export default BlipPage;
