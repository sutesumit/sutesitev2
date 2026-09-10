import { SITE_URL } from "@/config/metadata";
import type { ContentMutationEffect, ContentMutationEvent } from "./types";
import type { TelegramNotifier } from "@/lib/notifications/types";

const WARM_UP_ATTEMPTS = 2;
const WARM_UP_BACKOFF_MS = 1500;
const WARM_UP_FETCH_TIMEOUT_MS = 5000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function warmOgImage(pathSegment: string): Promise<boolean> {
  const normalized = pathSegment.startsWith("/")
    ? pathSegment.slice(1)
    : pathSegment;
  const url = `${SITE_URL}/og/${normalized}`;

  for (let attempt = 1; attempt <= WARM_UP_ATTEMPTS; attempt++) {
    const warmed = await fetch(url, {
      signal: AbortSignal.timeout(WARM_UP_FETCH_TIMEOUT_MS),
    })
      .then((response) => response.ok)
      .catch(() => false);
    if (warmed) {
      return true;
    }
    if (attempt < WARM_UP_ATTEMPTS) {
      await sleep(WARM_UP_BACKOFF_MS);
    }
  }

  return false;
}

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

      if (event.type === "live-bloq") {
        await warmOgImage(`live/${event.liveBloq.slug}`);
        await notifier.notifyLiveBloqStarted(event.liveBloq);
        return;
      }

      await notifier.notifyBloqPublished(event.bloq);
    },
  };
}
