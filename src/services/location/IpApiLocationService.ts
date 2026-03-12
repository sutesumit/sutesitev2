import { LocationService } from './LocationService.interface';
import type { LocationData } from '@/types/location';

export class IpApiLocationService implements LocationService {
  private baseUrl: string;

  constructor(baseUrl = 'https://ipapi.co/json/') {
    this.baseUrl = baseUrl;
  }

  async fetchLocation(): Promise<LocationData | null> {
    try {
      const response = await fetch(this.baseUrl);
      
      if (!response.ok) {
        console.warn(`Location API error: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.warn('ipapi.co error:', data.reason || data.error);
        return null;
      }

      return data as LocationData;
    } catch (error) {
      console.warn('Unable to fetch location:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }
}
