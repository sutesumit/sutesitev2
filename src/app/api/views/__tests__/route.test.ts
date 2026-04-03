import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMock = {
  rpc: vi.fn(),
};

const {
  telegramNotifierMock,
  resolveNotificationContentSummaryMock,
} = vi.hoisted(() => ({
  telegramNotifierMock: {
    notifyViewIncrement: vi.fn().mockResolvedValue(undefined),
  },
  resolveNotificationContentSummaryMock: vi.fn(),
}));

vi.mock("@/lib/supabaseServerClient", () => ({
  getSupabaseServerClient: vi.fn(() => supabaseMock),
}));

vi.mock("@/lib/notifications/telegram-notifier", () => ({
  telegramNotifier: telegramNotifierMock,
}));

vi.mock("@/lib/notifications/content-summary", () => ({
  resolveNotificationContentSummary: resolveNotificationContentSummaryMock,
}));

import { GET, POST } from "../route";

const createRequest = (type?: string, id?: string, init?: RequestInit) => {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (id) params.set("id", id);
  return new Request(`http://localhost/api/views?${params.toString()}`, init);
};

describe("/api/views GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveNotificationContentSummaryMock.mockResolvedValue({
      contentType: "bloq",
      contentId: "test-post",
      displayId: "test-post",
      title: "Test Post",
    });
  });

  describe("validation", () => {
    it("returns 400 when type is missing", async () => {
      const response = await GET(createRequest(undefined, "test-id"));
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload).toEqual({ error: "type is required" });
    });

    it("returns 400 when id is missing", async () => {
      const response = await GET(createRequest("bloq", undefined));
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload).toEqual({ error: "id is required" });
    });

    it("returns 400 for invalid type", async () => {
      const response = await GET(createRequest("invalid", "test-id"));
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload).toEqual({ error: "Invalid type. Must be one of: bloq, blip, byte, project" });
    });
  });

  describe("bloq content type", () => {
    it("returns views for valid bloq", async () => {
      vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 42, error: null });

      const response = await GET(createRequest("bloq", "test-post"));
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ views: 42 });
      expect(supabaseMock.rpc).toHaveBeenCalledWith("get_content_view", {
        p_content_type: "bloq",
        p_identifier: "test-post",
      });
    });

    it("returns 0 when no views exist", async () => {
      vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: null, error: null });

      const response = await GET(createRequest("bloq", "new-post"));
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ views: 0 });
    });
  });

  describe("blip content type", () => {
    it("returns views for valid blip", async () => {
      vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 10, error: null });

      const response = await GET(createRequest("blip", "001"));
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ views: 10 });
      expect(supabaseMock.rpc).toHaveBeenCalledWith("get_content_view", {
        p_content_type: "blip",
        p_identifier: "001",
      });
    });
  });

  describe("byte content type", () => {
    it("returns views for valid byte", async () => {
      vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 5, error: null });

      const response = await GET(createRequest("byte", "001"));
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ views: 5 });
      expect(supabaseMock.rpc).toHaveBeenCalledWith("get_content_view", {
        p_content_type: "byte",
        p_identifier: "001",
      });
    });
  });

  describe("project content type", () => {
    it("returns views for valid project", async () => {
      vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 20, error: null });

      const response = await GET(createRequest("project", "test-project"));
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ views: 20 });
      expect(supabaseMock.rpc).toHaveBeenCalledWith("get_content_view", {
        p_content_type: "project",
        p_identifier: "test-project",
      });
    });
  });

  describe("error handling", () => {
    it("returns 500 on RPC error", async () => {
      vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: null, error: { message: "Database error" } });

      const response = await GET(createRequest("bloq", "test-post"));
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ error: "Database error" });
    });

    it("returns 500 on unexpected error", async () => {
      vi.mocked(supabaseMock.rpc).mockRejectedValueOnce(new Error("Network error"));

      const response = await GET(createRequest("bloq", "test-post"));
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ error: "Network error" });
    });

    it("returns 500 with unknown error message for non-Error throws", async () => {
      vi.mocked(supabaseMock.rpc).mockRejectedValueOnce("Something went wrong");

      const response = await GET(createRequest("bloq", "test-post"));
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ error: "Unknown error" });
    });
  });
});

