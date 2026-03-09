"use client";
import React from 'react';
import dynamic from 'next/dynamic';

const CodeBlock = dynamic(
  () => import('./code-block').then((mod) => mod.CodeBlock),
  {
    loading: () => (
      <div className="relative w-full rounded-lg bg-slate-800 dark:bg-slate-900 p-4 font-mono text-sm mb-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/4 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
            <div className="h-3 bg-slate-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export { CodeBlock };
