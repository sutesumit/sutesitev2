import type { BloqNotificationPayload, TelegramNotifier } from "@/lib/notifications/types";
import { ValidationError } from "@/lib/core/errors";

export function createBloqNotificationService(notifier: TelegramNotifier) {
  return {
    async notifyBloqPublished(input: BloqNotificationPayload): Promise<void> {
      if (!input.title.trim()) {
        throw new ValidationError("Title is required");
      }

      if (!input.slug.trim()) {
        throw new ValidationError("Slug is required");
      }

      await notifier.notifyBloqPublished({
        title: input.title.trim(),
        slug: input.slug.trim(),
        tags: input.tags ?? [],
      });
    },
  };
}
