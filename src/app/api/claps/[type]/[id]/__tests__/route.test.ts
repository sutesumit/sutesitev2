import { beforeEach, describe, expect, it, vi } from "vitest";

const createMockSupabase = () => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    rpc: vi.fn(),
  })),
  rpc: vi.fn(),
});

const supabaseMock = createMockSupabase();
const {
  telegramNotifierMock,
  resolveNotificationContentSummaryMock,
} = vi.hoisted(() => ({
  telegramNotifierMock: {
    notifyClapIncrement: vi.fn().mockResolvedValue(undefined),
  },
  resolveNotificationContentSummaryMock: vi.fn(),
}));

vi.mock("@/lib/supabaseServerClient", () => ({
  getSupabaseServerClient: vi.fn(() => supabaseMock),
}));

vi.mock("@/lib/bloq", () => ({
  getBloqPostBySlug: vi.fn(),
}));

vi.mock("@/lib/notifications/telegram-notifier", () => ({
  telegramNotifier: telegramNotifierMock,
}));

vi.mock("@/lib/notifications/content-summary", () => ({
  resolveNotificationContentSummary: resolveNotificationContentSummaryMock,
}));

import { GET, POST } from "../route";

describe("/api/claps/[type]/[id] GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveNotificationContentSummaryMock.mockResolvedValue({
      contentType: "bloq",
      contentId: "test-post",
      displayId: "test-post",
      title: "Test Post",
    });
  });

  it("returns claps for bloq type", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue({
      slug: "test-post",
      title: "Test Post",
    } as unknown as { slug: string; title: string });

    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({
      data: { claps: 10 },
      error: null,
    });

    const response = await GET(new Request("http://localhost/api/claps/bloq/test-post"), {
      params: Promise.resolve({ type: "bloq", id: "test-post" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ claps: 10, userClaps: 0 });
  });

  it("returns claps for blip type", async () => {
    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({
      data: { claps: 5 },
      error: null,
    });

    const response = await GET(new Request("http://localhost/api/claps/blip/001"), {
      params: Promise.resolve({ type: "blip", id: "001" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ claps: 5, userClaps: 0 });
  });

  it("returns claps for byte type", async () => {
    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({
      data: { claps: 3 },
      error: null,
    });

    const response = await GET(new Request("http://localhost/api/claps/byte/001"), {
      params: Promise.resolve({ type: "byte", id: "001" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ claps: 3, userClaps: 0 });
  });

  it("returns claps with fingerprint for user claps", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue({
      slug: "test-post",
      title: "Test Post",
    } as unknown as { slug: string; title: string });

    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({
      data: { total_claps: 10, user_claps: 2 },
      error: null,
    });

    const response = await GET(
      new Request("http://localhost/api/claps/bloq/test-post?fingerprint=abc123"),
      { params: Promise.resolve({ type: "bloq", id: "test-post" }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ claps: 10, userClaps: 2 });
  });

  it("returns 400 for invalid type", async () => {
    const response = await GET(new Request("http://localhost/api/claps/invalid/123"), {
      params: Promise.resolve({ type: "invalid", id: "123" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "Invalid post type. Must be 'bloq', 'blip', 'byte', or 'project'" });
  });

  it("returns 404 for non-existent bloq post", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue(undefined);

    const response = await GET(new Request("http://localhost/api/claps/bloq/non-existent"), {
      params: Promise.resolve({ type: "bloq", id: "non-existent" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Post not found" });
  });

  it("returns 500 on RPC error", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue({
      slug: "test-post",
      title: "Test Post",
    } as unknown as { slug: string; title: string });

    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({
      data: null,
      error: { message: "RPC error" },
    });

    const response = await GET(new Request("http://localhost/api/claps/bloq/test-post"), {
      params: Promise.resolve({ type: "bloq", id: "test-post" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "RPC error" });
  });
});

describe("/api/claps/[type]/[id] POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveNotificationContentSummaryMock.mockResolvedValue({
      contentType: "bloq",
      contentId: "test-post",
      displayId: "test-post",
      title: "Test Post",
    });
  });

  it("increments clap for bloq type", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue({
      slug: "test-post",
      title: "Test Post",
    } as unknown as { slug: string; title: string });

    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({
      data: { user_claps: 1, total_claps: 11, max_reached: false },
      error: null,
    });

    const response = await POST(
      new Request("http://localhost/api/claps/bloq/test-post", {
        method: "POST",
        body: JSON.stringify({ fingerprint: "abc123", ip: "1.2.3.4" }),
      }),
      { params: Promise.resolve({ type: "bloq", id: "test-post" }) }
    );
    const payload = await response.json();
    await Promise.resolve();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ userClaps: 1, totalClaps: 11, maxReached: false });
    expect(resolveNotificationContentSummaryMock).toHaveBeenCalledWith("bloq", "test-post");
    expect(telegramNotifierMock.notifyClapIncrement).toHaveBeenCalledWith({
      contentType: "bloq",
      contentId: "test-post",
      displayId: "test-post",
      title: "Test Post",
      total: 11,
      ip: "1.2.3.4",
    });
  });

  it("increments clap for blip type", async () => {
    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({
      data: { user_claps: 1, total_claps: 6, max_reached: false },
      error: null,
    });

    const response = await POST(
      new Request("http://localhost/api/claps/blip/001", {
        method: "POST",
        body: JSON.stringify({ fingerprint: "abc123" }),
      }),
      { params: Promise.resolve({ type: "blip", id: "001" }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ userClaps: 1, totalClaps: 6, maxReached: false });
  });

  it("increments clap for byte type", async () => {
    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({
      data: { user_claps: 1, total_claps: 4, max_reached: false },
      error: null,
    });

    const response = await POST(
      new Request("http://localhost/api/claps/byte/001", {
        method: "POST",
        body: JSON.stringify({ fingerprint: "abc123" }),
      }),
      { params: Promise.resolve({ type: "byte", id: "001" }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ userClaps: 1, totalClaps: 4, maxReached: false });
  });

  it("returns 400 when fingerprint is missing", async () => {
    const response = await POST(
      new Request("http://localhost/api/claps/bloq/test-post", {
        method: "POST",
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ type: "bloq", id: "test-post" }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "Fingerprint required" });
  });

  it("returns 400 when fingerprint is invalid type", async () => {
    const response = await POST(
      new Request("http://localhost/api/claps/bloq/test-post", {
        method: "POST",
        body: JSON.stringify({ fingerprint: 123 }),
      }),
      { params: Promise.resolve({ type: "bloq", id: "test-post" }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "Fingerprint required" });
  });

  it("returns 400 for invalid type", async () => {
    const response = await POST(
      new Request("http://localhost/api/claps/invalid/123", {
        method: "POST",
        body: JSON.stringify({ fingerprint: "abc123" }),
      }),
      { params: Promise.resolve({ type: "invalid", id: "123" }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "Invalid post type. Must be 'bloq', 'blip', 'byte', or 'project'" });
  });

  it("returns 404 for non-existent bloq post", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue(undefined);

    const response = await POST(
      new Request("http://localhost/api/claps/bloq/non-existent", {
        method: "POST",
        body: JSON.stringify({ fingerprint: "abc123" }),
      }),
      { params: Promise.resolve({ type: "bloq", id: "non-existent" }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Post not found" });
  });

  it("returns maxReached when user hits clap limit", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue({
      slug: "test-post",
      title: "Test Post",
    } as unknown as { slug: string; title: string });

    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({
      data: { user_claps: 5, total_claps: 15, max_reached: true },
      error: null,
    });

    const response = await POST(
      new Request("http://localhost/api/claps/bloq/test-post", {
        method: "POST",
        body: JSON.stringify({ fingerprint: "abc123" }),
      }),
      { params: Promise.resolve({ type: "bloq", id: "test-post" }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ userClaps: 5, totalClaps: 15, maxReached: true });
  });

  it("returns 500 on RPC error", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue({
      slug: "test-post",
      title: "Test Post",
    } as unknown as { slug: string; title: string });

    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({
      data: null,
      error: { message: "RPC error" },
    });

    const response = await POST(
      new Request("http://localhost/api/claps/bloq/test-post", {
        method: "POST",
        body: JSON.stringify({ fingerprint: "abc123" }),
      }),
      { params: Promise.resolve({ type: "bloq", id: "test-post" }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "RPC error" });
  });

  it("returns success when notification resolution fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    resolveNotificationContentSummaryMock.mockRejectedValueOnce(new Error("Resolver failed"));
    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({
      data: { user_claps: 1, total_claps: 11, max_reached: false },
      error: null,
    });

    const response = await POST(
      new Request("http://localhost/api/claps/bloq/test-post", {
        method: "POST",
        body: JSON.stringify({ fingerprint: "abc123" }),
      }),
      { params: Promise.resolve({ type: "bloq", id: "test-post" }) }
    );
    const payload = await response.json();
    await Promise.resolve();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ userClaps: 1, totalClaps: 11, maxReached: false });
    expect(consoleError).toHaveBeenCalledWith("Clap notification error:", expect.any(Error));

    consoleError.mockRestore();
  });

  it("returns success when notifier send fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    telegramNotifierMock.notifyClapIncrement.mockRejectedValueOnce(new Error("Telegram down"));
    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({
      data: { user_claps: 1, total_claps: 11, max_reached: false },
      error: null,
    });

    const response = await POST(
      new Request("http://localhost/api/claps/bloq/test-post", {
        method: "POST",
        body: JSON.stringify({ fingerprint: "abc123" }),
      }),
      { params: Promise.resolve({ type: "bloq", id: "test-post" }) }
    );
    const payload = await response.json();
    await Promise.resolve();
    await Promise.resolve();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ userClaps: 1, totalClaps: 11, maxReached: false });
    expect(consoleError).toHaveBeenCalledWith("Clap notification error:", expect.any(Error));

    consoleError.mockRestore();
  });
});

describe("/api/claps/[type]/[id] error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles invalid JSON body gracefully", async () => {
    const response = await POST(
      new Request("http://localhost/api/claps/bloq/test-post", {
        method: "POST",
        body: "invalid json",
      }),
      { params: Promise.resolve({ type: "bloq", id: "test-post" }) }
    );

    const payload = await response.json();
    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "Fingerprint required" });
  });

  it("handles thrown errors in GET", async () => {
    vi.mocked(supabaseMock.rpc).mockRejectedValueOnce(new Error("Database connection failed"));

    const response = await GET(new Request("http://localhost/api/claps/blip/001"), {
      params: Promise.resolve({ type: "blip", id: "001" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Database connection failed");
  });

  it("handles thrown errors in POST", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue({
      slug: "test-post",
      title: "Test Post",
    } as unknown as { slug: string; title: string });

    vi.mocked(supabaseMock.rpc).mockRejectedValueOnce(new Error("Database connection failed"));

    const response = await POST(
      new Request("http://localhost/api/claps/bloq/test-post", {
        method: "POST",
        body: JSON.stringify({ fingerprint: "abc123" }),
      }),
      { params: Promise.resolve({ type: "bloq", id: "test-post" }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Database connection failed");
  });

  it("handles unknown error type in GET", async () => {
    vi.mocked(supabaseMock.rpc).mockRejectedValueOnce("string error");

    const response = await GET(new Request("http://localhost/api/claps/byte/001"), {
      params: Promise.resolve({ type: "byte", id: "001" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Unknown error");
  });
});
