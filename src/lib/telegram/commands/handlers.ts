import { Bot, Context } from "grammy";
import { isAllowed } from '../middleware/auth';
import { replies } from '../replies';
import { formatBlip } from '../formatters';
import { createBlip, getBlips, getBlipBySerial, updateBlip, deleteBlip } from '../repository';

const MAX_CONTENT_LENGTH = 280;

export async function handleStart(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }
  await ctx.reply(replies.startIntro);
}

export async function handleSubscribe(ctx: Context): Promise<void> {
  await ctx.reply(replies.subscribeIntro);
}

export async function handleList(ctx: Context): Promise<void> {
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
}

export async function handleGet(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }

  const match = ctx.match;
  const serial = typeof match === 'string' ? match.trim() : null;
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
}

export async function handleEdit(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }

  const match = ctx.match;
  const args = typeof match === 'string' ? match.trim() : null;
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
}

export async function handleDel(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }

  const match = ctx.match;
  const serial = typeof match === 'string' ? match.trim() : null;
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
}

export async function handleMessage(ctx: Context, bot: Bot<Context>): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }

  const text = ctx.message?.text;
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
        await bot.api.sendMessage(
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
}
