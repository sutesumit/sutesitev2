import { describe, expect, it, vi } from "vitest";
import { composeContentPublishEffects } from "../effects";
import { noopContentPublishEffect } from "../types";

describe("content publish effects", () => {
  it("calls each effect in order with the same event payload", async () => {
    const first = { onPublished: vi.fn() };
    const second = { onPublished: vi.fn() };
    const effect = composeContentPublishEffects([first, second]);
    const event = {
      type: "byte" as const,
      byte: {
        id: "1",
        byte_serial: "001",
        content: "hello",
        created_at: "2026-03-28T00:00:00Z",
      },
    };

    await effect.onPublished(event);

    expect(first.onPublished).toHaveBeenCalledWith(event);
    expect(second.onPublished).toHaveBeenCalledWith(event);
    expect(first.onPublished.mock.invocationCallOrder[0]).toBeLessThan(
      second.onPublished.mock.invocationCallOrder[0]
    );
  });

  it("supports a no-op effect safely", async () => {
    await expect(
      noopContentPublishEffect.onPublished({
        type: "bloq",
        bloq: { title: "Test", slug: "test", tags: [] },
      })
    ).resolves.toBeUndefined();
  });
});
