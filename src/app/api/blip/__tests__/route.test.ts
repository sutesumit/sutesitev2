import { beforeEach, describe, expect, it, vi } from "vitest";

const { serviceMock } = vi.hoisted(() => ({
  serviceMock: {
    createBlip: vi.fn(),
    listAllBlips: vi.fn(),
  },
}));

vi.mock("@/lib/blip/service", () => ({
  createBlipService: vi.fn(() => serviceMock),
}));

vi.mock("@/lib/content-publish", () => ({
  contentPublishEffects: {},
}));

import { GET, POST } from "../route";

describe("/api/blip route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("BLIP_SECRET_KEY", "secret");
  });

  it("returns 401 for unauthorized POST", async () => {
    const response = await POST(new Request("http://localhost/api/blip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ term: "API", meaning: "Application Programming Interface" }),
    }));

    expect(response.status).toBe(401);
    expect(serviceMock.createBlip).not.toHaveBeenCalled();
  });

  it("returns created blip payload on POST", async () => {
    serviceMock.createBlip.mockResolvedValueOnce({
      id: "1",
      blip_serial: "B001",
      term: "API",
      meaning: "Application Programming Interface",
      tags: [],
      created_at: "2026-03-22T00:00:00Z",
      updated_at: "2026-03-22T00:00:00Z",
    });

    const response = await POST(new Request("http://localhost/api/blip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        K: "secret",
      },
      body: JSON.stringify({ term: "API", meaning: "Application Programming Interface" }),
    }));

    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.blip.blip_serial).toBe("B001");
    expect(payload.blip.term).toBe("API");
    expect(payload.blip.meaning).toBe("Application Programming Interface");
  });

  it("returns blips list on GET", async () => {
    serviceMock.listAllBlips.mockResolvedValueOnce([
      {
        id: "1",
        blip_serial: "B001",
        term: "API",
        meaning: "Application Programming Interface",
        tags: [],
        created_at: "2026-03-22T00:00:00Z",
        updated_at: "2026-03-22T00:00:00Z",
      },
    ]);

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.blips).toHaveLength(1);
    expect(payload.blips[0].blip_serial).toBe("B001");
  });
});
