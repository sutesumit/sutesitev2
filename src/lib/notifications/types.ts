import type { Blip } from "@/types/blip";
import type { Byte } from "@/types/byte";

 export type VisitorNotificationPayload = {
          city?: string;
          country?: string;
          region?: string;
          ip?: string;
          deviceType?: string;
          isReturning?: boolean;
          visitCount?: number;
          timestamp?: string;
        };

export type BloqNotificationPayload = {
  title: string;
  slug: string;
  tags?: string[];
};

export interface TelegramNotifier {
  notifyByteCreated(byte: Byte): Promise<void>;
  notifyBlipCreated(blip: Blip): Promise<void>;
  notifyVisitor(visitor: VisitorNotificationPayload, referrer?: string): Promise<void>;
  notifyBloqPublished(bloq: BloqNotificationPayload): Promise<void>;
}

export const noopTelegramNotifier: TelegramNotifier = {
  async notifyByteCreated(): Promise<void> {},
  async notifyBlipCreated(): Promise<void> {},
  async notifyVisitor(): Promise<void> {},
  async notifyBloqPublished(): Promise<void> {},
};

