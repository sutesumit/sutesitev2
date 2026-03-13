"use client";
import React from 'react';
import dynamic from 'next/dynamic';

const SeedingPlantASCII = dynamic(
  () => import("@/content/bloqs/2026/2026-02-18-vibe-shift-hackathon-ai-art-reflections/SeedingPlantASCII"),
  { ssr: false, loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" /> }
);

export default SeedingPlantASCII;
