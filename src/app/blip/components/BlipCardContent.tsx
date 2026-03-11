'use client'

import React from 'react';
import Link from 'next/link';
import { motion as m, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Undo2 } from 'lucide-react';
import type { Blip } from '@/types/blip';
import { BloqBackground } from '@/app/bloq/components/BloqCard/parts';
import ClapsCounter from '@/components/shared/ClapsCounter';

type BlipCardContentProps = {
  blip: Blip;
  newerBlip?: Blip | null;
  olderBlip?: Blip | null;
  isHovered: boolean;
  direction: number;
  showBackButton?: boolean;
  onCloseClick?: () => void;
  onNewerClick?: () => void;
  onOlderClick?: () => void;
  renderHeaderRight?: () => React.ReactNode;
};

export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).toLowerCase();
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 }),
};

const slideVariantsReverse = {
  enter: (dir: number) => ({ x: dir < 0 ? -50 : 50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 }),
};

const BlipCardContent = ({
  blip,
  newerBlip,
  olderBlip,
  isHovered,
  direction,
  showBackButton = false,
  onNewerClick,
  onOlderClick,
  renderHeaderRight,
}: BlipCardContentProps) => {
  const NewerButton = newerBlip ? (
    onNewerClick ? (
      <button
        onClick={(e) => { e.stopPropagation(); onNewerClick(); }}
        className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors p-1"
        aria-label="newer blip"
        title="newer blip"
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
      </button>
    ) : (
      <Link
        href={`/blip/${newerBlip.blip_serial}`}
        className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors p-1"
        aria-label="newer blip"
        title="newer blip"
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
      </Link>
    )
  ) : null;

  const OlderButton = olderBlip ? (
    onOlderClick ? (
      <button
        onClick={(e) => { e.stopPropagation(); onOlderClick(); }}
        className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors p-1"
        aria-label="older blip"
        title="older blip"
      >
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>
    ) : (
      <Link
        href={`/blip/${olderBlip.blip_serial}`}
        className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors p-1"
        aria-label="older blip"
        title="older blip"
      >
        <ChevronRight size={16} strokeWidth={1.5} />
      </Link>
    )
  ) : null;

  return (
    <>
      <m.div 
        className="absolute inset-0 rounded-md overflow-hidden pointer-events-none z-0"
        initial="rest"
        animate={isHovered ? "hover" : "rest"}
      >
        <BloqBackground />
      </m.div>

      <div className="relative z-10 flex flex-wrap items-center justify-around sm:justify-between px-4 py-2 gap-2 border-b border-slate-200 dark:border-slate-800">
        <AnimatePresence mode="popLayout" custom={direction}>
          <m.div
            key={blip.id}
            custom={direction}
            variants={slideVariantsReverse}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex items-center rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111] overflow-hidden shadow-sm text-xs"
          >
            <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300">blip</span>
            </div>
            <div className="px-2 py-0.5 flex items-center gap-1 bg-white dark:bg-[#0a0a0a]">
              <span className="text-slate-400 dark:text-slate-500 font-sans">#</span>
              <span className="font-mono !normal-case text-slate-600 dark:text-slate-400 tracking-wider">
                {blip.blip_serial}
              </span>
            </div>
          </m.div>
        </AnimatePresence>

        {renderHeaderRight ? renderHeaderRight() : showBackButton && (
          <Link href="/blip" className="flex shrink-0">
            <div className="inline-flex items-center blue-border rounded px-2 lowercase opacity-75 text-xs hover:bg-blue-100 hover:text-black dark:hover:bg-blue-900 dark:hover:text-white transition-colors duration-500">
              all blips{" "}
              <Undo2 className="opacity-75 p-1" />
            </div>
          </Link>
        )}
      </div>

      <div className="relative px-2 py-5 flex items-center min-h-40">
        <div className="hover:cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full shrink-0 flex justify-center">
          {NewerButton}
        </div>

        <div className="flex-1 overflow-hidden relative px-2">
          <AnimatePresence mode="popLayout" custom={direction}>
            <m.div
              key={blip.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
                {blip.content}
              </p>
            </m.div>
          </AnimatePresence>
        </div>

        <div className="hover:cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full shrink-0 flex justify-center">
          {OlderButton}
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-around sm:justify-between gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-800">
        <div className="relative overflow-hidden flex items-center">
          <AnimatePresence mode="popLayout" custom={direction}>
            <m.time
              key={blip.id}
              custom={direction}
              variants={slideVariantsReverse}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="text-xs text-left text-slate-400 dark:text-slate-600 block"
            >
              <Link 
                href={`/blip/${blip.blip_serial}`}
                className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {formatFullDate(blip.created_at)}
              </Link>
            </m.time>
          </AnimatePresence>
        </div>
        <ClapsCounter
          postId={blip.id}
          postType="blip"
          interactive={true}
          className="text-xs opacity-80"
        />
      </div>
    </>
  );
};

export default BlipCardContent;
