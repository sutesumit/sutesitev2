import { describe, expect, it, vi } from "vitest";
import { createByteService, type ByteRepository } from "../service";
import type { TelegramNotifier } from "@/lib/notifications/types";
import { ValidationError } from "@/lib/core/errors";

function createRepository(): ByteRepository {
  return {
    createByte: vi.fn(),
    listAllBytes: vi.fn(),
    getByteBySerial: vi.fn(),
    getBytes: vi.fn(),
    updateByte: vi.fn(),
    deleteByte: vi.fn(),
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

describe("ByteService", () => {
  it("creates a byte and notifies after persistence", async () => {
    const repository = createRepository();
    const notifier = createNotifier();
    const service = createByteService({ repository, notifier });
    const created = {
      id: "1",
      byte_serial: "001",
      content: "hello",
      created_at: "2026-03-20T00:00:00Z",
    };

    vi.mocked(repository.createByte).mockResolvedValueOnce(created);

    const result = await service.createByte("hello");

    expect(repository.createByte).toHaveBeenCalledWith("hello");
    expect(notifier.notifyByteCreated).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it("rejects invalid byte content before repository write", async () => {
    const repository = createRepository();
    const notifier = createNotifier();
    const service = createByteService({ repository, notifier });

    await expect(service.createByte("")).rejects.toBeInstanceOf(ValidationError);
    expect(repository.createByte).not.toHaveBeenCalled();
    expect(notifier.notifyByteCreated).not.toHaveBeenCalled();
  });
});
