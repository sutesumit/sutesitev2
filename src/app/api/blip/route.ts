import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { initBot } from "@/lib/telegram-bot";
import { replies } from "@/lib/telegram-replies";
import type { Blip } from "@/types/blip";
import { validateApiKey, parseContent, validateContentLength } from "@/lib/api/validation";
import { jsonError, jsonSuccess, unauthorizedResponse } from "@/lib/api/responses";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("K") || req.headers.get("X-Key");
    
    if (!validateApiKey(authHeader)) {
      return unauthorizedResponse();
    }

    const content = await parseContent(req);
    const validation = validateContentLength(content);
    
    if (!validation.valid) {
      return jsonError(validation.error!, 400);
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("blips")
      .insert({ content })
      .select("id, content, created_at, blip_serial")
      .single();

    if (error) {
      console.error("Error creating blip:", error);
      return jsonError("Failed to create blip", 500);
    }

    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    if (channelId) {
      try {
        const bot = await initBot();
        await bot.api.sendMessage(
          channelId,
          replies.channelBlip(data.blip_serial, data.content),
          { parse_mode: "HTML" }
        );
      } catch (broadcastError) {
        console.error("Failed to broadcast to channel:", broadcastError);
      }
    }

    return jsonSuccess({ blip: data as Blip }, 201);
  } catch (error: unknown) {
    console.error("Error in blip POST:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(message, 500);
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("blips")
      .select("id, content, created_at, blip_serial")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blips:", error);
      return jsonError("Failed to fetch blips", 500);
    }

    return jsonSuccess({ blips: data as Blip[] });
  } catch (error: unknown) {
    console.error("Error in blip GET:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(message, 500);
  }
}
