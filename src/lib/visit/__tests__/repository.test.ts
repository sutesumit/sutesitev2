import { describe, expect, it, vi } from "vitest";
import { createSupabaseVisitRepository } from "../repository";

function createQueryChain(result: { data?: unknown; error?: unknown; count?: number }) {
  const limit = vi.fn().mockResolvedValue(result);
  const neq = vi.fn().mockReturnValue({ limit });
  const order = vi.fn().mockReturnValue({ limit, neq });
  return { order, limit, neq };
}

describe("SupabaseVisitRepository", () => {
  it("maps the upsert rpc result into visitor state", async () => {
    const client = {
      rpc: vi.fn().mockResolvedValue({
      data: [{
          out_ip: "49.204.148.221",
          out_network: "49.204.0.0/16",
          out_city: "Vijayawada",
          out_region: "Andhra Pradesh",
          out_country: "IN",
          out_postal: "520001",
          out_latitude: 16.5062,
          out_longitude: 80.648,
          out_org: "ISP",
          out_timezone: "Asia/Kolkata",
          out_visit_count: 520,
          out_first_seen_at: "2026-01-01T00:00:00.000Z",
          out_last_seen_at: "2026-03-30T10:00:00.000Z",
        }],
        error: null,
      }),
    };
    const repository = createSupabaseVisitRepository(client as never);

    const result = await repository.upsertVisitorState({
      ip: "49.204.148.221",
      city: "Vijayawada",
      country_code: "IN",
    });

    expect(client.rpc).toHaveBeenCalledWith("upsert_visit_state", expect.objectContaining({
      p_ip: "49.204.148.221",
      p_city: "Vijayawada",
      p_country: "IN",
    }));
    expect(result.visitCount).toBe(520);
    expect(result.country).toBe("IN");
  });

  it("queries the most recent visitor by last_seen_at and excludes the current ip", async () => {
    const chain = createQueryChain({
      data: [{
        ip: "1.1.1.1",
        city: "Bengaluru",
        country: "IN",
        last_seen_at: "2026-03-30T09:00:00.000Z",
      }],
      error: null,
    });
    const select = vi.fn().mockReturnValue(chain);
    const from = vi.fn().mockReturnValue({ select });
    const client = { from };
    const repository = createSupabaseVisitRepository(client as never);

    const result = await repository.getMostRecentVisitor("49.204.148.221");

    expect(from).toHaveBeenCalledWith("visits");
    expect(select).toHaveBeenCalledWith("ip, city, country, last_seen_at");
    expect(chain.order).toHaveBeenCalledWith("last_seen_at", { ascending: false });
    expect(chain.neq).toHaveBeenCalledWith("ip", "49.204.148.221");
    expect(result).toEqual({
      ip: "1.1.1.1",
      city: "Bengaluru",
      country: "IN",
      lastVisitTime: "2026-03-30T09:00:00.000Z",
    });
  });

  it("counts unique visitors from the compressed visits table", async () => {
    const select = vi.fn().mockResolvedValue({ count: 32, error: null });
    const from = vi.fn().mockReturnValue({ select });
    const client = { from };
    const repository = createSupabaseVisitRepository(client as never);

    const result = await repository.countUniqueVisitors();

    expect(from).toHaveBeenCalledWith("visits");
    expect(select).toHaveBeenCalledWith("ip", { count: "exact", head: true });
    expect(result).toBe(32);
  });
});
