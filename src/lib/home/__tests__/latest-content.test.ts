import { beforeEach, describe, expect, it, vi } from "vitest";

const { getRecentPosts, getBytes, getBlips } = vi.hoisted(() => ({
  getRecentPosts: vi.fn(),
  getBytes: vi.fn(),
  getBlips: vi.fn(),
}));

vi.mock("@/lib/bloq", () => ({
  getRecentPosts,
}));

vi.mock("@/lib/byte", () => ({
  getBytes,
}));

vi.mock("@/lib/blip", () => ({
  getBlips,
}));

import { getLatestContentSummary } from "../latest-content";

describe("getLatestContentSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the newest bloq, byte, and blip in a stable shape", async () => {
    getRecentPosts.mockReturnValueOnce([{ title: "Bloq", url: "bloq-slug" }]);
    getBytes.mockResolvedValueOnce({
      data: [{ id: "1", byte_serial: "001", content: "Byte", created_at: "2026-03-28T00:00:00Z" }],
    });
    getBlips.mockResolvedValueOnce({
      data: [{
        id: "1",
        blip_serial: "B001",
        term: "Blip",
        meaning: "Meaning",
        tags: [],
        created_at: "2026-03-28T00:00:00Z",
        updated_at: "2026-03-28T00:00:00Z",
      }],
    });

    const result = await getLatestContentSummary();

    expect(result.latestBloq).toEqual({ title: "Bloq", url: "bloq-slug" });
    expect(result.latestByte?.byte_serial).toBe("001");
    expect(result.latestBlip?.blip_serial).toBe("B001");
  });

  it("gracefully handles missing content", async () => {
    getRecentPosts.mockReturnValueOnce([]);
    getBytes.mockResolvedValueOnce({ data: [] });
    getBlips.mockResolvedValueOnce({ data: [] });

    const result = await getLatestContentSummary();

    expect(result).toEqual({
      latestBloq: null,
      latestByte: null,
      latestBlip: null,
    });
  });
});
