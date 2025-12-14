'use client'
import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export function useTrackView(slug: string) {
    const { trackBloqView } = useAnalytics();
    
    useEffect(() => {
        trackBloqView(slug);
    }, [slug, trackBloqView])
}

export default function TrackView({ slug } : { slug: string}){
    useTrackView(slug)
    return null
}