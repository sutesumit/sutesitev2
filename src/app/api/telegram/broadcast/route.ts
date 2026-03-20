import { NextResponse } from "next/server";
import { initBot } from "@/lib/telegram-bot";
import { replies } from "@/lib/telegram-replies";

const noStoreHeaders = { 'Cache-Control': 'no-store' };

function validateBroadcastSecret(authHeader: string | null): boolean {
  const secret = process.env.TELEGRAM_BOT_TOKEN;
  if (!secret || !authHeader) return false;
  return authHeader === secret;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("X-Broadcast-Secret");
  
  if (!validateBroadcastSecret(authHeader)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: noStoreHeaders }
    );
  }

  try {
    const body = await req.json();
    const { type, title, slug, tags } = body;

    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    if (!channelId) {
      return NextResponse.json(
        { error: "Channel not configured" },
        { status: 500, headers: noStoreHeaders }
      );
    }

    const bot = await initBot();
    
    const message = type === "bloq"
      ? `📝 <b>${title}</b>\n<a href="https://sumitsute.com/bloq/${slug}">Read more</a>\nTags: ${tags}`
      : replies.channelBlip(slug, `${title}`);

    await bot.api.sendMessage(channelId, message, { parse_mode: "HTML" });

    return NextResponse.json(
      { ok: true, broadcast: true },
      { status: 200, headers: noStoreHeaders }
    );
  } catch (error: unknown) {
    console.error("Broadcast error:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
