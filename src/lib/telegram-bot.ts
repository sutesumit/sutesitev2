import { Bot, Context, session, SessionFlavor } from "grammy";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

interface SessionData {
  mode?: "edit" | "delete";
  editingSerial?: string;
}

type MyContext = Context & SessionFlavor<SessionData>;

const MAX_CONTENT_LENGTH = 280;

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

export async function initBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }

  const bot = new Bot<MyContext>(token);

  bot.use(
    session({
      initial: (): SessionData => ({}),
    })
  );

  bot.on("message", async (ctx) => {
    if (!isAllowed(ctx.from?.id ?? 0)) {
      await ctx.reply("Unauthorized");
      return;
    }

    const text = ctx.message.text;
    if (!text) return;

    if (ctx.session.mode === "edit" && ctx.session.editingSerial) {
      if (text.length > MAX_CONTENT_LENGTH) {
        await ctx.reply(`Content must be ${MAX_CONTENT_LENGTH} characters or less`);
        return;
      }

      try {
        const updated = await updateBlip(ctx.session.editingSerial, text);
        ctx.session.mode = undefined;
        ctx.session.editingSerial = undefined;
        await ctx.reply(`Updated blip <code>${updated.blip_serial}</code>`, { parse_mode: "HTML" });
      } catch {
        await ctx.reply("Failed to update blip");
      }
      return;
    }

    if (ctx.session.mode === "delete") {
      const serial = text.trim();
      try {
        await deleteBlip(serial);
        ctx.session.mode = undefined;
        await ctx.reply(`Deleted blip <code>${serial}</code>`, { parse_mode: "HTML" });
      } catch {
        await ctx.reply("Failed to delete blip (not found?)");
      }
      return;
    }

    if (text.startsWith("/")) return;

    if (text.length > MAX_CONTENT_LENGTH) {
      await ctx.reply(`Content must be ${MAX_CONTENT_LENGTH} characters or less`);
      return;
    }

    try {
      const blip = await createBlip(text);
      await ctx.reply(`Created blip <code>${blip.blip_serial}</code>`, { parse_mode: "HTML" });
    } catch {
      await ctx.reply("Failed to create blip");
    }
  });

  bot.command("start", async (ctx) => {
    if (!isAllowed(ctx.from?.id ?? 0)) {
      await ctx.reply("Unauthorized");
      return;
    }
    await ctx.reply(
      "Blip Bot - Post short updates\n\n" +
      "Just send a message to create a blip\n" +
      "/list - Show recent blips\n" +
      "/get <serial> - Show specific blip\n" +
      "/edit <serial> - Edit a blip\n" +
      "/del <serial> - Delete a blip"
    );
  });

  bot.command("list", async (ctx) => {
    if (!isAllowed(ctx.from?.id ?? 0)) {
      await ctx.reply("Unauthorized");
      return;
    }

    try {
      const blips = await getBlips(10);
      if (blips.length === 0) {
        await ctx.reply("No blips yet");
        return;
      }

      const message = blips.map(formatBlip).join("\n\n");
      await ctx.reply(message, { parse_mode: "HTML" });
    } catch {
      await ctx.reply("Failed to fetch blips");
    }
  });

  bot.command("get", async (ctx) => {
    if (!isAllowed(ctx.from?.id ?? 0)) {
      await ctx.reply("Unauthorized");
      return;
    }

    const serial = ctx.match?.trim();
    if (!serial) {
      await ctx.reply("Usage: /get <serial>");
      return;
    }

    try {
      const blip = await getBlipBySerial(serial);
      if (!blip) {
        await ctx.reply("Blip not found");
        return;
      }
      await ctx.reply(formatBlip(blip), { parse_mode: "HTML" });
    } catch {
      await ctx.reply("Failed to fetch blip");
    }
  });

  bot.command("edit", async (ctx) => {
    if (!isAllowed(ctx.from?.id ?? 0)) {
      await ctx.reply("Unauthorized");
      return;
    }

    const serial = ctx.match?.trim();
    if (!serial) {
      await ctx.reply("Usage: /edit <serial>");
      return;
    }

    const blip = await getBlipBySerial(serial);
    if (!blip) {
      await ctx.reply("Blip not found");
      return;
    }

    ctx.session.mode = "edit";
    ctx.session.editingSerial = serial;
    await ctx.reply(`Editing blip <code>${serial}</code>:\n\n${blip.content}\n\nSend new content:`, { parse_mode: "HTML" });
  });

  bot.command("del", async (ctx) => {
    if (!isAllowed(ctx.from?.id ?? 0)) {
      await ctx.reply("Unauthorized");
      return;
    }

    const serial = ctx.match?.trim();
    if (!serial) {
      await ctx.reply("Usage: /del <serial>");
      return;
    }

    try {
      await deleteBlip(serial);
      await ctx.reply(`Deleted blip <code>${serial}</code>`, { parse_mode: "HTML" });
    } catch {
      await ctx.reply("Failed to delete blip (not found?)");
    }
  });

  return bot;
}

export async function startBot() {
  const bot = await initBot();
  
  bot.catch((err) => {
    console.error("Bot error:", err);
  });
  
  console.log("Starting Telegram bot...");
  await bot.start();
  console.log("Telegram bot stopped");
  return bot;
}
