"use client";
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useCurrentVisitorLocation } from '@/hooks/useCurrentVisitorLocation';
import type { LocationData } from '@/types/location';

interface VisitorData {
  lastVisitorLocation: string | null;
  lastVisitTime: string | null;
  visitorCount: number | null;
}

const VisitorDataContext = createContext<VisitorData>({
  lastVisitorLocation: null,
  lastVisitTime: null,
  visitorCount: null,
});

export const useVisitorData = () => useContext(VisitorDataContext);

interface VisitorAnalyticsProps {
  children: React.ReactNode;
}

export const VisitorAnalytics: React.FC<VisitorAnalyticsProps> = ({ children }) => {
  const { locationData } = useCurrentVisitorLocation();
  const [visitorData, setVisitorData] = useState<VisitorData>({
    lastVisitorLocation: null,
    lastVisitTime: null,
    visitorCount: null,
  });
  const hasTrackedVisit = useRef(false);

  const trackSiteVisit = useCallback(async (currentLocation: LocationData | null) => {
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    if (hasTrackedVisit.current) return;
    hasTrackedVisit.current = true;

    try {
      const response = await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentLocation || {}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVisitorData({
        lastVisitorLocation: data.lastVisitorLocation ?? null,
        lastVisitTime: data.lastVisitTime ?? null,
        visitorCount: typeof data.visitorCount === 'number' ? data.visitorCount : null,
      });
    } catch (error) {
      console.warn('Unable to track site visit:', error instanceof Error ? error.message : 'Unknown error');
    }
  }, []);

  useEffect(() => {
    trackSiteVisit(locationData);
  }, [locationData, trackSiteVisit]);

  return (
    <VisitorDataContext.Provider value={visitorData}>
      {children}
    </VisitorDataContext.Provider>
  );
};
