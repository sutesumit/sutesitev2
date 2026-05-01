import { NextResponse } from 'next/server';
import { defaultGitHubService } from '@/services/github';
import { GITHUB_PROFILES } from '@/data/github';

export const revalidate = 3600;

function parseMonthParams(request: Request): { year: number; month: number } | null {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');

  if (!yearParam || !monthParam) {
    return null;
  }

  const year = Number(yearParam);
  const month = Number(monthParam);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return { year, month };
}

export async function GET(request: Request) {
  const monthRequest = parseMonthParams(request);

  if (!monthRequest) {
    return NextResponse.json(
      { error: 'Valid year and month query params are required' },
      { status: 400 }
    );
  }

  try {
    const data = await defaultGitHubService.getContributionsForMonth(GITHUB_PROFILES, monthRequest);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch GitHub activity', details: message },
      { status: 500 }
    );
  }
}
