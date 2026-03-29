import { telegramNotifier } from "@/lib/notifications/telegram-notifier";
import { composeContentMutationEffects } from "./effects";
import { homepageMutationEffect } from "./homepage-effect";
import { createTelegramMutationEffect } from "./telegram-effect";

export type { ContentMutationEffect, ContentMutationEvent } from "./types";
export { noopContentMutationEffect } from "./types";
export { composeContentMutationEffects } from "./effects";
export { createTelegramMutationEffect } from "./telegram-effect";
export { homepageMutationEffect } from "./homepage-effect";

export const contentMutationEffects = composeContentMutationEffects([
  createTelegramMutationEffect(telegramNotifier),
  homepageMutationEffect,
]);

// Backwards-compatible export while callers move to the mutation-focused name.
export const contentPublishEffects = contentMutationEffects;
