'use client'

import React from "react";
import type { Blip } from "@/types/blip";
import { cn } from "@/lib/utils";
import { motion as m } from "framer-motion";
import { BloqBackground } from "@/app/bloq/components/BloqCard/parts";
import ClapsCounter from "@/components/shared/ClapsCounter";

type BlipCardProps = {
  blip: Blip;
  className?: string;
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  }).toLowerCase();
}

const BlipCard = ({ blip, className }: BlipCardProps) => {
  return (
    <m.article
      layout
      role="article"
      initial="rest"
      whileHover="hover"
      animate="rest"
      className={cn(
        "relative p-3 overflow-hidden rounded-md border-l-[1px] border-l-blue-500 !border-l-solid cursor-default",
        className
      )}
    >
      <BloqBackground />
      
      <m.div layout className="flex items-start gap-4 px-2">
        <p className="text-slate-800 dark:text-slate-200 leading-relaxed flex-1">
          {blip.content}
        </p>
        <div className="flex items-center gap-3 shrink-0 pt-0.5">
          <time className="text-xs text-slate-400 dark:text-slate-600">
            {formatRelativeTime(blip.created_at)}
          </time>
          <ClapsCounter 
            postId={blip.id} 
            postType="blip" 
            interactive={true} 
            className="text-xs text-slate-400 dark:text-slate-600"
          />
        </div>
      </m.div>
    </m.article>
  );
};

export default BlipCard;
