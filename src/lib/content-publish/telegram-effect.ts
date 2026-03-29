import type { ContentMutationEffect, ContentMutationEvent } from "./types";
import type { TelegramNotifier } from "@/lib/notifications/types";

export function createTelegramMutationEffect(
  notifier: TelegramNotifier
): ContentMutationEffect {
  return {
    async onMutation(event: ContentMutationEvent): Promise<void> {
      if (event.action !== "published") {
        return;
      }

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
