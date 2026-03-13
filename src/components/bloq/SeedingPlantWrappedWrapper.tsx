"use client";
import React from 'react';
import dynamic from 'next/dynamic';

const SeedingPlantWrapped = dynamic(
  () => import('@/content/bloqs/2025/2025-12-12-interactive-ascii-keyboard-component-react/SeedingPlantWrapped').then(mod => ({ default: mod.SeedingPlantWrapped })),
  { ssr: false, loading: () => <div className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" /> }
);

export { SeedingPlantWrapped };
