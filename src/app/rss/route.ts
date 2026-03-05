import { NextResponse } from "next/server";
import { generateFeed } from "@/lib/feed";

export async function GET() {
  try {
    const feed = await generateFeed();

    return new NextResponse(feed, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate feed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
