'use client'
import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export function useTrackProjectView(slug: string) {
    const { trackProjectView } = useAnalytics();
    
    useEffect(() => {
        trackProjectView(slug);
    }, [slug, trackProjectView])
}

export default function TrackProjectView({ slug } : { slug: string}){
    useTrackProjectView(slug)
    return null
}
