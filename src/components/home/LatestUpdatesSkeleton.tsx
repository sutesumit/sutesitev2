import React from "react";

export function LatestUpdatesSkeleton() {
  return (
    <>
      <p>latest logs:</p>
      <ul className="project-list text-blue-900 dark:text-blue-400">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="project-item flex items-center gap-2">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </li>
        ))}
      </ul>
    </>
  );
}
