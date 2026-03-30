import { describe, expect, it, vi } from "vitest";
import { createVisitService } from "../service";
import type { TelegramNotifier } from "@/lib/notifications/types";
import type { VisitRepository } from "../types";

function createRepository(): VisitRepository {
  return {
    upsertVisitorState: vi.fn(),
    getMostRecentVisitor: vi.fn(),
    countUniqueVisitors: vi.fn(),
  };
}

function createNotifier(): TelegramNotifier {
  return {
    notifyByteCreated: vi.fn().mockResolvedValue(undefined),
    notifyBlipCreated: vi.fn().mockResolvedValue(undefined),
    notifyVisitor: vi.fn().mockResolvedValue(undefined),
    notifyBloqPublished: vi.fn().mockResolvedValue(undefined),
  };
}

describe("VisitService", () => {
  it("sends returning notification counts from the repository state", async () => {
    const repository = createRepository();
    const notifier = createNotifier();
    const service = createVisitService({
      repository,
      notifier,
      now: () => new Date("2026-03-30T10:00:00.000Z"),
    });

    vi.mocked(repository.upsertVisitorState).mockResolvedValueOnce({
      ip: "49.204.148.221",
      network: "49.204.0.0/16",
      city: "Vijayawada",
      region: "Andhra Pradesh",
      country: "IN",
      postal: "520001",
      latitude: 16.5062,
      longitude: 80.648,
      org: "ISP",
      timezone: "Asia/Kolkata",
      visitCount: 520,
      firstSeenAt: "2026-01-01T00:00:00.000Z",
      lastSeenAt: "2026-03-30T10:00:00.000Z",
    });
    vi.mocked(repository.getMostRecentVisitor).mockResolvedValueOnce({
      ip: "1.1.1.1",
      city: "Bengaluru",
      country: "IN",
      lastVisitTime: "2026-03-30T09:00:00.000Z",
    });
    vi.mocked(repository.countUniqueVisitors).mockResolvedValueOnce(32);

    const result = await service.trackVisit(
      {
        ip: "49.204.148.221",
        city: "Vijayawada",
        region: "Andhra Pradesh",
        country_code: "IN",
      },
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    );

    expect(repository.upsertVisitorState).toHaveBeenCalledWith({
      ip: "49.204.148.221",
      city: "Vijayawada",
      region: "Andhra Pradesh",
      country_code: "IN",
    });
    expect(notifier.notifyVisitor).toHaveBeenCalledWith(
      expect.objectContaining({
        city: "Vijayawada",
        country: "IN",
        region: "Andhra Pradesh",
        ip: "49.204.148.221",
        deviceType: "Windows",
        isReturning: true,
        visitCount: 520,
        timestamp: "2026-03-30T10:00:00.000Z",
      }),
      undefined
    );
    expect(result).toEqual({
      lastVisitorLocation: "Bengaluru, IN",
      lastVisitTime: "2026-03-30T09:00:00.000Z",
      visitorCount: 32,
    });
  });

  it("skips persistence and notifications when the request has no ip", async () => {
    const repository = createRepository();
    const notifier = createNotifier();
    const service = createVisitService({ repository, notifier });

    vi.mocked(repository.getMostRecentVisitor).mockResolvedValueOnce(null);
    vi.mocked(repository.countUniqueVisitors).mockResolvedValueOnce(8);

    const result = await service.trackVisit({}, null);

    expect(repository.upsertVisitorState).not.toHaveBeenCalled();
    expect(notifier.notifyVisitor).not.toHaveBeenCalled();
    expect(result).toEqual({
      lastVisitorLocation: null,
      lastVisitTime: null,
      visitorCount: 8,
    });
  });

  it("returns summary even when notification delivery fails", async () => {
    const repository = createRepository();
    const notifier = createNotifier();
    const service = createVisitService({ repository, notifier });

    vi.mocked(repository.upsertVisitorState).mockResolvedValueOnce({
      ip: "10.0.0.1",
      network: null,
      city: "Pune",
      region: "Maharashtra",
      country: "IN",
      postal: null,
      latitude: null,
      longitude: null,
      org: null,
      timezone: null,
      visitCount: 1,
      firstSeenAt: "2026-03-30T10:00:00.000Z",
      lastSeenAt: "2026-03-30T10:00:00.000Z",
    });
    vi.mocked(repository.getMostRecentVisitor).mockResolvedValueOnce(null);
    vi.mocked(repository.countUniqueVisitors).mockResolvedValueOnce(12);
    vi.mocked(notifier.notifyVisitor).mockRejectedValueOnce(new Error("Telegram down"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await service.trackVisit({ ip: "10.0.0.1", city: "Pune" }, null);
    await Promise.resolve();

    expect(result.visitorCount).toBe(12);
    expect(consoleError).toHaveBeenCalledWith("Visitor notification error:", expect.any(Error));

    consoleError.mockRestore();
  });

  it("does not notify when repository persistence fails", async () => {
    const repository = createRepository();
    const notifier = createNotifier();
    const service = createVisitService({ repository, notifier });

    vi.mocked(repository.upsertVisitorState).mockRejectedValueOnce(new Error("write failed"));

    await expect(service.trackVisit({ ip: "10.0.0.1" }, null)).rejects.toThrow("write failed");
    expect(notifier.notifyVisitor).not.toHaveBeenCalled();
  });
});
