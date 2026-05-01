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

export interface ContributionMonthRequest {
  year: number;
  // Calendar month number (1-12).
  month: number;
}

export interface ContributionMonthResponse {
  year: number;
  // Calendar month number (1-12).
  month: number;
  monthKey: string;
  data: ContributionData;
}

export interface GitHubService {
  /**
   * Get contribution data for a given month and usernames
   */
  getContributionsForMonth(
    usernames: string[],
    request: ContributionMonthRequest
  ): Promise<ContributionMonthResponse>;
}
