import { NextResponse } from "next/server";
import { liveBloqService } from "@/lib/live-bloq";
import { getSessionBySlug } from "@/lib/live-bloq/repository";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;

    const rawSession = await getSessionBySlug(slug);
    if (!rawSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (rawSession.status === "cancelled") {
      return NextResponse.json({
        entries: [],
        sessionStatus: "cancelled",
      });
    }

    const session = await liveBloqService.getSession(slug);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const after = parseInt(searchParams.get("after") ?? "0", 10) || 0;

    const entries = await liveBloqService.getEntriesAfter(session.id, after);

    return NextResponse.json({
      entries,
      sessionStatus: session.status,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Live bloq entries fetch error:", message);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}
