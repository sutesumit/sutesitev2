import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type {
  LastVisitorRecord,
  VisitRepository,
  VisitRequestPayload,
  VisitStateRecord,
} from "./types";

type VisitStateRow = {
  out_ip: string;
  out_network: string | null;
  out_city: string | null;
  out_region: string | null;
  out_country: string | null;
  out_postal: string | null;
  out_latitude: number | null;
  out_longitude: number | null;
  out_org: string | null;
  out_timezone: string | null;
  out_visit_count: number;
  out_first_seen_at: string;
  out_last_seen_at: string;
};

type LastVisitorRow = {
  ip: string;
  city: string | null;
  country: string | null;
  last_seen_at: string;
};

function mapVisitState(row: VisitStateRow): VisitStateRecord {
  return {
    ip: row.out_ip,
    network: row.out_network,
    city: row.out_city,
    region: row.out_region,
    country: row.out_country,
    postal: row.out_postal,
    latitude: row.out_latitude,
    longitude: row.out_longitude,
    org: row.out_org,
    timezone: row.out_timezone,
    visitCount: row.out_visit_count,
    firstSeenAt: row.out_first_seen_at,
    lastSeenAt: row.out_last_seen_at,
  };
}

function mapLastVisitor(row: LastVisitorRow): LastVisitorRecord {
  return {
    ip: row.ip,
    city: row.city,
    country: row.country,
    lastVisitTime: row.last_seen_at,
  };
}

export function createSupabaseVisitRepository(client?: SupabaseClient): VisitRepository {
  const getClient = (): SupabaseClient => client ?? getSupabaseServerClient();

  return {
    async upsertVisitorState(payload: VisitRequestPayload): Promise<VisitStateRecord> {
      if (!payload.ip) {
        throw new Error("IP address is required to persist visitor state");
      }

      const supabase = getClient();
      const { data, error } = await supabase.rpc("upsert_visit_state", {
        p_ip: payload.ip,
        p_network: payload.network ?? null,
        p_city: payload.city ?? null,
        p_region: payload.region ?? null,
        p_country: payload.country_code ?? null,
        p_postal: payload.postal ?? null,
        p_latitude: payload.latitude ?? null,
        p_longitude: payload.longitude ?? null,
        p_org: payload.org ?? null,
        p_timezone: payload.timezone ?? null,
      });

      if (error) {
        throw error;
      }

      const row = (Array.isArray(data) ? data[0] : data) as VisitStateRow | null;

      if (!row) {
        throw new Error("Supabase did not return visitor state");
      }

      return mapVisitState(row);
    },

    async getMostRecentVisitor(excludeIp?: string): Promise<LastVisitorRecord | null> {
      const supabase = getClient();
      let query = supabase
        .from("visits")
        .select("ip, city, country, last_seen_at")
        .order("last_seen_at", { ascending: false });

      if (excludeIp) {
        query = query.neq("ip", excludeIp);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        throw error;
      }

      const row = (data?.[0] ?? null) as LastVisitorRow | null;
      return row ? mapLastVisitor(row) : null;
    },

    async countUniqueVisitors(): Promise<number> {
      const supabase = getClient();
      const { count, error } = await supabase
        .from("visits")
        .select("ip", { count: "exact", head: true });

      if (error) {
        throw error;
      }

      return count ?? 0;
    },
  };
}
