'use client'

import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

type ContentType = 'bloq' | 'byte' | 'project';

interface TrackViewProps {
    type: ContentType;
    identifier: string;
}

export function useTrackView(type: ContentType, identifier: string) {
    const { trackBloqView, trackProjectView } = useAnalytics();
    
    useEffect(() => {
        if (type === 'bloq') {
            trackBloqView(identifier);
        } else if (type === 'project') {
            trackProjectView(identifier);
        }
    }, [type, identifier, trackBloqView, trackProjectView])
}

export default function TrackView({ type, identifier }: TrackViewProps) {
    useTrackView(type, identifier)

    useEffect(() => {
        if (type === 'byte') {
            fetch(`/api/byte/views/${identifier}`, {
                method: 'POST',
            }).catch(console.error);
        }
    }, [type, identifier])

    return null
}
