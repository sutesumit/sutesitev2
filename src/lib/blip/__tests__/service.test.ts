import { describe, expect, it, vi } from "vitest";
import { createBlipService, type BlipRepository } from "../service";
import type { TelegramNotifier } from "@/lib/notifications/types";
import { ValidationError } from "@/lib/core/errors";

function createRepository(): BlipRepository {
  return {
    createBlip: vi.fn(),
    listAllBlips: vi.fn(),
    getBlipBySerial: vi.fn(),
    getBlips: vi.fn(),
    updateBlip: vi.fn(),
    deleteBlip: vi.fn(),
  };
}

function createNotifier(): TelegramNotifier {
  return {
    notifyByteCreated: vi.fn(),
    notifyBlipCreated: vi.fn(),
    notifyVisitor: vi.fn(),
    notifyBloqPublished: vi.fn(),
  };
}

describe("BlipService", () => {
  it("creates a blip and notifies after persistence", async () => {
    const repository = createRepository();
    const notifier = createNotifier();
    const service = createBlipService({ repository, notifier });
    const created = {
      id: "1",
      blip_serial: "B001",
      term: "API",
      meaning: "Application Programming Interface",
      tags: [],
      created_at: "2026-03-20T00:00:00Z",
      updated_at: "2026-03-20T00:00:00Z",
    };

    vi.mocked(repository.createBlip).mockResolvedValueOnce(created);

    const result = await service.createBlip("API", "Application Programming Interface");

    expect(repository.createBlip).toHaveBeenCalledWith("API", "Application Programming Interface");
    expect(notifier.notifyBlipCreated).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it("rejects invalid blip input before repository write", async () => {
    const repository = createRepository();
    const notifier = createNotifier();
    const service = createBlipService({ repository, notifier });

    await expect(service.createBlip("", "meaning")).rejects.toBeInstanceOf(ValidationError);
    expect(repository.createBlip).not.toHaveBeenCalled();
    expect(notifier.notifyBlipCreated).not.toHaveBeenCalled();
  });
});
