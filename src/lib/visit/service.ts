import type { TelegramNotifier } from "@/lib/notifications/types";
import { noopTelegramNotifier } from "@/lib/notifications/types";
import { telegramNotifier } from "@/lib/notifications/telegram-notifier";
import { createSupabaseVisitRepository } from "./repository";
import type { VisitRepository, VisitRequestPayload, VisitSummary } from "./types";

export function parseDeviceType(userAgent: string | null): string {
  if (!userAgent) return "Unknown";

  const ua = userAgent.toLowerCase();

  if (ua.includes("ipad")) return "iPad";
  if (ua.includes("iphone")) return "iPhone";
  if (ua.includes("macintosh") || ua.includes("mac os x")) return "Mac";

  if (ua.includes("android")) {
    if (ua.includes("tablet") || ua.includes("tab")) return "Android Tablet";
    return "Android";
  }

  if (ua.includes("windows")) return "Windows";
  if (ua.includes("linux")) return "Linux";
  if (ua.includes("cros") || ua.includes("chromebook")) return "Chromebook";
  if (ua.includes("mobile")) return "Mobile";

  return "Desktop";
}

function formatVisitorLocation(city: string | null, country: string | null): string | null {
  const parts = [city, country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

export function createVisitService(deps?: {
  repository?: VisitRepository;
  notifier?: TelegramNotifier;
  now?: () => Date;
}) {
  const repository = deps?.repository ?? createSupabaseVisitRepository();
  const notifier = deps?.notifier ?? noopTelegramNotifier;
  const now = deps?.now ?? (() => new Date());

  return {
    async trackVisit(body: VisitRequestPayload, userAgent: string | null): Promise<VisitSummary> {
      const deviceType = parseDeviceType(userAgent);

      if (body.ip) {
        const visitorState = await repository.upsertVisitorState(body);
        const timestamp = now().toISOString();

        void notifier.notifyVisitor(
          {
            city: visitorState.city ?? undefined,
            country: visitorState.country ?? undefined,
            region: visitorState.region ?? undefined,
            ip: visitorState.ip,
            deviceType,
            isReturning: visitorState.visitCount > 1,
            visitCount: visitorState.visitCount,
            timestamp,
          },
          body.referrer
        ).catch((error: unknown) => {
          console.error("Visitor notification error:", error);
        });
      }

      const [lastVisitor, uniqueCount] = await Promise.all([
        repository.getMostRecentVisitor(body.ip),
        repository.countUniqueVisitors(),
      ]);

      return {
        lastVisitorLocation: lastVisitor
          ? formatVisitorLocation(lastVisitor.city, lastVisitor.country)
          : null,
        lastVisitTime: lastVisitor?.lastVisitTime ?? null,
        visitorCount: uniqueCount,
      };
    },
  };
}

export const visitService = createVisitService({
  repository: createSupabaseVisitRepository(),
  notifier: telegramNotifier,
});
