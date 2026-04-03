"use client";

import { useState, useRef, useCallback } from 'react';
import { getCachedLocationData } from '@/services/location/cache';
import { LocationData } from '@/types/location';

export const useAnalytics = () => {
    // State for the UI to display (sourced from the visit API response)
    const [lastVisitorLocation, setLastVisitorLocation] = useState<string | null>(null);
    const [visitorCount, setVisitorCount] = useState<number | null>(null);

    // Refs to prevent duplicate tracking in React Strict Mode or persistent layouts
    const hasTrackedVisit = useRef(false);
    const hasTrackedBloqView = useRef(false);
    const hasTrackedBlipView = useRef(false);
    const hasTrackedProjectView = useRef(false);
    const hasTrackedByteView = useRef(false);

    const buildTrackingRequestInit = useCallback(async (): Promise<RequestInit> => {
        const locationData = await getCachedLocationData();

        if (!locationData?.ip) {
            return { method: 'POST', cache: 'no-store' };
        }

        return {
            method: 'POST',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ip: locationData.ip }),
        };
    }, []);

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
        if (hasTrackedBloqView.current) return;
        hasTrackedBloqView.current = true;

        try {
            await fetch(`/api/views?type=bloq&id=${slug}`, await buildTrackingRequestInit());
        } catch (error) {
            console.warn(`Unable to track view for ${slug}:`, error instanceof Error ? error.message : 'Unknown error');
        }
    }, [buildTrackingRequestInit]);

    /**
     * Tracks a specific blip view.
     * Intended for use in individual blip pages.
     */
    const trackBlipView = useCallback(async (serial: string) => {
        // 1. Development Mode Protection
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] Blip view tracking skipped for "${serial}" (Development Mode)`);
            return;
        }

        // 2. Strict Mode / Duplicate Protection
        if (hasTrackedBlipView.current) return;
        hasTrackedBlipView.current = true;

        try {
            await fetch(`/api/views?type=blip&id=${serial}`, await buildTrackingRequestInit());
        } catch (error) {
            console.warn(`Unable to track view for blip ${serial}:`, error instanceof Error ? error.message : 'Unknown error');
        }
    }, [buildTrackingRequestInit]);

    /**
     * Tracks a specific project view.
     * Intended for use in individual project pages.
     */
    const trackProjectView = useCallback(async (slug: string) => {
        // 1. Development Mode Protection
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] Project view tracking skipped for "${slug}" (Development Mode)`);
            return;
        }

        // 2. Strict Mode / Duplicate Protection
        if (hasTrackedProjectView.current) return;
        hasTrackedProjectView.current = true;

        try {
            await fetch(`/api/views?type=project&id=${slug}`, await buildTrackingRequestInit());
        } catch (error) {
            console.warn(`Unable to track project view for ${slug}:`, error instanceof Error ? error.message : 'Unknown error');
        }
    }, [buildTrackingRequestInit]);

    /**
     * Tracks a specific byte view.
     * Intended for use in individual byte pages.
     */
    const trackByteView = useCallback(async (slug: string) => {
        // 1. Development Mode Protection
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] Byte view tracking skipped for "${slug}" (Development Mode)`);
            return;
        }

        // 2. Strict Mode / Duplicate Protection
        if (hasTrackedByteView.current) return;
        hasTrackedByteView.current = true;

        try {
            await fetch(`/api/views?type=byte&id=${slug}`, await buildTrackingRequestInit());
        } catch (error) {
            console.warn(`Unable to track view for byte ${slug}:`, error instanceof Error ? error.message : 'Unknown error');
        }
    }, [buildTrackingRequestInit]);

    return {
        visitorData: { lastVisitorLocation, visitorCount },
        trackSiteVisit,
        trackBloqView,
        trackBlipView,
        trackProjectView,
        trackByteView
    };
};
