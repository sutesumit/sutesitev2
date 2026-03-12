export type { ClapsResult, ClapsService, PostType } from './ClapsService.interface';
export { ApiClapsService } from './ApiClapsService';
export { MAX_CLAPS } from './constants';

// Default service instance
import { ApiClapsService } from './ApiClapsService';
export const defaultClapsService = new ApiClapsService();
