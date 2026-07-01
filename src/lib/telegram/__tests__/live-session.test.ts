import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../middleware/auth", () => ({
  isAllowed: vi.fn(() => true),
}));

vi.mock("@/lib/content-publish", () => ({
  contentMutationEffects: {},
}));

vi.mock("@/lib/live-bloq", () => ({
  createLiveBloqService: vi.fn(() => mockLiveBloqService),
  liveBloqService: mockLiveBloqService,
}));

vi.mock("../session-state", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../session-state")>();
  return {
    ...actual,
    getOrRecoverActiveSession: vi.fn(() => null),
    setActiveSession: vi.fn(),
    clearActiveSession: vi.fn(),
    getActiveSession: vi.fn(),
  };
});

import { mockLiveBloqService } from "@/test/mocks/live-bloq";
import { handleLiveSession } from "../commands/live-session";
import {
  getOrRecoverActiveSession,
  setActiveSession,
  clearActiveSession,
} from "../session-state";

const createMockContext = (match: string | null, userId = 12345) =>
  ({
    from: { id: userId },
    match,
    reply: vi.fn().mockResolvedValue(undefined),
    message: { text: match ?? undefined },
  }) as unknown as Parameters<typeof handleLiveSession>[0];

const createMockBot = () => ({
  api: {
    sendMessage: vi.fn().mockResolvedValue(undefined),
  },
});

describe("handleLiveSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── start ─────────────────────────────────────────────────

  it("starts a session and replies with URL", async () => {
    mockLiveBloqService.startSession.mockResolvedValueOnce({
      id: "session-1",
      slug: "my-live-session",
      title: "My Live Session",
      status: "active",
    });

    const ctx = createMockContext("start My Live Session");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(mockLiveBloqService.startSession).toHaveBeenCalledWith(
      "My Live Session"
    );
    expect(setActiveSession).toHaveBeenCalledWith(12345, "session-1");
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("/bloq/live/my-live-session"),
      expect.objectContaining({ parse_mode: "HTML" })
    );
  });

  it("shows usage when no title provided for start", async () => {
    const ctx = createMockContext("start");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(mockLiveBloqService.startSession).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Usage:"),
      expect.anything()
    );
  });

  it("shows usage when start has empty title", async () => {
    const ctx = createMockContext("start   ");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(mockLiveBloqService.startSession).not.toHaveBeenCalled();
  });

  it("rejects duplicate start when already active", async () => {
    vi.mocked(getOrRecoverActiveSession).mockResolvedValueOnce("existing-session");

    const ctx = createMockContext("start Another Session");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(mockLiveBloqService.startSession).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("already have an active session"),
      expect.anything()
    );
  });

  it("handles service errors during start gracefully", async () => {
    mockLiveBloqService.startSession.mockRejectedValueOnce(
      new Error("DB error")
    );

    const ctx = createMockContext("start Test Session");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("start"),
      expect.anything()
    );
  });

  // ── close ─────────────────────────────────────────────────

  it("closes active session and clears state", async () => {
    vi.mocked(getOrRecoverActiveSession).mockResolvedValueOnce("session-1");
    mockLiveBloqService.closeSession.mockResolvedValueOnce({
      id: "session-1",
      slug: "my-slug",
      status: "closed",
    });

    const ctx = createMockContext("close");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(mockLiveBloqService.closeSession).toHaveBeenCalledWith("session-1");
    expect(clearActiveSession).toHaveBeenCalledWith(12345);
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("closed"),
      expect.anything()
    );
  });

  it("shows error when close has no active session", async () => {
    vi.mocked(getOrRecoverActiveSession).mockResolvedValueOnce(null);

    const ctx = createMockContext("close");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(mockLiveBloqService.closeSession).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("No active"),
      expect.anything()
    );
  });

  // ── cancel ────────────────────────────────────────────────

  it("cancels active session and clears state", async () => {
    vi.mocked(getOrRecoverActiveSession).mockResolvedValueOnce("session-1");
    mockLiveBloqService.cancelSession.mockResolvedValueOnce({
      id: "session-1",
      slug: "my-slug",
      status: "cancelled",
    });

    const ctx = createMockContext("cancel");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(mockLiveBloqService.cancelSession).toHaveBeenCalledWith("session-1");
    expect(mockLiveBloqService.closeSession).not.toHaveBeenCalled();
    expect(clearActiveSession).toHaveBeenCalledWith(12345);
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("cancelled"),
      expect.anything()
    );
  });

  it("shows error when cancel has no active session", async () => {
    vi.mocked(getOrRecoverActiveSession).mockResolvedValueOnce(null);

    const ctx = createMockContext("cancel");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(mockLiveBloqService.cancelSession).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("No active"),
      expect.anything()
    );
  });

  // ── status ────────────────────────────────────────────────

  it("shows status with entry count and runtime", async () => {
    vi.mocked(getOrRecoverActiveSession).mockResolvedValueOnce("session-1");
    mockLiveBloqService.getSessionById.mockResolvedValueOnce({
      id: "session-1",
      slug: "my-slug",
      title: "My Session",
      status: "active",
      entry_count: 5,
      started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    });

    const ctx = createMockContext("status");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Entries: 5"),
      expect.anything()
    );
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("/bloq/live/my-slug"),
      expect.anything()
    );
  });

  it("warns when session is stale (> 8 hours)", async () => {
    vi.mocked(getOrRecoverActiveSession).mockResolvedValueOnce("session-1");
    mockLiveBloqService.getSessionById.mockResolvedValueOnce({
      id: "session-1",
      slug: "stale-slug",
      title: "Stale Session",
      status: "active",
      entry_count: 2,
      started_at: new Date(Date.now() - 10 * 3600000).toISOString(), // 10 hours ago
    });

    const ctx = createMockContext("status");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("over 8 hours"),
      expect.anything()
    );
  });

  it("shows no active session message for status", async () => {
    vi.mocked(getOrRecoverActiveSession).mockResolvedValueOnce(null);

    const ctx = createMockContext("status");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("No active"),
      expect.anything()
    );
  });

  // ── unknown subcommand / no subcommand ────────────────────

  it("shows usage for unknown subcommand", async () => {
    const ctx = createMockContext("unknown");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Usage:"),
      expect.anything()
    );
  });

  it("shows usage when no subcommand", async () => {
    const ctx = createMockContext("");
    await handleLiveSession(ctx, createMockBot() as never);

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining("Usage:"),
      expect.anything()
    );
  });
});
