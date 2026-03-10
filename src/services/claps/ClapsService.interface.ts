export type PostType = 'bloq' | 'blip';

export interface ClapsResult {
  userClaps: number;
  totalClaps: number;
  maxReached: boolean;
}

export interface ClapsService {
  /**
   * Get clap counts for a post
   */
  getClaps(postType: PostType, postId: string, fingerprint?: string): Promise<ClapsResult>;
  
  /**
   * Increment clap count for a post
   */
  incrementClap(postType: PostType, postId: string, fingerprint: string): Promise<ClapsResult>;
}
