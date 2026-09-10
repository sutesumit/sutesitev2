import { Bot, Context } from "grammy";
import { SITE_URL } from "@/config/metadata";
import { createBlipService } from "@/lib/blip/service";
import { parseBlipCommandInput } from "@/lib/blip/validation";
import { createByteService } from "@/lib/byte/service";
import { contentMutationEffects } from "@/lib/content-publish";
import { NotFoundError, ValidationError } from "@/lib/core/errors";
import { isAllowed } from "../middleware/auth";
import { formatByte, formatBlip } from "../formatters";
import { replies } from "../replies";
import { getOrRecoverActiveSession } from "../session-state";
import { liveBloqService } from "./live-session";

const MAX_CONTENT_LENGTH = 280;

const byteService = createByteService({
  mutationEffect: contentMutationEffects,
});

const blipService = createBlipService({
  mutationEffect: contentMutationEffects,
});

export async function handleStart(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized, { parse_mode: "HTML" });
    return;
  }
  await ctx.reply(replies.startIntro, { parse_mode: "HTML" });
}

export async function handleByte(ctx: Context, bot: Bot<Context>): Promise<void> {
  void bot;

  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized, { parse_mode: "HTML" });
    return;
  }

  const match = ctx.match;
  const content = typeof match === "string" ? match.trim() : null;
  if (!content) {
    await ctx.reply(replies.usageByte, { parse_mode: "HTML" });
    return;
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    await ctx.reply(replies.contentTooLong(MAX_CONTENT_LENGTH), { parse_mode: "HTML" });
    return;
  }

  try {
    const byte = await byteService.createByte(content);
    await ctx.reply(replies.byteCreated(byte.byte_serial), { parse_mode: "HTML" });
  } catch {
    await ctx.reply(replies.createFailed, { parse_mode: "HTML" });
  }
}

export async function handleBlip(ctx: Context, bot: Bot<Context>): Promise<void> {
  void bot;

  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized, { parse_mode: "HTML" });
    return;
  }

  const match = ctx.match;
  const args = typeof match === "string" ? match.trim() : null;
  if (!args) {
    await ctx.reply(replies.usageBlip, { parse_mode: "HTML" });
    return;
  }

  if (args.length > MAX_CONTENT_LENGTH) {
    await ctx.reply(replies.contentTooLong(MAX_CONTENT_LENGTH), { parse_mode: "HTML" });
    return;
  }

  let parsed;
  try {
    parsed = parseBlipCommandInput(args);
  } catch {
    await ctx.reply(replies.usageBlip, { parse_mode: "HTML" });
    return;
  }

  try {
    const blip = await blipService.createBlip(parsed.term, parsed.meaning);
    await ctx.reply(replies.blipCreated(blip.blip_serial), { parse_mode: "HTML" });
  } catch {
    await ctx.reply(replies.createFailed, { parse_mode: "HTML" });
  }
}

export async function handleList(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized, { parse_mode: "HTML" });
    return;
  }

  const match = ctx.match;
  const type = typeof match === "string" ? match.trim().toLowerCase() : null;

  if (type !== "byte" && type !== "blip") {
    await ctx.reply(replies.usageList, { parse_mode: "HTML" });
    return;
  }

  try {
    if (type === "byte") {
      const bytes = await byteService.listRecentBytes(10);
      if (bytes.length === 0) {
      await ctx.reply(replies.noBytes, { parse_mode: "HTML" });
        return;
      }
      await ctx.reply(bytes.map(formatByte).join("\n\n"), { parse_mode: "HTML" });
      return;
    }

    const blips = await blipService.listRecentBlips(10);
    if (blips.length === 0) {
      await ctx.reply(replies.noBlips, { parse_mode: "HTML" });
      return;
    }
    await ctx.reply(blips.map(formatBlip).join("\n\n"), { parse_mode: "HTML" });
  } catch {
    await ctx.reply(replies.fetchFailed, { parse_mode: "HTML" });
  }
}

export async function handleGet(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized, { parse_mode: "HTML" });
    return;
  }

  const match = ctx.match;
  const args = typeof match === "string" ? match.trim() : null;
  if (!args) {
    await ctx.reply(replies.usageGet, { parse_mode: "HTML" });
    return;
  }

  const firstSpace = args.indexOf(" ");
  if (firstSpace === -1) {
    await ctx.reply(replies.usageGet, { parse_mode: "HTML" });
    return;
  }

  const type = args.slice(0, firstSpace).toLowerCase();
  const serial = args.slice(firstSpace + 1).trim();

  if (type !== "byte" && type !== "blip") {
    await ctx.reply(replies.usageGet, { parse_mode: "HTML" });
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
      await ctx.reply(
        type === "byte" ? replies.byteNotFound : replies.blipNotFound,
        { parse_mode: "HTML" }
      );
      return;
    }

    await ctx.reply(replies.fetchFailed, { parse_mode: "HTML" });
  }
}

