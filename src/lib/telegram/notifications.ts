import type { VisitorNotificationPayload } from "@/lib/notifications/types";
import { telegramNotifier } from "@/lib/notifications/telegram-notifier";

export async function notifyVisitor(
  visitor: VisitorNotificationPayload,
  referrer?: string
): Promise<void> {
  try {
    await telegramNotifier.notifyVisitor(visitor, referrer);
  } catch (error: unknown) {
    console.error("[Telegram] Failed to notify owner:", error);
  }
}
