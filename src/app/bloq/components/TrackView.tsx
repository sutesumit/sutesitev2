'use client'
import { useEffect, useRef } from "react";

export function useTrackView(slug: string) {
    const hasTracked = useRef(false)

    useEffect(() => {
        if (hasTracked.current) return
        hasTracked.current = true
        
        fetch(`/api/bloq/views/${slug}`, {
            method: 'POST',
            cache: 'no-store',
        }).catch(console.error)
    }, [slug])
}

export default function TrackView({ slug } : { slug: string}){
    useTrackView(slug)
    return null
}