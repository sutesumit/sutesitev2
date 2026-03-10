"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { getOrCreateFingerprint } from '@/lib/utils/fingerprint';
import { defaultClapsService } from '@/services/claps';
import type { PostType } from '@/services/claps';

const MAX_CLAPS = 50;

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
                const result = await defaultClapsService.getClaps(
                    postType, 
                    postId, 
                    fingerprintRef.current
                );
                setState({
                    totalClaps: result.totalClaps,
                    userClaps: result.userClaps,
                    maxReached: result.maxReached,
                    isLoading: false
                });
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
            const result = await defaultClapsService.incrementClap(
                postType, 
                postId, 
                fingerprintRef.current
            );
            setState({
                totalClaps: result.totalClaps,
                userClaps: result.userClaps,
                maxReached: result.maxReached,
                isLoading: false
            });
        } catch (error) {
            console.error('Error sending clap:', error);
            setState({
                userClaps: prevUserClaps,
                totalClaps: prevTotalClaps,
                maxReached: prevUserClaps >= MAX_CLAPS,
                isLoading: false
            });
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
