'use client'

import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

type ContentType = 'bloq' | 'byte' | 'blip' | 'project';

interface TrackViewProps {
    type: ContentType;
    identifier: string;
}

export function useTrackView(type: ContentType, identifier: string) {
    const { trackBloqView, trackProjectView, trackBlipView, trackByteView } = useAnalytics();
    
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            return;
        }
        
        switch (type) {
            case 'bloq':
                trackBloqView(identifier);
                break;
            case 'project':
                trackProjectView(identifier);
                break;
            case 'blip':
                trackBlipView(identifier);
                break;
            case 'byte':
                trackByteView(identifier);
                break;
        }
    }, [type, identifier, trackBloqView, trackProjectView, trackBlipView, trackByteView])
}

export default function TrackView({ type, identifier }: TrackViewProps) {
    useTrackView(type, identifier)
    return null
}
