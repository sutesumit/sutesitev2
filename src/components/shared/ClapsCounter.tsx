"use client";

import ScrambleText from "@/components/shared/ScrambleText";
import { PiHandsClapping } from "react-icons/pi";
import { motion } from "framer-motion";
import { useClaps } from "@/hooks/useClaps";
import { cn } from "@/lib/utils";

type PostType = 'bloq' | 'blip' | 'project';

interface ClapsCounterProps {
    postId: string;
    postType: PostType;
    className?: string;
    interactive?: boolean;
}

export default function ClapsCounter({
    postId,
    postType,
    className,
    interactive = true
}: ClapsCounterProps) {
    const { totalClaps, isLoading, maxReached, clap } = useClaps(postId, postType);

    const formattedClapsCount = isLoading
        ? 'xxx'
        : totalClaps.toString().padStart(3, '0');

    const handleClick = (e: React.MouseEvent) => {
        if (!interactive || maxReached) return;
        e.preventDefault();
        e.stopPropagation();
        clap();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!interactive || maxReached) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            clap();
        }
    };

    return (
        <motion.button
            type="button"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            disabled={!interactive || maxReached}
            whileTap={interactive && !maxReached ? { scale: 0.95 } : undefined}
            className={cn(
                "inline-flex items-center gap-1.5 transition-all duration-300 p-1.5 px-2 rounded-md border text-xs",
                interactive && !maxReached ? 
                    "cursor-pointer border-blue-500/50 bg-blue-50 dark:bg-blue-950/40 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-500 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 hover:shadow-sm hover:-translate-y-0.5" :
                    "cursor-default border-transparent bg-transparent",
                className
            )}
            aria-label={isLoading ? 'Loading claps count...' : `${totalClaps} claps${maxReached ? ' (max reached)' : ''}`}
        >
            <PiHandsClapping className="w-4 h-4" />
            <ScrambleText
                text={formattedClapsCount}
                className="font-mono tabular-nums"
            />
        </motion.button>
    );
}