export async function handleEdit(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized, { parse_mode: "HTML" });
    return;
  }

  const match = ctx.match;
  const args = typeof match === "string" ? match.trim() : null;
  if (!args) {
    await ctx.reply(replies.usageEdit, { parse_mode: "HTML" });
    return;
  }

  const firstSpace = args.indexOf(" ");
  if (firstSpace === -1) {
    await ctx.reply(replies.usageEdit, { parse_mode: "HTML" });
    return;
  }

  const secondSpace = args.indexOf(" ", firstSpace + 1);
  if (secondSpace === -1) {
    await ctx.reply(replies.usageEdit, { parse_mode: "HTML" });
    return;
  }

  const type = args.slice(0, firstSpace).toLowerCase();
  const serial = args.slice(firstSpace + 1, secondSpace);
  const newContent = args.slice(secondSpace + 1).trim();

  if (type !== "byte" && type !== "blip") {
    await ctx.reply(replies.usageEdit, { parse_mode: "HTML" });
    return;
  }

  if (newContent.length > MAX_CONTENT_LENGTH) {
    await ctx.reply(replies.contentTooLong(MAX_CONTENT_LENGTH), { parse_mode: "HTML" });
    return;
  }

  try {
    if (type === "byte") {
      const updated = await byteService.updateByte(serial, newContent);
      await ctx.reply(replies.byteUpdated(updated.byte_serial), { parse_mode: "HTML" });
      return;
    }

    const { term, meaning } = parseBlipCommandInput(newContent);
    const updated = await blipService.updateBlip(serial, term, meaning);
    await ctx.reply(replies.blipUpdated(updated.blip_serial), { parse_mode: "HTML" });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      await ctx.reply(replies.usageEdit, { parse_mode: "HTML" });
      return;
    }

    await ctx.reply(replies.updateFailed, { parse_mode: "HTML" });
  }
}

export async function handleDel(ctx: Context): Promise<void> {
  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized, { parse_mode: "HTML" });
    return;
  }

  const match = ctx.match;
  const args = typeof match === "string" ? match.trim() : null;
  if (!args) {
    await ctx.reply(replies.usageDel, { parse_mode: "HTML" });
    return;
  }

  const firstSpace = args.indexOf(" ");
  if (firstSpace === -1) {
    await ctx.reply(replies.usageDel, { parse_mode: "HTML" });
    return;
  }

  const type = args.slice(0, firstSpace).toLowerCase();
  const serial = args.slice(firstSpace + 1).trim();

  if (type !== "byte" && type !== "blip") {
    await ctx.reply(replies.usageDel, { parse_mode: "HTML" });
    return;
  }

  try {
    if (type === "byte") {
      await byteService.deleteByte(serial);
    } else {
      await blipService.deleteBlip(serial);
    }
    await ctx.reply(
      type === "byte" ? replies.byteDeleted(serial) : replies.blipDeleted(serial),
      { parse_mode: "HTML" }
    );
  } catch {
    await ctx.reply(replies.deleteFailed, { parse_mode: "HTML" });
  }
}

export async function handleMessage(ctx: Context, bot: Bot<Context>): Promise<void> {
  void bot;

  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized, { parse_mode: "HTML" });
    return;
  }

  const text = ctx.message?.text;
  if (!text || text.startsWith("/")) return;

  if (text.length > MAX_CONTENT_LENGTH) {
    await ctx.reply(replies.contentTooLong(MAX_CONTENT_LENGTH), { parse_mode: "HTML" });
    return;
  }

  const activeSessionId = await getOrRecoverActiveSession(
    ctx.from!.id,
    liveBloqService
  );
  if (activeSessionId) {
    try {
      const entry = await liveBloqService.addEntry(activeSessionId, text);
      const session = await liveBloqService.getSessionById(activeSessionId);
      const url = session
        ? `<a href="${SITE_URL}/bloq/live/${encodeURIComponent(session.slug)}">live page</a>`
        : "live page";
      await ctx.reply(replies.liveEntryAdded(entry.entry_sequence, url), {
        parse_mode: "HTML",
      });
      return;
    } catch {
      await ctx.reply(replies.liveSessionEntryFailed, { parse_mode: "HTML" });
      return;
    }
  }

  try {
    const byte = await byteService.createByte(text);
    await ctx.reply(replies.byteCreated(byte.byte_serial), { parse_mode: "HTML" });
  } catch {
    await ctx.reply(replies.createFailed, { parse_mode: "HTML" });
  }
}
