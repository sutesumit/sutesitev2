'use client'
import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export function useTrackBlipView(serial: string) {
    const { trackBlipView } = useAnalytics();
    
    useEffect(() => {
        trackBlipView(serial);
    }, [serial, trackBlipView])
}

export default function TrackView({ serial } : { serial: string }){
    useTrackBlipView(serial)
    return null
}
