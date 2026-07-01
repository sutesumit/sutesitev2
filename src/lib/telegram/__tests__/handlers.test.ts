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

// Use shared mock factory to avoid module caching conflicts across test files
import { mockLiveBloqService, mockCreateLiveBloqService } from "@/test/mocks/live-bloq";
vi.mock("@/lib/live-bloq/service", () => ({
  liveBloqService: mockLiveBloqService,
  createLiveBloqService: mockCreateLiveBloqService,
}));

vi.mock("@/lib/content-publish", () => ({
  contentMutationEffects: {},
}));

vi.mock("@/lib/blip/validation", () => ({
  parseBlipCommandInput: vi.fn((input: string) => {
    const [term, meaning] = input.split(":");
    return { term, meaning };
  }),
}));

vi.mock("../session-state", () => ({
  getOrRecoverActiveSession: vi.fn(() => null),
  setActiveSession: vi.fn(),
  clearActiveSession: vi.fn(),
  getActiveSession: vi.fn(),
}));

import { handleBlip, handleByte, handleList, handleMessage } from "../commands/handlers";
import { getOrRecoverActiveSession } from "../session-state";

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

  it("routes message to live entry when session is active", async () => {
    vi.mocked(getOrRecoverActiveSession).mockResolvedValueOnce("session-1");
    vi.mocked(mockLiveBloqService.addEntry).mockResolvedValueOnce({
      entry_id: "e1",
      entry_sequence: 3,
      session_slug: "my-slug",
    });

    const ctx = createMockContext("live update!");
    await handleMessage(ctx, createMockBot() as never);

    expect(mockLiveBloqService.addEntry).toHaveBeenCalledWith(
      "session-1",
      "live update!"
    );
    expect(ctx.reply).toHaveBeenCalledWith(
      "Entry #3 added.",
      { parse_mode: "HTML" }
    );
    expect(byteServiceMock.createByte).not.toHaveBeenCalled();
  });

  it("falls back to byte creation when no active session", async () => {
    vi.mocked(getOrRecoverActiveSession).mockResolvedValueOnce(null);
    byteServiceMock.createByte.mockResolvedValueOnce({
      id: "1",
      byte_serial: "005",
      content: "just a byte",
      created_at: "2026-07-01T10:00:00Z",
    });

    const ctx = createMockContext("just a byte");
    await handleMessage(ctx, createMockBot() as never);

    expect(mockLiveBloqService.addEntry).not.toHaveBeenCalled();
    expect(byteServiceMock.createByte).toHaveBeenCalledWith("just a byte");
  });

  it("shows live-session error when addEntry throws (session closed during check)", async () => {
    vi.mocked(getOrRecoverActiveSession).mockResolvedValueOnce("session-1");
    vi.mocked(mockLiveBloqService.addEntry).mockRejectedValueOnce(
      new Error("Session not active")
    );

    const ctx = createMockContext("fallback byte");
    await handleMessage(ctx, createMockBot() as never);

    expect(mockLiveBloqService.addEntry).toHaveBeenCalledWith(
      "session-1",
      "fallback byte"
    );
    expect(byteServiceMock.createByte).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(
      "Could not add that update to the live session."
    );
  });

  it("skips commands when session is active (commands start with /)", async () => {
    const ctx = {
      from: { id: 12345 },
      match: null,
      reply: vi.fn().mockResolvedValue(undefined),
      message: { text: "/byte some content" },
    } as unknown as Parameters<typeof handleMessage>[0];

    await handleMessage(ctx, createMockBot() as never);

    // Should return early, no entry or byte created
    expect(mockLiveBloqService.addEntry).not.toHaveBeenCalled();
    expect(byteServiceMock.createByte).not.toHaveBeenCalled();
  });
});
