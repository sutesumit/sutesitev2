import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getBlips } from "@/lib/glossary";
import BlipCard from "./components/BlipCard";
import IntroCard from "./components/IntroCard";
import IntroText from "./components/IntroText";
import BlipModal from "./components/BlipModal";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'blip',
  description: 'glossary of terms and definitions from sumit sute',
  alternates: {
    canonical: 'https://sumitsute.com/blip',
  },
};

const BlipPage = async () => {
  const blips = await getBlips();

  return (
    <div className="container flex flex-col py-10 px-2 sm:px-0 font-roboto-mono lowercase">
      <IntroCard>
        <IntroText />
      </IntroCard>
      
      <div className="mt-2">
        {blips.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-600">
            no glossary entries yet...
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
    </div>
  );
};

export default BlipPage;
