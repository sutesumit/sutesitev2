"use client";

import React from "react";
import Link from "next/link";

import type { BloqPost } from "@/lib/bloq";
import type { Blip } from "@/types/blip";
import type { Byte } from "@/types/byte";
import ScrambleText from "@/components/shared/ScrambleText";
import { useCurrentVisitorLocation } from "@/hooks/useCurrentVisitorLocation";
import { BioSection } from "@/components/home/BioSection";
import { ProjectList } from "@/components/home/ProjectList";
import SeedingPlant from "@/components/specific/SeedingPlant";
import { LatestUpdates } from "@/components/home/LatestUpdates";

type HomeContentProps = {
  latestBloq: BloqPost | null;
  latestByte: Byte | null;
  latestBlip: Blip | null;
};

export function HomeContent({
  latestBloq,
  latestByte,
  latestBlip,
}: HomeContentProps) {
  const { locationString } = useCurrentVisitorLocation();

  return (
    <article className="p-10 container min-h-screen flex flex-col justify-center font-roboto-mono lowercase">
      <div className="">
        <div className="flex">
          <span>Hello <ScrambleText text={locationString} className="text-blue-500 dark:text-blue-400" />. Sumit Sute here.</span>
          <SeedingPlant />
        </div>
        <br />
        <BioSection />
        <br />
        <p>
          This is an accidental open notebook of an engineer thinking out loud. Stray thoughts become <Link className="highlight" href="/byte">bytes</Link>, keeper concepts become <Link className="highlight" href="/blip">blips</Link>, and long arguments with agents become <Link className="highlight" href="/bloq">bloqs</Link>. Just varied forms of leaving breadcrumbs so I don&apos;t have to learn the same lesson twice.
        </p>
        <br />
        <LatestUpdates
          latestBloq={latestBloq}
          latestByte={latestByte}
          latestBlip={latestBlip}
        />
        <br />
          <ProjectList />
        <br />
        <br />
      </div>
    </article>
  );
}
