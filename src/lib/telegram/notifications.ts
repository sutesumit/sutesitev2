import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function notifyVisitor(visitor: { city?: string; country?: string; region?: string; ip?: string }, referrer?: string): Promise<void> {
  console.log("[Telegram] notifyVisitor called", { visitor, referrer });

  const allowedUserIds = process.env.TELEGRAM_ALLOWED_USER_IDS;
  console.log("[Telegram] TELEGRAM_ALLOWED_USER_IDS:", allowedUserIds);

  if (!allowedUserIds) {
    return;
  }

  const userIds = allowedUserIds.split(',').map(id => id.trim());
  const chatId = userIds[0];
  console.log("[Telegram] chatId being used:", chatId);

  if (!chatId) {
    return;
  }

  try {
    const { initBot } = await import('./bot');
    const { replies } = await import('./replies');
    
    const bot = await initBot();
    await bot.api.sendMessage(
      chatId,
      replies.visitorNotification(visitor, referrer),
      { parse_mode: "HTML" }
    );
    console.log("[Telegram] Notification sent successfully");
  } catch (error) {
    console.error("[Telegram] Failed to notify owner:", error);
  }
}
