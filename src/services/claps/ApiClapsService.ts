import { ClapsService, ClapsResult, PostType } from './ClapsService.interface';

/**
 * Claps service implementation using the API
 */
export class ApiClapsService implements ClapsService {
  async getClaps(postType: PostType, postId: string, fingerprint?: string): Promise<ClapsResult> {
    try {
      const url = fingerprint
        ? `/api/claps/${postType}/${postId}?fingerprint=${fingerprint}`
        : `/api/claps/${postType}/${postId}`;
        
      const res = await fetch(url, { method: 'GET', cache: 'no-store' });

      if (!res.ok) {
        return { userClaps: 0, totalClaps: 0, maxReached: false };
      }

      const data = await res.json();
      return {
        userClaps: data.userClaps ?? 0,
        totalClaps: data.claps ?? data.totalClaps ?? 0,
        maxReached: (data.userClaps ?? 0) >= 50,
      };
    } catch (error) {
      console.error('Error fetching claps:', error);
      return { userClaps: 0, totalClaps: 0, maxReached: false };
    }
  }

  async incrementClap(postType: PostType, postId: string, fingerprint: string): Promise<ClapsResult> {
    try {
      const res = await fetch(`/api/claps/${postType}/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint }),
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error('Failed to increment clap');
      }

      const data = await res.json();
      return {
        userClaps: data.userClaps,
        totalClaps: data.totalClaps,
        maxReached: data.maxReached,
      };
    } catch (error) {
      console.error('Error sending clap:', error);
      throw error;
    }
  }
}
