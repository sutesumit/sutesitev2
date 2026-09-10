import { afterEach, describe, expect, it, vi } from "vitest";
import { composeContentMutationEffects } from "../effects";
import { noopContentMutationEffect } from "../types";
import { createTelegramMutationEffect } from "../telegram-effect";
import type { TelegramNotifier } from "@/lib/notifications/types";

describe("content mutation effects", () => {
  it("calls each effect in order with the same event payload", async () => {
    const first = { onMutation: vi.fn() };
    const second = { onMutation: vi.fn() };
    const effect = composeContentMutationEffects([first, second]);
    const event = {
      action: "published" as const,
      type: "byte" as const,
      byte: {
        id: "1",
        byte_serial: "001",
        content: "hello",
        created_at: "2026-03-28T00:00:00Z",
      },
    };

    await effect.onMutation(event);

    expect(first.onMutation).toHaveBeenCalledWith(event);
    expect(second.onMutation).toHaveBeenCalledWith(event);
    expect(first.onMutation.mock.invocationCallOrder[0]).toBeLessThan(
      second.onMutation.mock.invocationCallOrder[0]
    );
  });

  it("supports a no-op effect safely", async () => {
    await expect(
      noopContentMutationEffect.onMutation({
        action: "published",
        type: "bloq",
        bloq: { title: "Test", slug: "test", tags: [] },
      })
    ).resolves.toBeUndefined();
  });

  it("handles live-bloq events in composed effects", async () => {
    const first = { onMutation: vi.fn() };
    const second = { onMutation: vi.fn() };
    const effect = composeContentMutationEffects([first, second]);
    const event = {
      action: "published" as const,
      type: "live-bloq" as const,
      liveBloq: {
        id: "s1",
        slug: "my-live",
        title: "My Live Session",
        status: "active" as const,
        tags: [],
        category: "Live",
        authors: ["Sumit Sute"],
        summary: null,
        started_at: "2026-07-01T10:00:00Z",
        closed_at: null,
        entry_count: 0,
        created_at: "2026-07-01T10:00:00Z",
      },
    };

    await effect.onMutation(event);

    expect(first.onMutation).toHaveBeenCalledWith(event);
    expect(second.onMutation).toHaveBeenCalledWith(event);
  });
});

describe("telegram mutation effect", () => {
  const liveBloqEvent = {
    action: "published" as const,
    type: "live-bloq" as const,
    liveBloq: {
      id: "s1",
      slug: "my-live",
      title: "My Live Session",
      status: "active" as const,
      tags: [],
      category: "Live",
      authors: ["Sumit Sute"],
      summary: null,
      started_at: "2026-07-01T10:00:00Z",
      closed_at: null,
      entry_count: 0,
      created_at: "2026-07-01T10:00:00Z",
    },
  };

  function createNotifier(): TelegramNotifier {
    return {
      notifyByteCreated: vi.fn().mockResolvedValue(undefined),
      notifyBlipCreated: vi.fn().mockResolvedValue(undefined),
      notifyVisitor: vi.fn().mockResolvedValue(undefined),
      notifyBloqPublished: vi.fn().mockResolvedValue(undefined),
      notifyLiveBloqStarted: vi.fn().mockResolvedValue(undefined),
      notifyViewIncrement: vi.fn().mockResolvedValue(undefined),
      notifyClapIncrement: vi.fn().mockResolvedValue(undefined),
    };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("warms the live og image before broadcasting the announcement", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const notifier = createNotifier();
    const effect = createTelegramMutationEffect(notifier);

    await effect.onMutation(liveBloqEvent);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://sumitsute.com/og/live/my-live",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(notifier.notifyLiveBloqStarted).toHaveBeenCalledWith(
      liveBloqEvent.liveBloq
    );
    expect(fetchMock.mock.invocationCallOrder[0]).toBeLessThan(
      notifier.notifyLiveBloqStarted.mock.invocationCallOrder[0]
    );
  });

  it("still broadcasts when the og warm-up fails after retries", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("warm-up failed"));
    vi.stubGlobal("fetch", fetchMock);
    const notifier = createNotifier();
    const effect = createTelegramMutationEffect(notifier);

    await expect(effect.onMutation(liveBloqEvent)).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(notifier.notifyLiveBloqStarted).toHaveBeenCalledTimes(1);
  });
});
