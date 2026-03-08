'use client'

import React from "react";
import type { Blip } from "@/types/blip";
import { cn } from "@/lib/utils";
import { motion as m } from "framer-motion";
import { BloqBackground } from "@/app/bloq/components/BloqCard/parts";
import ClapsCounter from "@/components/shared/ClapsCounter";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const openModal = () => {
    router.push(`/blip?blip=${blip.blip_serial}`, { scroll: false });
  };

  return (
    <m.article
      id={`blip-${blip.id}`}
      layout
      role="article"
      initial="rest"
      whileHover="hover"
      animate="rest"
      onClick={openModal}
      className={cn(
        "relative p-1 sm:p-3 overflow-hidden rounded-md border-l-[1px] border-l-blue-500 !border-l-solid cursor-pointer",
        className
      )}
    >
      <BloqBackground />
      
      <m.div layout className="flex items-start gap-2">
        <div className="flex items-center justify-end w-10 h-6 pr-2 shrink-0 border-r-[1px] border-r-blue-500 !border-l-solid opacity-50">
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            {blip.blip_serial}
          </span>
        </div>
        <p className="text-slate-800 dark:text-slate-200 leading-relaxed flex-1">
          {blip.content}
          <span className="inline-flex items-center gap-2 ml-2 align-middle">
            <time className="text-xs text-slate-400 dark:text-slate-600 whitespace-nowrap">
              {formatRelativeTime(blip.created_at)}
            </time>
            <ClapsCounter 
              postId={blip.id} 
              postType="blip" 
              interactive={true}
              className="text-xs opacity-80"
            />
          </span>
        </p>
      </m.div>
    </m.article>
  );
};

export default BlipCard;
