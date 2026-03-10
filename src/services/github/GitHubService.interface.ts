export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionData {
  [date: string]: number;
}

export interface GitHubService {
  /**
   * Get contribution data for given usernames
   */
  getContributions(usernames: string[]): Promise<ContributionData>;
}
