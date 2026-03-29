import { describe, expect, it, vi } from "vitest";
import { composeContentMutationEffects } from "../effects";
import { noopContentMutationEffect } from "../types";

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
});
