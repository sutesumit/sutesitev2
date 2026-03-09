import { Bot, Context } from "grammy";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { replies } from "@/lib/telegram-replies";

type MyContext = Context;

const MAX_CONTENT_LENGTH = 280;

let botInstance: Bot<MyContext> | null = null;

function getAllowedUserIds(): number[] {
  const ids = process.env.TELEGRAM_ALLOWED_USER_IDS;
  if (!ids) return [];
  return ids.split(",").map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
}

function isAllowed(userId: number): boolean {
  return getAllowedUserIds().includes(userId);
}

async function createBlip(content: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .insert({ content })
    .select("id, content, created_at, blip_serial")
    .single();
  
  if (error) throw error;
  return data;
}

async function getBlips(limit = 10) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .select("id, content, created_at, blip_serial")
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

async function getBlipBySerial(serial: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .select("id, content, created_at, blip_serial")
    .eq("blip_serial", serial)
    .single();
  
  if (error) return null;
  return data;
}

async function updateBlip(serial: string, content: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .update({ content })
    .eq("blip_serial", serial)
    .select("id, content, created_at, blip_serial")
    .single();
  
  if (error) throw error;
  return data;
}

async function deleteBlip(serial: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("blips")
    .delete()
    .eq("blip_serial", serial);
  
  if (error) throw error;
}

function formatBlip(blip: { blip_serial: string; content: string; created_at: string }): string {
  const date = new Date(blip.created_at);
  const timeStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `<code>${blip.blip_serial}.</code> ${blip.content}\n<i>${timeStr}</i>`;
}

export async function initBot(): Promise<Bot<MyContext>> {
  if (botInstance) {
    await botInstance.api.setMyCommands([
      { command: "start", description: "Show help" },
      { command: "subscribe", description: "Get updates" },
      { command: "list", description: "List recent blips" },
      { command: "get", description: "Get a specific blip" },
      { command: "edit", description: "Edit a blip" },
      { command: "del", description: "Delete a blip" },
    ]);
    return botInstance;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }

  botInstance = new Bot<MyContext>(token);

  await botInstance.init();

  await botInstance.api.setMyCommands([
    { command: "start", description: "Show help" },
    { command: "subscribe", description: "Get updates" },
    { command: "list", description: "List recent blips" },
    { command: "get", description: "Get a specific blip" },
    { command: "edit", description: "Edit a blip" },
    { command: "del", description: "Delete a blip" },
  ]);

  botInstance.command("start", async (ctx) => {
    if (!isAllowed(ctx.from?.id ?? 0)) {
      await ctx.reply(replies.unauthorized);
      return;
    }
    await ctx.reply(replies.startIntro);
  });

  botInstance.command("subscribe", async (ctx) => {
    await ctx.reply(replies.subscribeIntro);
  });

  botInstance.command("list", async (ctx) => {
    if (!isAllowed(ctx.from?.id ?? 0)) {
      await ctx.reply(replies.unauthorized);
      return;
    }

    try {
      const blips = await getBlips(10);
      if (blips.length === 0) {
        await ctx.reply(replies.noBlips);
        return;
      }

      const message = blips.map(formatBlip).join("\n\n");
      await ctx.reply(message, { parse_mode: "HTML" });
    } catch {
      await ctx.reply(replies.fetchFailed);
    }
  });

  botInstance.command("get", async (ctx) => {
    if (!isAllowed(ctx.from?.id ?? 0)) {
      await ctx.reply(replies.unauthorized);
      return;
    }

    const serial = ctx.match?.trim();
    if (!serial) {
      await ctx.reply(replies.usageGet);
      return;
    }

    try {
      const blip = await getBlipBySerial(serial);
      if (!blip) {
        await ctx.reply(replies.blipNotFound);
        return;
      }
      await ctx.reply(formatBlip(blip), { parse_mode: "HTML" });
    } catch {
      await ctx.reply(replies.fetchFailed);
    }
  });

  botInstance.command("edit", async (ctx) => {
    if (!isAllowed(ctx.from?.id ?? 0)) {
      await ctx.reply(replies.unauthorized);
      return;
    }

    const args = ctx.match?.trim();
    if (!args) {
      await ctx.reply(replies.usageEdit);
      return;
    }

    const firstSpace = args.indexOf(" ");
    if (firstSpace === -1) {
      await ctx.reply(replies.usageEdit);
      return;
    }

    const serial = args.slice(0, firstSpace);
    const newContent = args.slice(firstSpace + 1).trim();

    if (newContent.length > MAX_CONTENT_LENGTH) {
      await ctx.reply(replies.contentTooLong(MAX_CONTENT_LENGTH));
      return;
    }

    try {
      const updated = await updateBlip(serial, newContent);
      await ctx.reply(replies.blipUpdated(updated.blip_serial), { parse_mode: "HTML" });
    } catch {
      await ctx.reply(replies.updateFailed);
    }
  });

  botInstance.command("del", async (ctx) => {
    if (!isAllowed(ctx.from?.id ?? 0)) {
      await ctx.reply(replies.unauthorized);
      return;
    }

    const serial = ctx.match?.trim();
    if (!serial) {
      await ctx.reply(replies.usageDel);
      return;
    }

    try {
      await deleteBlip(serial);
      await ctx.reply(replies.blipDeleted(serial), { parse_mode: "HTML" });
    } catch {
      await ctx.reply(replies.deleteFailed);
    }
  });

  botInstance.on("message", async (ctx) => {
    if (!isAllowed(ctx.from?.id ?? 0)) {
      await ctx.reply(replies.unauthorized);
      return;
    }

    const text = ctx.message.text;
    if (!text || text.startsWith("/")) return;

    if (text.length > MAX_CONTENT_LENGTH) {
      await ctx.reply(replies.contentTooLong(MAX_CONTENT_LENGTH));
      return;
    }

    try {
      const blip = await createBlip(text);
      await ctx.reply(replies.blipCreated(blip.blip_serial), { parse_mode: "HTML" });

      const channelId = process.env.TELEGRAM_CHANNEL_ID;
      if (channelId) {
        try {
          await botInstance!.api.sendMessage(
            channelId,
            replies.channelBlip(blip.blip_serial, blip.content),
            { parse_mode: "HTML" }
          );
        } catch (broadcastError) {
          console.error("Failed to broadcast to channel:", broadcastError);
        }
      }
    } catch {
      await ctx.reply(replies.createFailed);
    }
  });

  return botInstance;
}
