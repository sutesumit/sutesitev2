import { LocationService } from './LocationService.interface';
import type { LocationData } from '@/types/location';

/**
 * Location service implementation using ipapi.co
 */
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
      
      // Check for rate limiting
      if (data.error) {
        console.warn('ipapi.co error:', data.reason || data.error);
        return null;
      }
      
      // Return the full response as LocationData
      return data as LocationData;
    } catch (error) {
      console.warn('Unable to fetch location:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }
}
