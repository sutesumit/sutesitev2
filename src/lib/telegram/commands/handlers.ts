import { Bot, Context } from "grammy";
import { createBlipService } from "@/lib/blip/service";
import { parseBlipCommandInput } from "@/lib/blip/validation";
import { createByteService } from "@/lib/byte/service";
import { contentMutationEffects } from "@/lib/content-publish";
import { NotFoundError, ValidationError } from "@/lib/core/errors";
import { isAllowed } from "../middleware/auth";
import { formatByte, formatBlip } from "../formatters";
import { replies } from "../replies";

const MAX_CONTENT_LENGTH = 280;

const byteService = createByteService({
  mutationEffect: contentMutationEffects,
});

const blipService = createBlipService({
  mutationEffect: contentMutationEffects,
});

export async function handleStart(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }
  await ctx.reply(replies.startIntro);
}

export async function handleByte(ctx: Context, bot: Bot<Context>): Promise<void> {
  void bot;

  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }

  const match = ctx.match;
  const content = typeof match === "string" ? match.trim() : null;
  if (!content) {
    await ctx.reply(replies.usageByte);
    return;
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    await ctx.reply(replies.contentTooLong(MAX_CONTENT_LENGTH));
    return;
  }

  try {
    const byte = await byteService.createByte(content);
    await ctx.reply(replies.byteCreated(byte.byte_serial), { parse_mode: "HTML" });
  } catch {
    await ctx.reply(replies.createFailed);
  }
}

export async function handleBlip(ctx: Context, bot: Bot<Context>): Promise<void> {
  void bot;

  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }

  const match = ctx.match;
  const args = typeof match === "string" ? match.trim() : null;
  if (!args) {
    await ctx.reply(replies.usageBlip);
    return;
  }

  if (args.length > MAX_CONTENT_LENGTH) {
    await ctx.reply(replies.contentTooLong(MAX_CONTENT_LENGTH));
    return;
  }

  let parsed;
  try {
    parsed = parseBlipCommandInput(args);
  } catch {
    await ctx.reply(replies.usageBlip);
    return;
  }

  try {
    const blip = await blipService.createBlip(parsed.term, parsed.meaning);
    await ctx.reply(replies.blipCreated(blip.blip_serial), { parse_mode: "HTML" });
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
  const type = typeof match === "string" ? match.trim().toLowerCase() : null;

  if (type !== "byte" && type !== "blip") {
    await ctx.reply(replies.usageList);
    return;
  }

  try {
    if (type === "byte") {
      const bytes = await byteService.listRecentBytes(10);
      if (bytes.length === 0) {
        await ctx.reply(replies.noBytes);
        return;
      }
      await ctx.reply(bytes.map(formatByte).join("\n\n"), { parse_mode: "HTML" });
      return;
    }

    const blips = await blipService.listRecentBlips(10);
    if (blips.length === 0) {
      await ctx.reply(replies.noBlips);
      return;
    }
    await ctx.reply(blips.map(formatBlip).join("\n\n"), { parse_mode: "HTML" });
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
  const args = typeof match === "string" ? match.trim() : null;
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
      const byte = await byteService.getByteBySerial(serial);
      await ctx.reply(formatByte(byte), { parse_mode: "HTML" });
      return;
    }

    const blip = await blipService.getBlipBySerial(serial);
    await ctx.reply(formatBlip(blip), { parse_mode: "HTML" });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      await ctx.reply(replies.blipNotFound);
      return;
    }

    await ctx.reply(replies.fetchFailed);
  }
}

export async function handleEdit(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }

  const match = ctx.match;
  const args = typeof match === "string" ? match.trim() : null;
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
      const updated = await byteService.updateByte(serial, newContent);
      await ctx.reply(replies.blipUpdated(updated.byte_serial), { parse_mode: "HTML" });
      return;
    }

    const { term, meaning } = parseBlipCommandInput(newContent);
    const updated = await blipService.updateBlip(serial, term, meaning);
    await ctx.reply(replies.blipUpdated(updated.blip_serial), { parse_mode: "HTML" });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      await ctx.reply(replies.usageEdit);
      return;
    }

    await ctx.reply(replies.updateFailed);
  }
}

export async function handleDel(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }

  const match = ctx.match;
  const args = typeof match === "string" ? match.trim() : null;
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
      await byteService.deleteByte(serial);
    } else {
      await blipService.deleteBlip(serial);
    }
    await ctx.reply(replies.blipDeleted(serial), { parse_mode: "HTML" });
  } catch {
    await ctx.reply(replies.deleteFailed);
  }
}

export async function handleMessage(ctx: Context, bot: Bot<Context>): Promise<void> {
  void bot;

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
    const byte = await byteService.createByte(text);
    await ctx.reply(replies.byteCreated(byte.byte_serial), { parse_mode: "HTML" });
  } catch {
    await ctx.reply(replies.createFailed);
  }
}
