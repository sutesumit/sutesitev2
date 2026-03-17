import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

const MINUTE_1_MS = 60 * 1000;

export async function shouldNotifyVisitor(visitor: { ip?: string }): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('visits')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return true;
    }

    const lastVisit = new Date(data[0].created_at);
    const now = new Date();
    const timeDiff = now.getTime() - lastVisit.getTime();

    return timeDiff > MINUTE_1_MS;
  } catch {
    return true;
  }
}

export async function notifyVisitor(visitor: { city?: string; country?: string; region?: string; ip?: string }, referrer?: string): Promise<void> {
  const allowedUserIds = process.env.TELEGRAM_ALLOWED_USER_IDS;
  if (!allowedUserIds) {
    return;
  }

  const userIds = allowedUserIds.split(',').map(id => id.trim());
  const chatId = userIds[0];
  if (!chatId) {
    return;
  }

  const shouldNotify = await shouldNotifyVisitor(visitor);
  if (!shouldNotify) {
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
  } catch (error) {
    console.error("Failed to notify owner:", error);
  }
}
