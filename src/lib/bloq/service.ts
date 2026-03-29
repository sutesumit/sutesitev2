import type { BloqNotificationPayload } from "@/lib/notifications/types";
import { ValidationError } from "@/lib/core/errors";
import type { ContentMutationEffect } from "@/lib/content-publish/types";

export function createBloqNotificationService(mutationEffect: ContentMutationEffect) {
  return {
    async notifyBloqPublished(input: BloqNotificationPayload): Promise<void> {
      if (!input.title.trim()) {
        throw new ValidationError("Title is required");
      }

      if (!input.slug.trim()) {
        throw new ValidationError("Slug is required");
      }

      await mutationEffect.onMutation({
        action: "published",
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
