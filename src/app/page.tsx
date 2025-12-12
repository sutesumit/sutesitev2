"use client";
import React from "react";

import ScrambleText from "@/components/shared/ScrambleText";
import { useCurrentVisitorLocation } from "@/hooks/useCurrentVisitorLocation";
import { BioSection } from "@/components/home/BioSection";
import { ProjectList } from "@/components/home/ProjectList";
import SeedingPlant from "../components/specific/SeedingPlant";

export default function Home() {
  const { locationString } = useCurrentVisitorLocation();
  
  return (
    <article className="p-10 container min-h-screen flex flex-col justify-center font-roboto-mono lowercase">
      <div className="">
        <div className="flex">
          <span>Hello <ScrambleText text={locationString} className="text-blue-500 dark:text-blue-400"/>. Sumit Sute here.</span>
          <SeedingPlant />
        </div>
        <br />
        <BioSection />
        <br />
        <ProjectList />
        <br />
      </div>
    </article>
  );
}
