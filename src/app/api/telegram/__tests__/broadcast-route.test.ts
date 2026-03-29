import { beforeEach, describe, expect, it, vi } from "vitest";

const { notifyBloqPublished } = vi.hoisted(() => ({
  notifyBloqPublished: vi.fn(),
}));

vi.mock("@/lib/bloq/service", () => ({
  createBloqNotificationService: vi.fn(() => ({
    notifyBloqPublished,
  })),
}));

vi.mock("@/lib/content-publish", () => ({
  contentMutationEffects: {},
}));

import { POST } from "../broadcast/route";

describe("telegram broadcast route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TELEGRAM_BROADCAST_SECRET", "secret");
  });

  it("rejects invalid secret", async () => {
    const response = await POST(new Request("http://localhost/api/telegram/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Broadcast-Secret": "wrong",
      },
      body: JSON.stringify({ type: "bloq", title: "Test", slug: "test" }),
    }));

    expect(response.status).toBe(401);
  });

  it("delegates bloq notifications to the service", async () => {
    const response = await POST(new Request("http://localhost/api/telegram/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Broadcast-Secret": "secret",
      },
      body: JSON.stringify({ type: "bloq", title: "Test", slug: "test", tags: "a,b" }),
    }));

    expect(response.status).toBe(200);
    expect(notifyBloqPublished).toHaveBeenCalledWith({
      title: "Test",
      slug: "test",
      tags: ["a", "b"],
    });
  });
});
