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

export type VisitStateRecord = {
  ip: string;
  network: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  postal: string | null;
  latitude: number | null;
  longitude: number | null;
  org: string | null;
  timezone: string | null;
  visitCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type LastVisitorRecord = {
  ip: string;
  city: string | null;
  country: string | null;
  lastVisitTime: string;
};

export interface VisitRepository {
  upsertVisitorState(payload: VisitRequestPayload): Promise<VisitStateRecord>;
  getMostRecentVisitor(excludeIp?: string): Promise<LastVisitorRecord | null>;
  countUniqueVisitors(): Promise<number>;
}
