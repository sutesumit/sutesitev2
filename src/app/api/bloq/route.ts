import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { initBot } from "@/lib/telegram-bot";
import { replies } from "@/lib/telegram-replies";
import { jsonError, jsonSuccess, unauthorizedResponse } from "@/lib/api/responses";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("K") || req.headers.get("X-Key");
    const expectedKey = process.env.BLOQ_API_KEY;

    if (!expectedKey || authHeader !== expectedKey) {
      return unauthorizedResponse();
    }

    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return jsonError("Content-Type must be application/json", 400);
    }

    const body = await req.json();
    const title = body?.title?.trim() || "";
    const slug = body?.slug?.trim() || "";
    const summary = body?.summary?.trim() || "";
    const tags = body?.tags || [];
    const category = body?.category?.trim() || "";

    if (!title) {
      return jsonError("Title is required", 400);
    }

    if (!slug) {
      return jsonError("Slug is required", 400);
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("bloq_views")
      .insert({ title, slug, summary, tags, category })
      .select("id, title, slug, summary, tags, category, created_at, updated_at")
      .single();

    if (error) {
      console.error("Error creating bloq:", error);
      return jsonError("Failed to create bloq", 500);
    }

    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    if (channelId) {
      try {
        const bot = await initBot();
        await bot.api.sendMessage(
          channelId,
          replies.channelBloq(data.slug, data.title, data.tags),
          { parse_mode: "HTML" }
        );
      } catch (broadcastError) {
        console.error("Failed to broadcast to channel:", broadcastError);
      }
    }

    return jsonSuccess({ bloq: data }, 201);
  } catch (error: unknown) {
    console.error("Error in bloq POST:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(message, 500);
  }
}
