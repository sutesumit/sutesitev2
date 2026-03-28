import { telegramNotifier } from "@/lib/notifications/telegram-notifier";
import { composeContentPublishEffects } from "./effects";
import { homepagePublishEffect } from "./homepage-effect";
import { createTelegramPublishEffect } from "./telegram-effect";

export type { ContentPublishEffect, PublishedContent } from "./types";
export { noopContentPublishEffect } from "./types";
export { composeContentPublishEffects } from "./effects";
export { createTelegramPublishEffect } from "./telegram-effect";
export { homepagePublishEffect } from "./homepage-effect";

export const contentPublishEffects = composeContentPublishEffects([
  createTelegramPublishEffect(telegramNotifier),
  homepagePublishEffect,
]);
