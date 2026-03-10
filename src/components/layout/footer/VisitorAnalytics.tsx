"use client";
import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useCurrentVisitorLocation } from '@/hooks/useCurrentVisitorLocation';

interface VisitorAnalyticsProps {
  children: React.ReactNode;
}

/**
 * Component that handles visitor tracking
 * Separates analytics logic from presentation
 */
export const VisitorAnalytics: React.FC<VisitorAnalyticsProps> = ({ children }) => {
  const { locationData } = useCurrentVisitorLocation();
  const { trackSiteVisit, visitorData } = useAnalytics();
  
  useEffect(() => {
    if (locationData) {
      trackSiteVisit(locationData);
    }
  }, [locationData, trackSiteVisit]);

  return children;
};

// Also export visitor data for consumers
export const useVisitorData = () => {
  const { visitorData } = useAnalytics();
  return visitorData;
};
