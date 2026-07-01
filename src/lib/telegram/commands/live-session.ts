import { Bot, Context } from "grammy";
import { isAllowed } from "../middleware/auth";
import { createLiveBloqService } from "@/lib/live-bloq";
import { contentMutationEffects } from "@/lib/content-publish";
import { SITE_URL } from "@/config/metadata";
import { escapeHtml } from "@/lib/notifications/formatters";
import {
  getOrRecoverActiveSession,
  setActiveSession,
  clearActiveSession,
} from "../session-state";
import { replies } from "../replies";

export const liveBloqService = createLiveBloqService({
  mutationEffect: contentMutationEffects,
});

function formatRuntime(startedAt: string): string {
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const minutes = Math.floor((now - start) / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

export async function handleLiveSession(
  ctx: Context,
  bot: Bot<Context>
): Promise<void> {
  void bot;

  if (!isAllowed(ctx.from?.id ?? 0)) {
    await ctx.reply(replies.unauthorized);
    return;
  }

  const match = ctx.match;
  const args = typeof match === "string" ? match.trim() : "";
  const [subcommand, ...rest] = args.split(/\s+/);
  const subcommandArgs = rest.join(" ").trim();

  const userId = ctx.from!.id;

  switch (subcommand) {
    case "start": {
      if (!subcommandArgs) {
        await ctx.reply(replies.liveSessionUsage, { parse_mode: "HTML" });
        return;
      }

      const existingSession = await getOrRecoverActiveSession(
        userId,
        liveBloqService
      );
      if (existingSession) {
        await ctx.reply(replies.liveSessionAlreadyActive, {
          parse_mode: "HTML",
        });
        return;
      }

      try {
        const session = await liveBloqService.startSession(subcommandArgs);
        setActiveSession(userId, session.id);
        await ctx.reply(
          `🔴 Live session started: <b>${escapeHtml(session.title)}</b>\n<a href="${SITE_URL}/bloq/live/${encodeURIComponent(session.slug)}">${SITE_URL}/bloq/live/${encodeURIComponent(session.slug)}</a>`,
          { parse_mode: "HTML" }
        );
      } catch {
        await ctx.reply(replies.liveSessionStartFailed, {
          parse_mode: "HTML",
        });
      }
      break;
    }

    case "close": {
      const sessionId = await getOrRecoverActiveSession(
        userId,
        liveBloqService
      );
      if (!sessionId) {
        await ctx.reply(replies.liveSessionNoActive, { parse_mode: "HTML" });
        return;
      }

      try {
        await liveBloqService.closeSession(sessionId);
        clearActiveSession(userId);
        await ctx.reply(replies.liveSessionClosed, { parse_mode: "HTML" });
      } catch {
        await ctx.reply(replies.liveSessionCloseFailed, {
          parse_mode: "HTML",
        });
      }
      break;
    }

    case "cancel": {
      const sessionId = await getOrRecoverActiveSession(
        userId,
        liveBloqService
      );
      if (!sessionId) {
        await ctx.reply(replies.liveSessionNoActive, { parse_mode: "HTML" });
        return;
      }

      try {
        await liveBloqService.cancelSession(sessionId);
        clearActiveSession(userId);
        await ctx.reply(replies.liveSessionCancelled, { parse_mode: "HTML" });
      } catch {
        await ctx.reply(replies.liveSessionCancelFailed, {
          parse_mode: "HTML",
        });
      }
      break;
    }

    case "summary": {
      if (!subcommandArgs) {
        await ctx.reply(replies.liveSessionSummaryUsage, { parse_mode: "HTML" });
        return;
      }

      const sessionId = await getOrRecoverActiveSession(
        userId,
        liveBloqService
      );
      if (!sessionId) {
        await ctx.reply(replies.liveSessionNoActive, { parse_mode: "HTML" });
        return;
      }

      try {
        await liveBloqService.updateSummary(sessionId, subcommandArgs);
        await ctx.reply(
          `Summary updated: "${escapeHtml(subcommandArgs)}"`,
          { parse_mode: "HTML" }
        );
      } catch {
        await ctx.reply(replies.liveSessionSummaryFailed, {
          parse_mode: "HTML",
        });
      }
      break;
    }

    case "status": {
      const sessionId = await getOrRecoverActiveSession(
        userId,
        liveBloqService
      );
      if (!sessionId) {
        await ctx.reply(replies.liveSessionNoActive, { parse_mode: "HTML" });
        return;
      }

      try {
        const session = await liveBloqService.getSessionById(sessionId);

        if (!session) {
          await ctx.reply(replies.liveSessionNoActive, { parse_mode: "HTML" });
          return;
        }

        const runtime = formatRuntime(session.started_at);
        const staleWarning =
          Date.now() - new Date(session.started_at).getTime() > 8 * 60 * 60 * 1000
            ? `\n⚠️ This session has been active for over 8 hours. Consider closing or cancelling it.`
            : "";

        await ctx.reply(
          `📊 <b>${escapeHtml(session.title)}</b>\n` +
            `Entries: ${session.entry_count}\n` +
            `Runtime: ${runtime}\n` +
            `<a href="${SITE_URL}/bloq/live/${encodeURIComponent(session.slug)}">${SITE_URL}/bloq/live/${encodeURIComponent(session.slug)}</a>` +
            staleWarning,
          { parse_mode: "HTML" }
        );
      } catch {
        await ctx.reply(replies.liveSessionStatusFailed, {
          parse_mode: "HTML",
        });
      }
      break;
    }

    default:
      await ctx.reply(replies.liveSessionUsage, { parse_mode: "HTML" });
      break;
  }
}
