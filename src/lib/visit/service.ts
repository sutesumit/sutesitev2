import { supabase } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { TelegramNotifier } from "@/lib/notifications/types";

export type VisitRequestPayload = {
  ip?: string;
  network?: string;
  city?: string;
  region?: string;
  country_code?: string;
  postal?: string;
  latitude?: number;
  longitude?: number;
  org?: string;
  timezone?: string;
  referrer?: string;
};

export type VisitSummary = {
  lastVisitorLocation: string | null;
  lastVisitTime: string | null;
  visitorCount: number | null;
};

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

export function createVisitService(notifier: TelegramNotifier) {
  return {
    async trackVisit(body: VisitRequestPayload, userAgent: string | null): Promise<VisitSummary> {
      const deviceType = parseDeviceType(userAgent);

      if (body.ip) {
        const visitorData = {
          ip: body.ip,
          network: body.network,
          city: body.city || null,
          region: body.region || null,
          country: body.country_code || null,
          postal: body.postal || null,
          latitude: body.latitude || null,
          longitude: body.longitude || null,
          org: body.org || null,
          timezone: body.timezone || null,
        };

        const { data: existingVisits } = await supabase
          .from("visits")
          .select("id")
          .eq("ip", body.ip);

        const isReturning = (existingVisits?.length ?? 0) > 0;
        const visitCount = (existingVisits?.length ?? 0) + 1;

        await supabase
          .from("visits")
          .insert([visitorData]);

        const timestamp = new Date().toISOString();

        void notifier.notifyVisitor(
          {
            city: body.city,
            country: body.country_code,
            region: body.region,
            ip: body.ip,
            deviceType,
            isReturning,
            visitCount,
            timestamp,
          },
          body.referrer
        ).catch((error: unknown) => {
          console.error("Visitor notification error:", error);
        });
      }

      const queryClient = getSupabaseServerClient();
      let query = queryClient
        .from("visits")
        .select("ip, city, country, created_at")
        .order("created_at", { ascending: false });

      if (body.ip) {
        query = query.neq("ip", body.ip);
      }

      const { data: prevVisits, error: fetchError } = await query.limit(1);

      if (fetchError) {
        throw fetchError;
      }

      const { data: uniqueCount } = await queryClient.rpc("get_unique_visitor_count");
      const lastVisitor = prevVisits?.[0] ?? null;

      return {
        lastVisitorLocation: lastVisitor ? `${lastVisitor.city}, ${lastVisitor.country}` : null,
        lastVisitTime: lastVisitor?.created_at ?? null,
        visitorCount: uniqueCount ?? null,
      };
    },
  };
}
