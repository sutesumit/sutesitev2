import { NextResponse } from "next/server";
import { initBot } from "@/lib/telegram-bot";
import type { Update } from "grammy/types";

const noStoreHeaders = { 'Cache-Control': 'no-store' };

export async function POST(req: Request) {
  try {
    const bot = await initBot();
    const update: Update = await req.json();
    await bot.handleUpdate(update);
    
    return NextResponse.json(
      { ok: true },
      { status: 200, headers: noStoreHeaders }
    );
  } catch (error: unknown) {
    console.error("Error in telegram webhook:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
