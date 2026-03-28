import type { Blip } from "@/types/blip";
import type { Byte } from "@/types/byte";
import type { BloqNotificationPayload } from "@/lib/notifications/types";

export type PublishedContent =
  | { type: "byte"; byte: Byte }
  | { type: "blip"; blip: Blip }
  | { type: "bloq"; bloq: BloqNotificationPayload };

export interface ContentPublishEffect {
  onPublished(event: PublishedContent): Promise<void>;
}

export const noopContentPublishEffect: ContentPublishEffect = {
  async onPublished(): Promise<void> {},
};
