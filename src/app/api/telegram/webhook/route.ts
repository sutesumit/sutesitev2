import { NextResponse } from "next/server";
import { initBot } from "@/lib/telegram-bot";
import type { Update } from "grammy/types";
import crypto from "crypto";

const noStoreHeaders = { 'Cache-Control': 'no-store' };

function verifyWebhookSecret(authHeader: string | null): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("TELEGRAM_WEBHOOK_SECRET not configured");
    return false;
  }
  if (!authHeader) return false;
  
  const expected = crypto.createHash("sha256").update(secret).digest("hex");
  return authHeader === expected;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  
  if (!verifyWebhookSecret(authHeader)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: noStoreHeaders }
    );
  }

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
