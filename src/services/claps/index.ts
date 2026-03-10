export type { ClapsResult, ClapsService, PostType } from './ClapsService.interface';
export { ApiClapsService } from './ApiClapsService';

// Default service instance
import { ApiClapsService } from './ApiClapsService';
export const defaultClapsService = new ApiClapsService();
