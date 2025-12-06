import { useState, useEffect } from 'react';
import { LocationData } from '@/types/location';

export const useCurrentVisitorLocation = () => {
  const [locationString, setLocationString] = useState('world');
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if we got rate limited
        if (data.error) {
          console.warn('ipapi.co error:', data.reason || data.error);
          return;
        }
        
        setLocationData(data);
        if (data.city && data.country_code) {
          setLocationString(`${data.city}, ${data.country_code}`);
        } else if (data.country_code) {
          setLocationString(`${data.country_code}`);
        }
      } catch (error) {
        console.warn('Unable to fetch location data:', error instanceof Error ? error.message : 'Unknown error');
        // Keep default 'world' location on error
      }
    };

    fetchLocation();
  }, []);

  return { locationString, locationData };
};