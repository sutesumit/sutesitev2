"use client";

import { useState, useRef, useCallback } from 'react';
import { LocationData } from '@/types/location';

export const useAnalytics = () => {
    // State for the UI to display (sourced from the visit API response)
    const [lastVisitorLocation, setLastVisitorLocation] = useState<string | null>(null);
    const [visitorCount, setVisitorCount] = useState<number | null>(null);

    // Refs to prevent duplicate tracking in React Strict Mode or persistent layouts
    const hasTrackedVisit = useRef(false);
    const hasTrackedView = useRef(false);

    /**
     * Tracks a generic site visit.
     * intended for use in the Footer or global layout.
     */
    const trackSiteVisit = useCallback(async (currentLocation: LocationData | null) => {
        // 1. Development Mode Protection
        if (process.env.NODE_ENV === 'development') {
            console.log('[Analytics] Site visit tracking skipped (Development Mode)');
            return;
        }

        // 2. Strict Mode / Duplicate Protection
        if (hasTrackedVisit.current) return;
        hasTrackedVisit.current = true;

        try {
            const response = await fetch('/api/visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentLocation || {}),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.lastVisitorLocation) {
                setLastVisitorLocation(data.lastVisitorLocation);
            }
            if (typeof data.visitorCount === 'number') {
                setVisitorCount(data.visitorCount);
            }

        } catch (error) {
            console.warn('Unable to track site visit:', error instanceof Error ? error.message : 'Unknown error');
        }
    }, []);

    /**
     * Tracks a specific blog post view.
     * Intended for use in individual blog post pages.
     */
    const trackBloqView = useCallback(async (slug: string) => {
        // 1. Development Mode Protection
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] Blog view tracking skipped for "${slug}" (Development Mode)`);
            return;
        }

        // 2. Strict Mode / Duplicate Protection
        if (hasTrackedView.current) return;
        hasTrackedView.current = true;

        try {
            await fetch(`/api/bloq/views/${slug}`, {
                method: 'POST',
                cache: 'no-store',
            });
        } catch (error) {
            console.warn(`Unable to track view for ${slug}:`, error instanceof Error ? error.message : 'Unknown error');
        }
    }, []);

    return {
        visitorData: { lastVisitorLocation, visitorCount },
        trackSiteVisit,
        trackBloqView
    };
};
