import { useState, useEffect } from 'react';
import { defaultLocationService } from '@/services/location';
import type { LocationData } from '@/types/location';

interface UseLocationResult {
  locationString: string;
  locationData: LocationData | null;
}

export const useLocation = (): UseLocationResult => {
  const [locationString, setLocationString] = useState('world');
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const data = await defaultLocationService.fetchLocation();
      
      if (data) {
        setLocationData(data);
        if (data.city && data.country_code) {
          setLocationString(`${data.city}, ${data.country_code}`);
        } else if (data.country_code) {
          setLocationString(data.country_code);
        }
      }
    };

    fetchLocation();
  }, []);

  return { locationString, locationData };
};

export default useLocation;
