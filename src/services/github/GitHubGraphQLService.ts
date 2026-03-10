import { GitHubService, ContributionData, ContributionDay, ContributionWeek } from './GitHubService.interface';

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';

interface GitHubUser {
  contributionsCollection: {
    contributionCalendar: {
      weeks: ContributionWeek[];
    };
  };
}

/**
 * Generates a dynamic GraphQL query based on the number of profiles
 */
function generateQuery(profiles: string[]): string {
  const variables = profiles.map((_, i) => `$login${i}: String!`).join(', ');
  const userQueries = profiles.map((_, i) => `
    user${i}: user(login: $login${i}) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  `).join('\n');

  return `
    query(${variables}) {
      ${userQueries}
    }
  `;
}

/**
 * GitHub service implementation using GraphQL API
 */
export class GitHubGraphQLService implements GitHubService {
  private token: string | undefined;

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN;
  }

  async getContributions(usernames: string[]): Promise<ContributionData> {
    if (!this.token) {
      throw new Error('GITHUB_TOKEN is not configured');
    }

    if (usernames.length === 0) {
      return {};
    }

    const query = generateQuery(usernames);
    const variables = usernames.reduce((acc, login, i) => {
      acc[`login${i}`] = login;
      return acc;
    }, {} as Record<string, string>);

    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const { data, errors } = await response.json();

    if (errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(errors)}`);
    }

    // Merge contribution data from all users
    const mergedData: ContributionData = {};
    const castedData = data as Record<string, GitHubUser>;

    Object.keys(castedData).forEach((key) => {
      const user = castedData[key];
      if (!user?.contributionsCollection) return;

      user.contributionsCollection.contributionCalendar.weeks.forEach((week: ContributionWeek) => {
        week.contributionDays.forEach((day: ContributionDay) => {
          mergedData[day.date] = (mergedData[day.date] || 0) + day.contributionCount;
        });
      });
    });

    return mergedData;
  }
}
