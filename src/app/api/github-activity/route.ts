import { NextResponse } from 'next/server';
import { GITHUB_PROFILES } from '@/data/github';

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';

/**
 * Generates a dynamic GraphQL query based on the number of profiles.
 */
function generateQuery(profiles: string[]) {
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

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface GitHubUser {
  contributionsCollection: {
    contributionCalendar: {
      weeks: ContributionWeek[];
    };
  };
}

export async function GET() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: 'GITHUB_TOKEN is not configured' },
      { status: 500 }
    );
  }

  const query = generateQuery(GITHUB_PROFILES);
  const variables = GITHUB_PROFILES.reduce((acc, login, i) => {
    acc[`login${i}`] = login;
    return acc;
  }, {} as Record<string, string>);

  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: `GitHub API error: ${response.statusText}`, details: errorData },
        { status: response.status }
      );
    }

    const { data, errors } = await response.json();

    if (errors) {
      return NextResponse.json(
        { error: 'GraphQL error', details: errors },
        { status: 500 }
      );
    }

    const mergedData: Record<string, number> = {};
    const castedData = data as Record<string, GitHubUser>;

    // Process each user result (user0, user1, etc.)
    Object.keys(castedData).forEach((key) => {
      const user = castedData[key];
      if (!user || !user.contributionsCollection) return;

      user.contributionsCollection.contributionCalendar.weeks.forEach((week: ContributionWeek) => {
        week.contributionDays.forEach((day: ContributionDay) => {
          mergedData[day.date] = (mergedData[day.date] || 0) + day.contributionCount;
        });
      });
    });

    return NextResponse.json(mergedData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch GitHub activity', details: message },
      { status: 500 }
    );
  }
}
