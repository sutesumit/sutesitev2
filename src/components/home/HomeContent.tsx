"use client";

import React from "react";
import Link from "next/link";

import ScrambleText from "@/components/shared/ScrambleText";
import { useCurrentVisitorLocation } from "@/hooks/useCurrentVisitorLocation";
import { BioSection } from "@/components/home/BioSection";
import { ProjectList } from "@/components/home/ProjectList";
import SeedingPlant from "@/components/specific/SeedingPlant";

type HomeContentProps = {
  children: React.ReactNode;
};

export function HomeContent({ children }: HomeContentProps) {
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
        {children}
        <br />
          <ProjectList />
        <br />
        <br />
      </div>
    </article>
  );
}
