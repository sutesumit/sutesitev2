import { Bot, Context } from "grammy";
import { isAllowed } from '../middleware/auth';
import { replies } from '../replies';
import { formatByte, formatBlip } from '../formatters';
import { createByte, getBytes, getByteBySerial, updateByte, deleteByte, createBlip, getBlips, getBlipBySerial, updateBlip, deleteBlip } from '../repository';

const MAX_CONTENT_LENGTH = 280;

export async function handleStart(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }
  await ctx.reply(replies.startIntro);
}

export async function handleByte(ctx: Context, bot: Bot<Context>): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }

  const match = ctx.match;
  const content = typeof match === 'string' ? match.trim() : null;
  if (!content) {
    await ctx.reply(replies.usageByte);
    return;
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    await ctx.reply(replies.contentTooLong(MAX_CONTENT_LENGTH));
    return;
  }

  try {
    const byte = await createByte(content);
    await ctx.reply(replies.byteCreated(byte.byte_serial), { parse_mode: "HTML" });

    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    if (channelId) {
      try {
        await bot.api.sendMessage(
          channelId,
          replies.channelBlip(byte.byte_serial, byte.content),
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

export async function handleBlip(ctx: Context, bot: Bot<Context>): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }

  const match = ctx.match;
  const args = typeof match === 'string' ? match.trim() : null;
  if (!args) {
    await ctx.reply(replies.usageBlip);
    return;
  }

  const colonIndex = args.indexOf(":");
  if (colonIndex === -1) {
    await ctx.reply(replies.usageBlip);
    return;
  }

  const term = args.slice(0, colonIndex).trim();
  const meaning = args.slice(colonIndex + 1).trim();

  if (!term || !meaning) {
    await ctx.reply(replies.usageBlip);
    return;
  }

  const fullContent = `${term}:${meaning}`;
  if (fullContent.length > MAX_CONTENT_LENGTH) {
    await ctx.reply(replies.contentTooLong(MAX_CONTENT_LENGTH));
    return;
  }

  try {
    const blip = await createBlip(term, meaning);
    await ctx.reply(replies.blipCreated(blip.blip_serial), { parse_mode: "HTML" });

    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    if (channelId) {
      try {
        await bot.api.sendMessage(
          channelId,
          replies.channelBlip(blip.blip_serial, `${term}:${meaning}`),
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

export async function handleList(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }

  const match = ctx.match;
  const type = typeof match === 'string' ? match.trim().toLowerCase() : null;
  
  if (type !== "byte" && type !== "blip") {
    await ctx.reply(replies.usageList);
    return;
  }

  try {
    if (type === "byte") {
      const bytes = await getBytes(10);
      if (bytes.length === 0) {
        await ctx.reply(replies.noBytes);
        return;
      }
      const message = bytes.map(formatByte).join("\n\n");
      await ctx.reply(message, { parse_mode: "HTML" });
    } else {
      const blips = await getBlips(10);
      if (blips.length === 0) {
        await ctx.reply(replies.noBlips);
        return;
      }
      const message = blips.map(formatBlip).join("\n\n");
      await ctx.reply(message, { parse_mode: "HTML" });
    }
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
  const args = typeof match === 'string' ? match.trim() : null;
  if (!args) {
    await ctx.reply(replies.usageGet);
    return;
  }

  const firstSpace = args.indexOf(" ");
  if (firstSpace === -1) {
    await ctx.reply(replies.usageGet);
    return;
  }

  const type = args.slice(0, firstSpace).toLowerCase();
  const serial = args.slice(firstSpace + 1).trim();

  if (type !== "byte" && type !== "blip") {
    await ctx.reply(replies.usageGet);
    return;
  }

  try {
    if (type === "byte") {
      const byte = await getByteBySerial(serial);
      if (!byte) {
        await ctx.reply(replies.blipNotFound);
        return;
      }
      await ctx.reply(formatByte(byte), { parse_mode: "HTML" });
    } else {
      const blip = await getBlipBySerial(serial);
      if (!blip) {
        await ctx.reply(replies.blipNotFound);
        return;
      }
      await ctx.reply(formatBlip(blip), { parse_mode: "HTML" });
    }
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

  const secondSpace = args.indexOf(" ", firstSpace + 1);
  if (secondSpace === -1) {
    await ctx.reply(replies.usageEdit);
    return;
  }

  const type = args.slice(0, firstSpace).toLowerCase();
  const serial = args.slice(firstSpace + 1, secondSpace);
  const newContent = args.slice(secondSpace + 1).trim();

  if (type !== "byte" && type !== "blip") {
    await ctx.reply(replies.usageEdit);
    return;
  }

  if (newContent.length > MAX_CONTENT_LENGTH) {
    await ctx.reply(replies.contentTooLong(MAX_CONTENT_LENGTH));
    return;
  }

  try {
    if (type === "byte") {
      const updated = await updateByte(serial, newContent);
      await ctx.reply(replies.blipUpdated(updated.byte_serial), { parse_mode: "HTML" });
    } else {
      const colonIndex = newContent.indexOf(":");
      if (colonIndex === -1) {
        await ctx.reply(replies.usageEdit);
        return;
      }
      const term = newContent.slice(0, colonIndex).trim();
      const meaning = newContent.slice(colonIndex + 1).trim();
      const updated = await updateBlip(serial, term, meaning);
      await ctx.reply(replies.blipUpdated(updated.blip_serial), { parse_mode: "HTML" });
    }
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
  const args = typeof match === 'string' ? match.trim() : null;
  if (!args) {
    await ctx.reply(replies.usageDel);
    return;
  }

  const firstSpace = args.indexOf(" ");
  if (firstSpace === -1) {
    await ctx.reply(replies.usageDel);
    return;
  }

  const type = args.slice(0, firstSpace).toLowerCase();
  const serial = args.slice(firstSpace + 1).trim();

  if (type !== "byte" && type !== "blip") {
    await ctx.reply(replies.usageDel);
    return;
  }

  try {
    if (type === "byte") {
      await deleteByte(serial);
    } else {
      await deleteBlip(serial);
    }
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
    const byte = await createByte(text);
    await ctx.reply(replies.byteCreated(byte.byte_serial), { parse_mode: "HTML" });

    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    if (channelId) {
      try {
        await bot.api.sendMessage(
          channelId,
          replies.channelBlip(byte.byte_serial, byte.content),
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
