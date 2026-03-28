import type { ContentPublishEffect, PublishedContent } from "./types";
import type { TelegramNotifier } from "@/lib/notifications/types";

export function createTelegramPublishEffect(
  notifier: TelegramNotifier
): ContentPublishEffect {
  return {
    async onPublished(event: PublishedContent): Promise<void> {
      if (event.type === "byte") {
        await notifier.notifyByteCreated(event.byte);
        return;
      }

      if (event.type === "blip") {
        await notifier.notifyBlipCreated(event.blip);
        return;
      }

      await notifier.notifyBloqPublished(event.bloq);
    },
  };
}
