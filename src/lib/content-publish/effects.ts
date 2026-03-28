import type { ContentPublishEffect, PublishedContent } from "./types";

export function composeContentPublishEffects(
  effects: ContentPublishEffect[]
): ContentPublishEffect {
  return {
    async onPublished(event: PublishedContent): Promise<void> {
      for (const effect of effects) {
        await effect.onPublished(event);
      }
    },
  };
}
