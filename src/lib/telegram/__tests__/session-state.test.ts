import { describe, expect, it, vi } from "vitest";
import {
  getActiveSession,
  setActiveSession,
  clearActiveSession,
  getOrRecoverActiveSession,
} from "../session-state";
import type { LiveBloqRepository } from "@/lib/live-bloq/service";

function createService() {
  return {
    findActiveSession: vi.fn(),
  } as unknown as LiveBloqRepository & { findActiveSession: ReturnType<typeof vi.fn> };
}

describe("session-state", () => {
  it("setActiveSession then getActiveSession returns the session", () => {
    setActiveSession(12345, "session-1");
    expect(getActiveSession(12345)).toBe("session-1");
    clearActiveSession(12345);
  });

  it("getActiveSession with no prior set returns undefined", () => {
    expect(getActiveSession(99999)).toBeUndefined();
  });

  it("clearActiveSession removes the session", () => {
    setActiveSession(12345, "session-1");
    clearActiveSession(12345);
    expect(getActiveSession(12345)).toBeUndefined();
  });

  it("getOrRecoverActiveSession returns from Map without DB call", async () => {
    setActiveSession(12345, "session-1");
    const service = createService();

    const result = await getOrRecoverActiveSession(12345, service);

    expect(result).toBe("session-1");
    expect(service.findActiveSession).not.toHaveBeenCalled();
    clearActiveSession(12345);
  });

  it("getOrRecoverActiveSession queries DB on Map miss", async () => {
    const service = createService();
    vi.mocked(service.findActiveSession).mockResolvedValueOnce({
      id: "recovered-session",
      slug: "test",
      title: "Test",
      status: "active",
      tags: [],
      category: "Live",
      authors: ["Sumit Sute"],
      summary: null,
      started_at: "2026-07-01T10:00:00Z",
      closed_at: null,
      entry_count: 0,
      created_at: "2026-07-01T10:00:00Z",
    });

    const result = await getOrRecoverActiveSession(12345, service);

    expect(result).toBe("recovered-session");
    expect(service.findActiveSession).toHaveBeenCalled();
    // Should be restored to Map for next call
    expect(getActiveSession(12345)).toBe("recovered-session");
    clearActiveSession(12345);
  });

  it("getOrRecoverActiveSession returns null on Map miss + no active session", async () => {
    const service = createService();
    vi.mocked(service.findActiveSession).mockResolvedValueOnce(null);

    const result = await getOrRecoverActiveSession(12345, service);

    expect(result).toBeNull();
  });
});
