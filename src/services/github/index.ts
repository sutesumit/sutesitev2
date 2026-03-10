export type { ContributionData, ContributionDay, ContributionWeek, GitHubService } from './GitHubService.interface';
export { GitHubGraphQLService } from './GitHubGraphQLService';

// Default service instance
import { GitHubGraphQLService } from './GitHubGraphQLService';
export const defaultGitHubService = new GitHubGraphQLService();
