import { useState, useEffect } from 'react';
import { getCachedLocationData } from '@/services/location/cache';
import type { LocationData } from '@/types/location';

interface UseLocationResult {
  locationString: string;
  locationData: LocationData | null;
}

export const useLocation = (): UseLocationResult => {
  const [locationString, setLocationString] = useState('world');
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchLocation = async () => {
      const data = await getCachedLocationData();
      
      if (!data || cancelled) {
        return;
      }

      setLocationData(data);
      if (data.city && data.country_code) {
        setLocationString(`${data.city}, ${data.country_code}`);
      } else if (data.country_code) {
        setLocationString(data.country_code);
      }
    };

    fetchLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  return { locationString, locationData };
};

export default useLocation;
