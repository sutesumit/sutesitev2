import {
  escapeHtml,
  formatBloqChannelMessage,
  formatVisitorNotification,
} from "@/lib/notifications/formatters";

export const replies = {
  unauthorized: "Nice try, but nope. This bot is not for you.",
  noBytes: "Crickets... no bytes yet.",
  noBlips: "Crickets... nothing here yet.",
  blipNotFound: "That blip doesn't exist (yet?)",
  byteNotFound: "That byte doesn't exist (yet?)",
  byteCreated: (serial: string) => `Byte <code>${escapeHtml(serial)}</code> is born!`,
  blipCreated: (serial: string) => `Blip <code>${escapeHtml(serial)}</code> is born!`,
  byteUpdated: (serial: string) => `Byte <code>${escapeHtml(serial)}</code> got a makeover.`,
  blipUpdated: (serial: string) => `Blip <code>${escapeHtml(serial)}</code> got a makeover.`,
  byteDeleted: (serial: string) => `Byte <code>${escapeHtml(serial)}</code> has left the chat.`,
  blipDeleted: (serial: string) => `Blip <code>${escapeHtml(serial)}</code> has left the chat.`,
  contentTooLong: (max: number) => `Keep it under ${max} chars, poet.`,
  fetchFailed: "Oops, couldn't grab those.",
  createFailed: "Something broke. Try again?",
  updateFailed: "Couldn't update that. Does it exist?",
  deleteFailed: "Couldn't delete. Maybe it's already gone?",
  usageByte: "Usage: <code>/byte</code> &lt;content&gt;",
  usageBlip: "Usage: <code>/blip</code> &lt;term&gt;:&lt;meaning&gt;",
  usageList: "Usage: <code>/list</code> &lt;byte|blip&gt;",
  usageGet: "Usage: <code>/get</code> &lt;byte|blip&gt; &lt;serial&gt;",
  usageEdit: "Usage: <code>/edit</code> &lt;byte|blip&gt; &lt;serial&gt; &lt;new content&gt;",
  usageDel: "Usage: <code>/del</code> &lt;byte|blip&gt; &lt;serial&gt;",
  startIntro:
    'Jot Bot for <a href="https://www.sumitsute.com/">sumit sute</a>\n\n' +
    "Send any text and it becomes a byte. For other operations, blips and live sessions, use following commands:\n\n" +
    "<code>/byte</code> &lt;content&gt; - Create a short thought\n" +
    "<code>/blip</code> &lt;term&gt;:&lt;meaning&gt; - Create a term:meaning pair\n" +
    "<code>/list</code> &lt;byte|blip&gt; - See what you've blipped\n" +
    "<code>/get</code> &lt;byte|blip&gt; &lt;serial&gt; - Pull up a specific item\n" +
    "<code>/edit</code> &lt;byte|blip&gt; &lt;serial&gt; &lt;text&gt; - Rewrite history\n" +
    "<code>/del</code> &lt;byte|blip&gt; &lt;serial&gt; - Erase the evidence\n" +
    "<code>/livesession</code> - Manage live bloq sessions (start / summary / close / cancel / status)\n\n" +
    "While a live session is active, plain messages become session entries instead of bytes. Use <code>/byte</code> to force a byte.",
  channelBlip: (serial: string, content: string) =>
    `🤖: <a href="https://www.sumitsute.com/blip/${encodeURIComponent(serial)}">${escapeHtml(content)}</a>`,
  channelBloq: (title: string, slug: string, tags?: string[]) =>
    formatBloqChannelMessage({ title, slug, tags }),
  visitorNotification: (visitor: {
    city?: string;
    country?: string;
    region?: string;
    ip?: string;
    deviceType?: string;
    isReturning?: boolean;
    visitCount?: number;
  }, referrer?: string) => formatVisitorNotification(visitor, referrer),
  subscribeIntro: "Follow @blipbotlive for fresh posts.",
  liveSessionUsage:
    "Usage:\n" +
    "<code>/livesession start</code> &lt;title&gt; - Start a live session\n" +
    "<code>/livesession summary</code> &lt;text&gt; - Update the live session summary\n" +
    "plain text - no command needed, just type to add the next live note\n" +
    "<code>/livesession close</code> - Close the active session\n" +
    "<code>/livesession cancel</code> - Cancel the active session\n" +
    "<code>/livesession status</code> - Show session status",
  liveSessionAlreadyActive:
    "You already have an active session. Close or cancel it first.",
  liveSessionNoActive:
    "No active session. Start one with <code>/livesession start</code> &lt;title&gt;",
  liveSessionStartFailed: "Failed to start session. Try again?",
  liveSessionClosed: "Session closed. The live page is now a permanent record.",
  liveSessionCloseFailed: "Failed to close session.",
  liveSessionCancelled: "Session cancelled. The page has been removed.",
  liveSessionCancelFailed: "Failed to cancel session.",
  liveSessionStatusFailed: "Could not fetch session status.",
  liveSessionSummaryUsage: "Usage: <code>/livesession summary</code> &lt;text&gt;",
  liveSessionSummaryFailed: "Failed to update summary.",
  liveSessionEntryFailed: "Could not add that update to the live session.",
  liveEntryAdded: (sequence: number) => `Entry <b>#${sequence}</b> added.`,
} as const;
