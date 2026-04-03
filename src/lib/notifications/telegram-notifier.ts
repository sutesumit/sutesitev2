import type { Blip } from "@/types/blip";
import type { Byte } from "@/types/byte";
import {
  formatClapIncrementNotification,
  formatBlipChannelMessage,
  formatBloqChannelMessage,
  formatByteChannelMessage,
  formatViewIncrementNotification,
  formatVisitorNotification,
} from "./formatters";
import type {
  BloqNotificationPayload,
  CounterNotificationPayload,
  TelegramNotifier,
  VisitorNotificationPayload,
} from "./types";

async function sendMessage(chatId: string, message: string): Promise<void> {
  // Avoid a module initialization cycle between bot wiring and notifier wiring.
  const { initBot } = await import("@/lib/telegram/bot");
  const bot = await initBot();
  await bot.api.sendMessage(chatId, message, { parse_mode: "HTML" });
}

function getOwnerChatId(): string | null {
  const allowedUserIds = process.env.TELEGRAM_ALLOWED_USER_IDS;

  if (!allowedUserIds) {
    return null;
  }

  const chatId = allowedUserIds.split(",")[0]?.trim();
  return chatId || null;
}

function getChannelId(): string | null {
  return process.env.TELEGRAM_CHANNEL_ID || null;
}

export class TelegramBotNotifier implements TelegramNotifier {
  async notifyByteCreated(byte: Byte): Promise<void> {
    const channelId = getChannelId();

    if (!channelId) {
      return;
    }

    await sendMessage(channelId, formatByteChannelMessage(byte));
  }

  async notifyBlipCreated(blip: Blip): Promise<void> {
    const channelId = getChannelId();

    if (!channelId) {
      return;
    }

    await sendMessage(channelId, formatBlipChannelMessage(blip));
  }

  async notifyVisitor(visitor: VisitorNotificationPayload, referrer?: string): Promise<void> {
    const ownerChatId = getOwnerChatId();

    if (!ownerChatId) {
      return;
    }

    await sendMessage(ownerChatId, formatVisitorNotification(visitor, referrer));
  }

  async notifyBloqPublished(bloq: BloqNotificationPayload): Promise<void> {
    const channelId = getChannelId();

    if (!channelId) {
      return;
    }

    await sendMessage(channelId, formatBloqChannelMessage(bloq));
  }

  async notifyViewIncrement(counter: CounterNotificationPayload): Promise<void> {
    const ownerChatId = getOwnerChatId();

    if (!ownerChatId) {
      return;
    }

    await sendMessage(ownerChatId, formatViewIncrementNotification(counter));
  }

  async notifyClapIncrement(counter: CounterNotificationPayload): Promise<void> {
    const ownerChatId = getOwnerChatId();

    if (!ownerChatId) {
      return;
    }

    await sendMessage(ownerChatId, formatClapIncrementNotification(counter));
  }
}

export const telegramNotifier = new TelegramBotNotifier();

