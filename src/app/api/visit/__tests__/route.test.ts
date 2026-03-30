import { beforeEach, describe, expect, it, vi } from "vitest";

const { visitServiceMock } = vi.hoisted(() => ({
  visitServiceMock: {
    trackVisit: vi.fn(),
  },
}));

vi.mock("@/lib/visit/service", () => ({
  visitService: visitServiceMock,
}));

import { POST } from "../route";

describe("/api/visit route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the visit summary from the service", async () => {
    visitServiceMock.trackVisit.mockResolvedValueOnce({
      lastVisitorLocation: "Bengaluru, IN",
      lastVisitTime: "2026-03-30T09:00:00.000Z",
      visitorCount: 32,
    });

    const response = await POST(new Request("http://localhost/api/visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({ ip: "49.204.148.221" }),
    }));

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(visitServiceMock.trackVisit).toHaveBeenCalledWith(
      { ip: "49.204.148.221" },
      "Mozilla/5.0"
    );
    expect(payload).toEqual({
      lastVisitorLocation: "Bengaluru, IN",
      lastVisitTime: "2026-03-30T09:00:00.000Z",
      visitorCount: 32,
    });
  });

  it("returns 500 when the service throws", async () => {
    visitServiceMock.trackVisit.mockRejectedValueOnce(new Error("boom"));

    const response = await POST(new Request("http://localhost/api/visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ip: "49.204.148.221" }),
    }));

    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "boom" });
  });
});
