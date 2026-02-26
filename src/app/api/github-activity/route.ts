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

    // Process each user result (user0, user1, etc.)
    Object.keys(data).forEach((key) => {
      const user = data[key];
      if (!user || !user.contributionsCollection) return;

      user.contributionsCollection.contributionCalendar.weeks.forEach((week: any) => {
        week.contributionDays.forEach((day: any) => {
          mergedData[day.date] = (mergedData[day.date] || 0) + day.contributionCount;
        });
      });
    });

    return NextResponse.json(mergedData);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch GitHub activity', details: error.message },
      { status: 500 }
    );
  }
}
