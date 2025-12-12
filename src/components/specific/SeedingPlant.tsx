"use client";

import dynamic from "next/dynamic";

const SeedingPlant = dynamic(() => import("./SeedingPlantContent"), {
  ssr: false,
});

export default SeedingPlant;
