export type { LocationData, LocationService } from './LocationService.interface';
export { IpApiLocationService } from './IpApiLocationService';

// Default service instance
import { IpApiLocationService } from './IpApiLocationService';
export const defaultLocationService = new IpApiLocationService();
