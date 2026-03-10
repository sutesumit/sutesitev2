import { NextResponse } from 'next/server';
import { defaultGitHubService } from '@/services/github';
import { GITHUB_PROFILES } from '@/data/github';

export const revalidate = 3600;

export async function GET() {
  try {
    const data = await defaultGitHubService.getContributions(GITHUB_PROFILES);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch GitHub activity', details: message },
      { status: 500 }
    );
  }
}
