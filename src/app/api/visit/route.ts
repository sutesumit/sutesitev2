import { NextResponse } from "next/server";
import { noStoreHeaders } from "@/lib/api/constants";
import { jsonError } from "@/lib/api/responses";
import { telegramNotifier } from "@/lib/notifications/telegram-notifier";
import { createVisitService } from "@/lib/visit/service";

const visitService = createVisitService(telegramNotifier);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userAgent = request.headers.get("user-agent");
    const summary = await visitService.trackVisit(body, userAgent);

    return NextResponse.json(summary, {
      headers: noStoreHeaders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, 500);
  }
}
