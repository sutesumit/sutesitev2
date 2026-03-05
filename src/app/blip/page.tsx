import React from "react";
import { getBlips } from "@/lib/blip";
import BlipCard from "./components/BlipCard";
import IntroCard from "./components/IntroCard";
import IntroText from "./components/IntroText";

export const dynamic = 'force-dynamic';

const BlipPage = async () => {
  const blips = await getBlips();

  return (
    <div className="container flex flex-col pb-12 p-10 font-roboto-mono lowercase">
      <div className='page-title mb-2'>
        <p className="font-bold">blip</p>
      </div>
      <IntroCard>
        <IntroText />
      </IntroCard>
      
      <div className="mt-2">
        {blips.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-600">
            no blips yet...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {blips.map((blip) => (
              <BlipCard key={blip.id} blip={blip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlipPage;
