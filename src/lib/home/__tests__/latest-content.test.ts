import { beforeEach, describe, expect, it, vi } from "vitest";

const { getRecentPosts, getBytes, getBlips, listSessions, liveSessionToBloqPost } = vi.hoisted(() => ({
  getRecentPosts: vi.fn(),
  getBytes: vi.fn(),
  getBlips: vi.fn(),
  listSessions: vi.fn(),
  liveSessionToBloqPost: vi.fn(),
}));

// Mock live-bloq repository and conversion
vi.mock("@/lib/live-bloq/repository", () => ({
  listSessions,
}));
vi.mock("@/lib/live-bloq", () => ({
  liveSessionToBloqPost,
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
    getRecentPosts.mockReturnValueOnce([{ title: "Bloq", url: "bloq-slug", publishedAt: "2025-01-01T00:00:00Z" }]);
    listSessions.mockResolvedValueOnce([]);
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

    expect(result.latestBloq).toEqual({ title: "Bloq", url: "bloq-slug", publishedAt: "2025-01-01T00:00:00Z" });
    expect(result.latestByte?.byte_serial).toBe("001");
    expect(result.latestBlip?.blip_serial).toBe("B001");
  });

  it("gracefully handles missing content", async () => {
    getRecentPosts.mockReturnValueOnce([]);
    listSessions.mockResolvedValueOnce([]);
    getBytes.mockResolvedValueOnce({ data: [] });
    getBlips.mockResolvedValueOnce({ data: [] });

    const result = await getLatestContentSummary();

    expect(result).toEqual({
      latestBloq: null,
      latestByte: null,
      latestBlip: null,
    });
  });

  it("returns live bloq when it is more recent than static bloq", async () => {
    getRecentPosts.mockReturnValueOnce([{ title: "Static", url: "static-slug", publishedAt: "2025-01-01T00:00:00Z" }]);
    listSessions.mockResolvedValueOnce([{ id: "1", started_at: "2026-01-01T00:00:00Z" }]);
    liveSessionToBloqPost.mockReturnValueOnce({ title: "Live", url: "live-slug", publishedAt: "2026-01-01T00:00:00Z" });
    getBytes.mockResolvedValueOnce({ data: [] });
    getBlips.mockResolvedValueOnce({ data: [] });

    const result = await getLatestContentSummary();

    expect(result.latestBloq).toEqual({ title: "Live", url: "live-slug", publishedAt: "2026-01-01T00:00:00Z" });
  });

  it("returns static bloq when live session processing throws", async () => {
    getRecentPosts.mockReturnValueOnce([{ title: "Static", url: "static-slug", publishedAt: "2025-01-01T00:00:00Z" }]);
    listSessions.mockResolvedValueOnce([{ id: "1", started_at: "2026-01-01T00:00:00Z" }]);
    liveSessionToBloqPost.mockImplementationOnce(() => {
      throw new Error("Conversion failed");
    });
    getBytes.mockResolvedValueOnce({ data: [] });
    getBlips.mockResolvedValueOnce({ data: [] });

    const result = await getLatestContentSummary();

    expect(result.latestBloq).toEqual({ title: "Static", url: "static-slug", publishedAt: "2025-01-01T00:00:00Z" });
  });
});
