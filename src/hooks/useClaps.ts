"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

const FINGERPRINT_KEY = 'clap_fingerprint';
const MAX_CLAPS = 50;

type PostType = 'bloq' | 'blip';

/**
 * Get or create a persistent fingerprint for this browser
 */
function getOrCreateFingerprint(): string {
    if (typeof window === 'undefined') return '';

    let fingerprint = localStorage.getItem(FINGERPRINT_KEY);

    if (!fingerprint) {
        fingerprint = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        localStorage.setItem(FINGERPRINT_KEY, fingerprint);
    }

    return fingerprint;
}

interface ClapsState {
    totalClaps: number;
    userClaps: number;
    isLoading: boolean;
    maxReached: boolean;
}

export const useClaps = (postId: string, postType: PostType) => {
    const [state, setState] = useState<ClapsState>({
        totalClaps: 0,
        userClaps: 0,
        isLoading: true,
        maxReached: false
    });

    const fingerprintRef = useRef<string>('');
    const lastFetchedId = useRef<string | null>(null);

    useEffect(() => {
        if (lastFetchedId.current === postId) return;
        lastFetchedId.current = postId;
        
        setState(prev => ({ ...prev, isLoading: true }));

        fingerprintRef.current = getOrCreateFingerprint();

        const fetchClaps = async () => {
            try {
                const res = await fetch(
                    `/api/claps/${postType}/${postId}?fingerprint=${fingerprintRef.current}`,
                    { method: 'GET', cache: 'no-store' }
                );

                if (res.ok) {
                    const data = await res.json();
                    setState(prev => ({
                        ...prev,
                        totalClaps: data.claps ?? 0,
                        userClaps: data.userClaps ?? 0,
                        maxReached: (data.userClaps ?? 0) >= MAX_CLAPS,
                        isLoading: false
                    }));
                } else {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (error) {
                console.error('Error fetching claps:', error);
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchClaps();
    }, [postId, postType]);

    const clap = useCallback(async () => {
        if (state.maxReached || state.isLoading) return;

        const prevUserClaps = state.userClaps;
        const prevTotalClaps = state.totalClaps;

        setState(prev => ({
            ...prev,
            userClaps: prev.userClaps + 1,
            totalClaps: prev.totalClaps + 1,
            maxReached: prev.userClaps + 1 >= MAX_CLAPS
        }));

        try {
            const res = await fetch(`/api/claps/${postType}/${postId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fingerprint: fingerprintRef.current }),
                cache: 'no-store'
            });

            if (res.ok) {
                const data = await res.json();
                setState(prev => ({
                    ...prev,
                    totalClaps: data.totalClaps,
                    userClaps: data.userClaps,
                    maxReached: data.maxReached
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    userClaps: prevUserClaps,
                    totalClaps: prevTotalClaps,
                    maxReached: prevUserClaps >= MAX_CLAPS
                }));
            }
        } catch (error) {
            console.error('Error sending clap:', error);
            setState(prev => ({
                ...prev,
                userClaps: prevUserClaps,
                totalClaps: prevTotalClaps,
                maxReached: prevUserClaps >= MAX_CLAPS
            }));
        }
    }, [postId, postType, state.maxReached, state.isLoading, state.userClaps, state.totalClaps]);

    return {
        totalClaps: state.totalClaps,
        userClaps: state.userClaps,
        isLoading: state.isLoading,
        maxReached: state.maxReached,
        clap
    };
};

export default useClaps;
