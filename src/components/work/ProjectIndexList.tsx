"use client";

import React from "react";
import Link from "next/link";
import { motion as m } from "framer-motion";
import { CardBackground } from "@/components/shared/CardBackground";
import type { ProjectProps } from "@/data/projectlist";
import { cn } from "@/lib/utils";

interface ProjectIndexListProps {
  currentSlug: string;
  projects: ProjectProps[];
}

const ProjectIndexList: React.FC<ProjectIndexListProps> = ({
  currentSlug,
  projects,
}) => {
  return (
    <m.div
      className="project-list relative isolate p-4 blue-border bg-slate-50/5 dark:bg-slate-900/5 overflow-hidden"
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <CardBackground />
      <div className="flex items-center justify-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-4 mb-4">
        <Link href="/work" className="nav-tab py-1 px-3 text-sm">
          work
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 w-full max-w-2xl mx-auto px-4">
        {projects.map((p, index) => (
          <div
            key={index}
            className={cn(
              "project-item transition-all",
              p.slug === currentSlug
                ? "text-blue-900/40 dark:text-blue-400/40 cursor-default pointer-events-none"
                : "text-blue-900 dark:text-blue-400 hover:opacity-100 hover:translate-x-1"
            )}
          >
            <Link
              href={`/work/${p.slug}`}
              className="flex items-center gap-2"
            >
              <span>{p.title}</span>
            </Link>
          </div>
        ))}
      </div>
    </m.div>
  );
};

export default ProjectIndexList;
