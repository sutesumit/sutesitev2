import { beforeEach, describe, expect, it, vi } from "vitest";

const serviceMock = {
  createByte: vi.fn(),
  listAllBytes: vi.fn(),
};

vi.mock("@/lib/byte/service", () => ({
  createByteService: vi.fn(() => serviceMock),
}));

vi.mock("@/lib/notifications/telegram-notifier", () => ({
  telegramNotifier: {},
}));

import { GET, POST } from "../route";

describe("/api/byte route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("BLIP_SECRET_KEY", "secret");
  });

  it("returns 401 for unauthorized POST", async () => {
    const response = await POST(new Request("http://localhost/api/byte", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: "hello" }),
    }));

    expect(response.status).toBe(401);
    expect(serviceMock.createByte).not.toHaveBeenCalled();
  });

  it("returns created byte payload on POST", async () => {
    serviceMock.createByte.mockResolvedValueOnce({
      id: "1",
      byte_serial: "001",
      content: "hello",
      created_at: "2026-03-22T00:00:00Z",
    });

    const response = await POST(new Request("http://localhost/api/byte", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        K: "secret",
      },
      body: JSON.stringify({ content: "hello" }),
    }));

    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({
      byte: {
        id: "1",
        byte_serial: "001",
        content: "hello",
        created_at: "2026-03-22T00:00:00Z",
      },
    });
  });

  it("returns bytes list on GET", async () => {
    serviceMock.listAllBytes.mockResolvedValueOnce([
      {
        id: "1",
        byte_serial: "001",
        content: "hello",
        created_at: "2026-03-22T00:00:00Z",
      },
    ]);

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      bytes: [
        {
          id: "1",
          byte_serial: "001",
          content: "hello",
          created_at: "2026-03-22T00:00:00Z",
        },
      ],
    });
  });
});
