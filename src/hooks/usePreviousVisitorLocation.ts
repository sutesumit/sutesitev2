"use client";
import { useState, useEffect } from 'react';
import { LocationData } from '@/types/location';

export const usePreviousVisitorLocation = (currentVisitorData: LocationData | null) => {
  const [previousLocation, setPreviousLocation] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreviousVisitor = async () => {
      try {
        const response = await fetch('/api/visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentVisitorData || {}),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.lastVisitorLocation) {
          setPreviousLocation(data.lastVisitorLocation);
        }
      } catch (error) {
        console.warn('Unable to fetch previous visitor:', error instanceof Error ? error.message : 'Unknown error');
      }
    };

    fetchPreviousVisitor();
  }, [currentVisitorData]);

  return { previousVisit: previousLocation };
};
