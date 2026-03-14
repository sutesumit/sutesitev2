'use client'
import { useEffect } from "react";

export default function TrackView({ serial } : { serial: string }){
    useEffect(() => {
        fetch(`/api/byte/views/${serial}`, {
            method: 'POST',
        }).catch(console.error);
    }, [serial])
    return null
}
