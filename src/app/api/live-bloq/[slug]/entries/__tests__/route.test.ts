import { describe, expect, it, vi, beforeEach } from "vitest";
import { mockLiveBloqService } from "@/test/mocks/live-bloq";

vi.mock("@/lib/live-bloq", () => ({
  liveBloqService: mockLiveBloqService,
}));

vi.mock("@/lib/live-bloq/repository", () => ({
  getSessionBySlug: vi.fn(),
}));

import { getSessionBySlug } from "@/lib/live-bloq/repository";
import { GET } from "../route";

function createRequest(url: string): Request {
  return new Request(`http://localhost:3000${url}`);
}

describe("GET /api/live-bloq/[slug]/entries", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns entries with sequence > after", async () => {
    vi.mocked(getSessionBySlug).mockResolvedValueOnce({
      id: "s1",
      slug: "test",
      status: "active",
    } as never);
    vi.mocked(mockLiveBloqService.getSession).mockResolvedValueOnce({
      id: "s1", slug: "test", status: "active",
    } as never);
    vi.mocked(mockLiveBloqService.getEntriesAfter).mockResolvedValueOnce([
      { id: "e2", session_id: "s1", content: "New entry", sequence: 2, created_at: "2026-07-01T10:02:00Z" },
    ] as never);

    const req = createRequest("/api/live-bloq/test/entries?after=1");
    const res = await GET(req, { params: Promise.resolve({ slug: "test" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.entries).toHaveLength(1);
    expect(body.entries[0].content).toBe("New entry");
    expect(body.sessionStatus).toBe("active");
  });

  it("defaults after to 0 when not provided", async () => {
    vi.mocked(getSessionBySlug).mockResolvedValueOnce({
      id: "s1",
      slug: "test",
      status: "active",
    } as never);
    vi.mocked(mockLiveBloqService.getSession).mockResolvedValueOnce({ id: "s1", slug: "test", status: "active" } as never);
    vi.mocked(mockLiveBloqService.getEntriesAfter).mockResolvedValueOnce([] as never);

    const req = createRequest("/api/live-bloq/test/entries");
    const res = await GET(req, { params: Promise.resolve({ slug: "test" }) });

    expect(res.status).toBe(200);
    expect(vi.mocked(mockLiveBloqService.getEntriesAfter)).toHaveBeenCalledWith("s1", 0);
  });

  it("returns 404 if session not found", async () => {
    vi.mocked(getSessionBySlug).mockResolvedValueOnce(null as never);
    vi.mocked(mockLiveBloqService.getSession).mockResolvedValueOnce(null as never);

    const req = createRequest("/api/live-bloq/nonexistent/entries");
    const res = await GET(req, { params: Promise.resolve({ slug: "nonexistent" }) });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns cancelled status so client stops polling", async () => {
    vi.mocked(getSessionBySlug).mockResolvedValueOnce({
      id: "s1",
      slug: "test",
      status: "cancelled",
    } as never);
    vi.mocked(mockLiveBloqService.getSession).mockResolvedValueOnce({ id: "s1", slug: "test", status: "cancelled" } as never);
    vi.mocked(mockLiveBloqService.getEntriesAfter).mockResolvedValueOnce([] as never);

    const req = createRequest("/api/live-bloq/test/entries?after=0");
    const res = await GET(req, { params: Promise.resolve({ slug: "test" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessionStatus).toBe("cancelled");
    expect(body.entries).toHaveLength(0);
  });

  it("returns closed status", async () => {
    vi.mocked(getSessionBySlug).mockResolvedValueOnce({
      id: "s1",
      slug: "test",
      status: "closed",
    } as never);
    vi.mocked(mockLiveBloqService.getSession).mockResolvedValueOnce({ id: "s1", slug: "test", status: "closed" } as never);
    vi.mocked(mockLiveBloqService.getEntriesAfter).mockResolvedValueOnce([] as never);

    const req = createRequest("/api/live-bloq/test/entries?after=0");
    const res = await GET(req, { params: Promise.resolve({ slug: "test" }) });

    const body = await res.json();
    expect(body.sessionStatus).toBe("closed");
  });

  it("returns empty entries array when no new entries", async () => {
    vi.mocked(getSessionBySlug).mockResolvedValueOnce({
      id: "s1",
      slug: "test",
      status: "active",
    } as never);
    vi.mocked(mockLiveBloqService.getSession).mockResolvedValueOnce({ id: "s1", slug: "test", status: "active" } as never);
    vi.mocked(mockLiveBloqService.getEntriesAfter).mockResolvedValueOnce([] as never);

    const req = createRequest("/api/live-bloq/test/entries?after=5");
    const res = await GET(req, { params: Promise.resolve({ slug: "test" }) });

    const body = await res.json();
    expect(body.entries).toHaveLength(0);
    expect(body.sessionStatus).toBe("active");
  });

  it("handles service errors with 500", async () => {
    vi.mocked(getSessionBySlug).mockRejectedValueOnce(new Error("DB down") as never);
    vi.mocked(mockLiveBloqService.getSession).mockRejectedValueOnce(new Error("DB down"));

    const req = createRequest("/api/live-bloq/test/entries");
    const res = await GET(req, { params: Promise.resolve({ slug: "test" }) });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to fetch entries");
  });
});
