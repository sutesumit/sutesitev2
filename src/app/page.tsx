"use client";
import React from "react";
import dynamic from "next/dynamic";
import ScrambleText from "@/components/shared/ScrambleText";
import { useVisitorLocation } from "@/hooks/useVisitorLocation";
import { BioSection } from "@/components/home/BioSection";
import { ProjectList } from "@/components/home/ProjectList";

const SeedingPlant = dynamic(
  () => import("../components/specific/SeedingPlant"),
  {
    ssr: false,
  }
);

export default function Home() {
  const visitorLocation = useVisitorLocation();
  
  return (
    <article className="p-10 container min-h-screen flex flex-col justify-center font-roboto-mono lowercase">
      <div className="">
        <div className="flex">
          <span>Hello <ScrambleText text={visitorLocation} className="text-blue-500 dark:text-blue-400"/>. Sumit Sute here.</span>
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
