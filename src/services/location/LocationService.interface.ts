import type { LocationData } from '@/types/location';

/**
 * Re-export LocationData from types for convenience
 */
export type { LocationData } from '@/types/location';

/**
 * Interface for location services
 * Allows swapping providers without code changes
 */
export interface LocationService {
  fetchLocation(): Promise<LocationData | null>;
}
