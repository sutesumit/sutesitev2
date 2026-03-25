"use client";

import ScrambleText from "@/components/shared/ScrambleText";
import { Eye, EyeClosed } from "lucide-react";
import { useState, useEffect } from "react";

type ContentType = 'bloq' | 'byte' | 'blip' | 'project';

interface ViewCounterProps {
    type: ContentType;
    identifier: string;
    className?: string;
}

const apiPaths: Record<ContentType, (id: string) => string> = {
    bloq: (id) => `/api/views?type=bloq&id=${id}`,
    byte: (id) => `/api/views?type=byte&id=${id}`,
    blip: (id) => `/api/views?type=blip&id=${id}`,
    project: (id) => `/api/views?type=project&id=${id}`,
};

export default function ViewCounter({ type, identifier, className }: ViewCounterProps) {
    const [views, setViews] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
    
        const fetchView = async () => {
            try {
                const res = await fetch(apiPaths[type](identifier), {
                    method: 'GET',
                    cache: 'no-store',
                });

                if (cancelled) return;

                if (res.ok) {
                    const { views: v } = await res.json();
                    setViews(v ?? 0);
                } else {
                    setViews(0)
                }
            } catch (error) {
                console.error('Error in fetching views count', error)
                if (!cancelled) setViews(0);
            }
        }
        fetchView();
        return () => { cancelled = true }
    }, [type, identifier]);

    const formattedViewsCount = views === null ? 'xxx' : views.toString().padStart(3, '0')

    const BlinkingEye = () => {
        return (
            <div className="relative w-4 h-4 mr-1">
                <Eye
                    className="
                        absolute inset-0
                        w-4 h-4 inline-block
                        animate-[blink-open_4s_infinite] 
                    "
                />
                <EyeClosed
                    className="
                        absolute inset-0
                        w-4 h-4 flex self-center
                        animate-[blink-closed_4s_infinite]
                    "
                />
            </div>
        );
    };

    return (
        <span className={className} aria-label={views !== null ? `${views} views` : 'Loading view count...'}>
            <BlinkingEye />
            <ScrambleText text={formattedViewsCount} />
        </span>
    )
}
