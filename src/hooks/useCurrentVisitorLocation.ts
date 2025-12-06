import { useState, useEffect } from 'react';
import { LocationData } from '@/types/location';

export const useCurrentVisitorLocation = () => {
  const [locationString, setLocationString] = useState('world');
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        setLocationData(data);
        if (data.city && data.country_code) {
          setLocationString(`${data.city}, ${data.country_code}`);
        } else if (data.country_code) {
          setLocationString(`${data.country_code}`);
        }
      })
      .catch(error => {
        console.error('Error fetching location:', error);
      });
  }, []);

  return { locationString, locationData };
};