"use client";
import { useState, useEffect } from 'react';
import { LocationData } from '@/types/location';

export const usePreviousVisitorLocation = (currentVisitorData: LocationData | null) => {
  const [previousLocation, setPreviousLocation] = useState<string | null>(null);

  useEffect(() => {
    if (!currentVisitorData) return;

    fetch('/api/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentVisitorData),
    })
      .then(res => res.json())
      .then(data => {
        if (data.lastVisitorLocation) {
          setPreviousLocation(data.lastVisitorLocation);
        }
      })
      .catch(err => console.error('Error fetching previous visitor:', err));
  }, [currentVisitorData]);

  return { previousVisit: previousLocation };
};