describe("/api/views POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveNotificationContentSummaryMock.mockResolvedValue({
      contentType: "bloq",
      contentId: "test-post",
      displayId: "test-post",
      title: "Test Post",
    });
  });

  describe("validation", () => {
    it("returns 400 when type is missing", async () => {
      const response = await POST(createRequest(undefined, "test-id"));
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload).toEqual({ error: "type is required" });
    });

    it("returns 400 when id is missing", async () => {
      const response = await POST(createRequest("bloq", undefined));
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload).toEqual({ error: "id is required" });
    });

    it("returns 400 for invalid type", async () => {
      const response = await POST(createRequest("invalid", "test-id"));
      const payload = await response.json();

      expect(response.status).toBe(400);
      expect(payload).toEqual({ error: "Invalid type. Must be one of: bloq, blip, byte, project" });
    });
  });

  describe("bloq content type", () => {
    it("increments view count and returns new count", async () => {
      vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 43, error: null });

      const response = await POST(createRequest("bloq", "test-post", {
        method: "POST",
        body: JSON.stringify({ ip: "1.2.3.4" }),
      }));
      const payload = await response.json();
      await Promise.resolve();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ views: 43 });
      expect(supabaseMock.rpc).toHaveBeenCalledWith("increment_content_view", {
        p_content_type: "bloq",
        p_identifier: "test-post",
      });
      expect(resolveNotificationContentSummaryMock).toHaveBeenCalledWith("bloq", "test-post");
      expect(telegramNotifierMock.notifyViewIncrement).toHaveBeenCalledWith({
        contentType: "bloq",
        contentId: "test-post",
        displayId: "test-post",
        title: "Test Post",
        total: 43,
        ip: "1.2.3.4",
      });
    });
  });

  describe("blip content type", () => {
    it("increments view count and returns new count", async () => {
      vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 11, error: null });

      const response = await POST(createRequest("blip", "001"));
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ views: 11 });
      expect(supabaseMock.rpc).toHaveBeenCalledWith("increment_content_view", {
        p_content_type: "blip",
        p_identifier: "001",
      });
    });
  });

  describe("byte content type", () => {
    it("increments view count and returns new count", async () => {
      vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 6, error: null });

      const response = await POST(createRequest("byte", "001"));
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ views: 6 });
      expect(supabaseMock.rpc).toHaveBeenCalledWith("increment_content_view", {
        p_content_type: "byte",
        p_identifier: "001",
      });
    });
  });

  describe("project content type", () => {
    it("increments view count and returns new count", async () => {
      vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 21, error: null });

      const response = await POST(createRequest("project", "test-project"));
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ views: 21 });
      expect(supabaseMock.rpc).toHaveBeenCalledWith("increment_content_view", {
        p_content_type: "project",
        p_identifier: "test-project",
      });
    });
  });

  describe("error handling", () => {
    it("returns success when notification resolution fails", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 43, error: null });
      resolveNotificationContentSummaryMock.mockRejectedValueOnce(new Error("Resolver failed"));

      const response = await POST(createRequest("bloq", "test-post"));
      const payload = await response.json();
      await Promise.resolve();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ views: 43 });
      expect(consoleError).toHaveBeenCalledWith("View notification error:", expect.any(Error));

      consoleError.mockRestore();
    });

    it("returns success when notifier send fails", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 43, error: null });
      telegramNotifierMock.notifyViewIncrement.mockRejectedValueOnce(new Error("Telegram down"));

      const response = await POST(createRequest("bloq", "test-post"));
      const payload = await response.json();
      await Promise.resolve();
      await Promise.resolve();

      expect(response.status).toBe(200);
      expect(payload).toEqual({ views: 43 });
      expect(consoleError).toHaveBeenCalledWith("View notification error:", expect.any(Error));

      consoleError.mockRestore();
    });

    it("returns 500 on RPC error", async () => {
      vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: null, error: { message: "Database error" } });

      const response = await POST(createRequest("bloq", "test-post"));
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ error: "Database error" });
    });

    it("returns 500 on unexpected error", async () => {
      vi.mocked(supabaseMock.rpc).mockRejectedValueOnce(new Error("Network error"));

      const response = await POST(createRequest("bloq", "test-post"));
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ error: "Network error" });
    });

    it("returns 500 with unknown error message for non-Error throws", async () => {
      vi.mocked(supabaseMock.rpc).mockRejectedValueOnce("Something went wrong");

      const response = await POST(createRequest("bloq", "test-post"));
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload).toEqual({ error: "Unknown error" });
    });
  });
});
