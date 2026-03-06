"use client";

import ScrambleText from "@/components/shared/ScrambleText";
import { PiHandsClapping } from "react-icons/pi";
import { motion } from "framer-motion";
import { useClaps } from "@/hooks/useClaps";
import { cn } from "@/lib/utils";

type PostType = 'bloq' | 'blip';

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
            whileTap={interactive && !maxReached ? { scale: 0.9 } : undefined}
            className={cn(
                "inline-flex items-center gap-0.5 transition-colors p-1",
                interactive && !maxReached && "cursor-pointer blue-border hover:bg-blue-100 hover:text-blue-500 dark:hover:bg-blue-900 dark:hover:text-blue-400",
                maxReached && "cursor-default opacity-50",
                !interactive && "cursor-default",
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
