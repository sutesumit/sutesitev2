import type { Blip } from "@/types/blip";
import type { Byte } from "@/types/byte";
import type { BloqNotificationPayload } from "@/lib/notifications/types";

export type ContentMutationEvent =
  | { action: "published"; type: "byte"; byte: Byte }
  | { action: "updated"; type: "byte"; byte: Byte }
  | { action: "deleted"; type: "byte"; serial: string }
  | { action: "published"; type: "blip"; blip: Blip }
  | { action: "updated"; type: "blip"; blip: Blip }
  | { action: "deleted"; type: "blip"; serial: string }
  | { action: "published"; type: "bloq"; bloq: BloqNotificationPayload };

export interface ContentMutationEffect {
  onMutation(event: ContentMutationEvent): Promise<void>;
}

export const noopContentMutationEffect: ContentMutationEffect = {
  async onMutation(): Promise<void> {},
};
