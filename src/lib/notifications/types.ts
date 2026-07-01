import type { Blip } from "@/types/blip";
import type { Byte } from "@/types/byte";
import type { LiveSession } from "@/lib/live-bloq/types";

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

export type CounterNotificationContentType = "bloq" | "blip" | "byte" | "project";

export type CounterNotificationPayload = {
  contentType: CounterNotificationContentType;
  contentId: string;
  displayId?: string | null;
  title: string | null;
  total: number;
  ip?: string | null;
};

export interface TelegramNotifier {
  notifyByteCreated(byte: Byte): Promise<void>;
  notifyBlipCreated(blip: Blip): Promise<void>;
  notifyVisitor(visitor: VisitorNotificationPayload, referrer?: string): Promise<void>;
  notifyBloqPublished(bloq: BloqNotificationPayload): Promise<void>;
  notifyLiveBloqStarted(liveBloq: LiveSession): Promise<void>;
  notifyViewIncrement(counter: CounterNotificationPayload): Promise<void>;
  notifyClapIncrement(counter: CounterNotificationPayload): Promise<void>;
}

export const noopTelegramNotifier: TelegramNotifier = {
  async notifyByteCreated(): Promise<void> {},
  async notifyBlipCreated(): Promise<void> {},
  async notifyVisitor(): Promise<void> {},
  async notifyBloqPublished(): Promise<void> {},
  async notifyLiveBloqStarted(): Promise<void> {},
  async notifyViewIncrement(): Promise<void> {},
  async notifyClapIncrement(): Promise<void> {},
};
