import { NextResponse } from "next/server";
import { generateFeed } from "@/lib/feed";

export const revalidate = 21600;

export async function GET() {
  try {
    const feed = await generateFeed();
    
    const feedWithXslt = feed.replace(
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>'
    );

    return new NextResponse(feedWithXslt, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=21600, s-maxage=21600",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate feed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
