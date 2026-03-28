import type { BloqNotificationPayload } from "@/lib/notifications/types";
import { ValidationError } from "@/lib/core/errors";
import type { ContentPublishEffect } from "@/lib/content-publish/types";

export function createBloqNotificationService(publishEffect: ContentPublishEffect) {
  return {
    async notifyBloqPublished(input: BloqNotificationPayload): Promise<void> {
      if (!input.title.trim()) {
        throw new ValidationError("Title is required");
      }

      if (!input.slug.trim()) {
        throw new ValidationError("Slug is required");
      }

      await publishEffect.onPublished({
        type: "bloq",
        bloq: {
        title: input.title.trim(),
        slug: input.slug.trim(),
        tags: input.tags ?? [],
        },
      });
    },
  };
}
