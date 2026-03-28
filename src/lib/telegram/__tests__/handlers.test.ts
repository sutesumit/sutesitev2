import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { byteServiceMock, blipServiceMock } = vi.hoisted(() => ({
  byteServiceMock: {
    createByte: vi.fn(),
    listRecentBytes: vi.fn(),
    getByteBySerial: vi.fn(),
    updateByte: vi.fn(),
    deleteByte: vi.fn(),
  },
  blipServiceMock: {
    createBlip: vi.fn(),
    listRecentBlips: vi.fn(),
    getBlipBySerial: vi.fn(),
    updateBlip: vi.fn(),
    deleteBlip: vi.fn(),
  },
}));

vi.mock("../middleware/auth", () => ({
  isAllowed: vi.fn(() => true),
}));

vi.mock("@/lib/byte/service", () => ({
  createByteService: vi.fn(() => byteServiceMock),
}));

vi.mock("@/lib/blip/service", () => ({
  createBlipService: vi.fn(() => blipServiceMock),
}));

vi.mock("@/lib/content-publish", () => ({
  contentPublishEffects: {},
}));

vi.mock("@/lib/blip/validation", () => ({
  parseBlipCommandInput: vi.fn((input: string) => {
    const [term, meaning] = input.split(":");
    return { term, meaning };
  }),
}));

import { handleBlip, handleByte, handleList, handleMessage } from "../commands/handlers";

const createMockContext = (match: string | null, userId = 12345) => ({
  from: { id: userId },
  match,
  reply: vi.fn().mockResolvedValue(undefined),
  message: { text: match ?? undefined },
}) as unknown as Parameters<typeof handleByte>[0];

const createMockBot = () => ({
  api: {
    sendMessage: vi.fn().mockResolvedValue(undefined),
  },
});

describe("telegram command handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates byte via shared byte service", async () => {
    byteServiceMock.createByte.mockResolvedValueOnce({
      id: "1",
      byte_serial: "001",
      content: "Test byte",
      created_at: "2026-03-18T10:00:00Z",
    });

    const ctx = createMockContext("Test byte");
    await handleByte(ctx, createMockBot() as never);

    expect(byteServiceMock.createByte).toHaveBeenCalledWith("Test byte");
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("001"),
      { parse_mode: "HTML" }
    );
  });

  it("creates blip via shared blip service", async () => {
    blipServiceMock.createBlip.mockResolvedValueOnce({
      id: "1",
      blip_serial: "B001",
      term: "API",
      meaning: "Application Programming Interface",
      tags: [],
      created_at: "2026-03-18T10:00:00Z",
      updated_at: "2026-03-18T10:00:00Z",
    });

    const ctx = createMockContext("API:Application Programming Interface");
    await handleBlip(ctx, createMockBot() as never);

    expect(blipServiceMock.createBlip).toHaveBeenCalledWith(
      "API",
      "Application Programming Interface"
    );
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("B001"),
      { parse_mode: "HTML" }
    );
  });

  it("lists bytes from shared service", async () => {
    byteServiceMock.listRecentBytes.mockResolvedValueOnce([
      {
        id: "1",
        byte_serial: "001",
        content: "First byte",
        created_at: "2026-03-18T10:00:00Z",
      },
    ]);

    const ctx = createMockContext("byte");
    await handleList(ctx);

    expect(byteServiceMock.listRecentBytes).toHaveBeenCalledWith(10);
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("First byte"),
      { parse_mode: "HTML" }
    );
  });

  it("uses catch-all message flow through byte service", async () => {
    byteServiceMock.createByte.mockResolvedValueOnce({
      id: "1",
      byte_serial: "002",
      content: "message body",
      created_at: "2026-03-18T10:00:00Z",
    });

    const ctx = createMockContext("message body");
    await handleMessage(ctx, createMockBot() as never);

    expect(byteServiceMock.createByte).toHaveBeenCalledWith("message body");
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("002"),
      { parse_mode: "HTML" }
    );
  });
});
