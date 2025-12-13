import ScrambleText from "@/components/shared/ScrambleText";
import { EyeIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface ViewCounterProps {
    slug: string;
    className?: string;
}

export default function ViewCounter({ slug, className }: ViewCounterProps) {
    const [views, setViews] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
    
        const fetchView = async () => {
            try {
                const res = await fetch(`/api/bloq/views/${slug}`, {
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
    }, [slug]);

    const formattedViewsCount = views === null ? 'xxx' : views.toString().padStart(3, '0')

    return (
        <span className={className} aria-label={views !== null ? `${views} views` : 'Loading view count...'}>
            <EyeIcon className="w-4 h-4 inline-block mr-1" />
            <ScrambleText text={formattedViewsCount} />
        </span>
    )
}