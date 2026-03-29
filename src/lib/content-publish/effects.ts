import type { ContentMutationEffect, ContentMutationEvent } from "./types";

export function composeContentMutationEffects(
  effects: ContentMutationEffect[]
): ContentMutationEffect {
  return {
    async onMutation(event: ContentMutationEvent): Promise<void> {
      for (const effect of effects) {
        await effect.onMutation(event);
      }
    },
  };
}
