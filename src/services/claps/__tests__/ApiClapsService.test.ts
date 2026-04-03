import { describe, expect, it, vi, beforeEach } from "vitest";
import { ApiClapsService } from "../ApiClapsService";

describe("ApiClapsService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends optional ip metadata with clap increments", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        userClaps: 1,
        totalClaps: 2,
        maxReached: false,
      }),
    } as Response);

    const service = new ApiClapsService();
    await service.incrementClap("bloq", "test-post", "fingerprint-1", "1.2.3.4");

    expect(fetchSpy).toHaveBeenCalledWith("/api/claps/bloq/test-post", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ fingerprint: "fingerprint-1", ip: "1.2.3.4" }),
    }));
  });
});
