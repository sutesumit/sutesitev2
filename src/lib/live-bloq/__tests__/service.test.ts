import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLiveBloqService, type LiveBloqRepository } from "../service";
import type { ContentMutationEffect } from "@/lib/content-publish";
import { ValidationError } from "@/lib/core/errors";
import type { LiveSession, AddEntryResult } from "../types";

function createRepository(): LiveBloqRepository {
  return {
    createSession: vi.fn(),
    addEntry: vi.fn(),
    closeSession: vi.fn(),
    cancelSession: vi.fn(),
    updateSummary: vi.fn(),
    getSessionBySlug: vi.fn(),
    getSessionById: vi.fn(),
    getEntries: vi.fn(),
    getEntriesAfter: vi.fn(),
    listSessions: vi.fn(),
    findActiveSession: vi.fn(),
  };
}

function createMutationEffect(): ContentMutationEffect {
  return { onMutation: vi.fn() };
}

function makeSession(overrides: Partial<LiveSession> = {}): LiveSession {
  return {
    id: "session-1",
    slug: "test-session",
    title: "Test Session",
    status: "active",
    tags: [],
    category: "Live",
    authors: ["Sumit Sute"],
    summary: null,
    started_at: "2026-07-01T10:00:00Z",
    closed_at: null,
    entry_count: 0,
    created_at: "2026-07-01T10:00:00Z",
    ...overrides,
  };
}

function makeAddEntryResult(
  overrides: Partial<AddEntryResult> = {}
): AddEntryResult {
  return {
    entry_id: "entry-1",
    entry_sequence: 1,
    session_slug: "test-session",
    ...overrides,
  };
}

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { revalidatePath } from "next/cache";

describe("LiveBloqService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── startSession ──────────────────────────────────────────

  it("creates a session and fires mutation effect", async () => {
    const repository = createRepository();
    const mutationEffect = createMutationEffect();
    const service = createLiveBloqService({ repository, mutationEffect });
    const session = makeSession();

    vi.mocked(repository.createSession).mockResolvedValueOnce(session);
    vi.mocked(repository.getSessionBySlug).mockResolvedValue(null);

    const result = await service.startSession("Test Session");

    expect(repository.createSession).toHaveBeenCalledWith(
      "Test Session",
      "test-session"
    );
    expect(mutationEffect.onMutation).toHaveBeenCalledWith({
      action: "published",
      type: "live-bloq",
      liveBloq: session,
    });
    expect(result).toEqual(session);
  });

  it("rejects empty title", async () => {
    const repository = createRepository();
    const mutationEffect = createMutationEffect();
    const service = createLiveBloqService({ repository, mutationEffect });

    await expect(service.startSession("")).rejects.toBeInstanceOf(
      ValidationError
    );
    expect(repository.createSession).not.toHaveBeenCalled();
    expect(mutationEffect.onMutation).not.toHaveBeenCalled();
  });

  it("rejects whitespace-only title", async () => {
    const repository = createRepository();
    const mutationEffect = createMutationEffect();
    const service = createLiveBloqService({ repository, mutationEffect });

    await expect(service.startSession("   ")).rejects.toBeInstanceOf(
      ValidationError
    );
    expect(repository.createSession).not.toHaveBeenCalled();
  });

  it("generates kebab-case slug from title", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });
    const session = makeSession({ slug: "my-awesome-live" });

    vi.mocked(repository.createSession).mockResolvedValueOnce(session);
    vi.mocked(repository.getSessionBySlug).mockResolvedValue(null);

    await service.startSession("My Awesome LIVE!");

    expect(repository.createSession).toHaveBeenCalledWith(
      "My Awesome LIVE!",
      "my-awesome-live"
    );
  });

  it("trims leading/trailing spaces from title for slug", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });
    const session = makeSession({ slug: "hello-world" });

    vi.mocked(repository.createSession).mockResolvedValueOnce(session);
    vi.mocked(repository.getSessionBySlug).mockResolvedValue(null);

    await service.startSession("  Hello World  ");

    expect(repository.createSession).toHaveBeenCalledWith(
      "  Hello World  ",
      "hello-world"
    );
  });

  it("retries with -2 suffix on slug collision", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });
    const session = makeSession({ slug: "my-title-2" });

    vi.mocked(repository.createSession).mockResolvedValueOnce(session);
    vi.mocked(repository.getSessionBySlug)
      .mockResolvedValueOnce(makeSession({ slug: "my-title" })) // first check: exists
      .mockResolvedValueOnce(null); // second check: free

    await service.startSession("My Title");

    expect(repository.createSession).toHaveBeenCalledWith(
      "My Title",
      "my-title-2"
    );
  });

  it("retries with incrementing suffixes up to 10 attempts", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });
    const session = makeSession({ slug: "my-title-10" });

    vi.mocked(repository.createSession).mockResolvedValueOnce(session);
    // 9 occupied slugs, 10th free
    vi.mocked(repository.getSessionBySlug)
      .mockResolvedValueOnce(makeSession({ slug: "my-title" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-2" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-3" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-4" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-5" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-6" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-7" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-8" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-9" }))
      .mockResolvedValueOnce(null); // 10th free

    await service.startSession("My Title");

    expect(repository.createSession).toHaveBeenCalledWith(
      "My Title",
      "my-title-10"
    );
  });

  it("throws after 10 slug collision attempts", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });

    // All 11 slugs occupied (base + -2 through -11)
    vi.mocked(repository.getSessionBySlug)
      .mockResolvedValueOnce(makeSession({ slug: "my-title" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-2" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-3" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-4" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-5" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-6" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-7" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-8" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-9" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-10" }))
      .mockResolvedValueOnce(makeSession({ slug: "my-title-11" }));

    await expect(service.startSession("My Title")).rejects.toThrow(
      "Could not generate a unique slug"
    );
    expect(repository.createSession).not.toHaveBeenCalled();
  });

  it("propagates repository errors without firing mutation", async () => {
    const repository = createRepository();
    const mutationEffect = createMutationEffect();
    const service = createLiveBloqService({ repository, mutationEffect });

    vi.mocked(repository.getSessionBySlug).mockResolvedValue(null);
    vi.mocked(repository.createSession).mockRejectedValueOnce(
      new Error("DB error")
    );

    await expect(service.startSession("Test")).rejects.toThrow("DB error");
    expect(mutationEffect.onMutation).not.toHaveBeenCalled();
  });

  // ── addEntry ──────────────────────────────────────────────

  it("adds entry via RPC and revalidates path", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });
    const result = makeAddEntryResult({ entry_sequence: 1, session_slug: "my-slug" });

    vi.mocked(repository.addEntry).mockResolvedValueOnce(result);

    const entry = await service.addEntry("session-1", "Hello world");

    expect(repository.addEntry).toHaveBeenCalledWith("session-1", "Hello world");
    expect(entry).toEqual(result);
    expect(revalidatePath).toHaveBeenCalledWith("/bloq/live/my-slug");
  });

  it("rejects empty content", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });

    await expect(service.addEntry("session-1", "")).rejects.toBeInstanceOf(
      ValidationError
    );
    expect(repository.addEntry).not.toHaveBeenCalled();
  });

  it("propagates RPC errors without revalidating", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });

    vi.mocked(repository.addEntry).mockRejectedValueOnce(
      new Error("Session not active")
    );

    await expect(
      service.addEntry("session-1", "content")
    ).rejects.toThrow("Session not active");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  // ── closeSession ──────────────────────────────────────────

  it("closes session, revalidates path, does NOT fire mutation", async () => {
    const repository = createRepository();
    const mutationEffect = createMutationEffect();
    const service = createLiveBloqService({ repository, mutationEffect });
    const closed = makeSession({ status: "closed", closed_at: "2026-07-01T11:00:00Z", slug: "my-slug" });

    vi.mocked(repository.closeSession).mockResolvedValueOnce(closed);

    const result = await service.closeSession("session-1");

    expect(repository.closeSession).toHaveBeenCalledWith("session-1");
    expect(result).toEqual(closed);
    expect(revalidatePath).toHaveBeenCalledWith("/bloq/live/my-slug");
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(mutationEffect.onMutation).not.toHaveBeenCalled();
  });

  it("propagates closeSession errors", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });

    vi.mocked(repository.closeSession).mockRejectedValueOnce(
      new Error("DB error")
    );

    await expect(service.closeSession("session-1")).rejects.toThrow("DB error");
  });

  // ── cancelSession ─────────────────────────────────────────

  it("cancels session, revalidates path, does NOT fire mutation", async () => {
    const repository = createRepository();
    const mutationEffect = createMutationEffect();
    const service = createLiveBloqService({ repository, mutationEffect });
    const cancelled = makeSession({ status: "cancelled", slug: "my-slug" });

    vi.mocked(repository.cancelSession).mockResolvedValueOnce(cancelled);

    const result = await service.cancelSession("session-1");

    expect(repository.cancelSession).toHaveBeenCalledWith("session-1");
    expect(result).toEqual(cancelled);
    expect(revalidatePath).toHaveBeenCalledWith("/bloq/live/my-slug");
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(mutationEffect.onMutation).not.toHaveBeenCalled();
  });

  // ── getSession ────────────────────────────────────────────

  it("returns active session", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });
    const session = makeSession({ status: "active" });

    vi.mocked(repository.getSessionBySlug).mockResolvedValueOnce(session);

    const result = await service.getSession("test-session");
    expect(result).toEqual(session);
  });

  it("returns closed session", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });
    const session = makeSession({ status: "closed" });

    vi.mocked(repository.getSessionBySlug).mockResolvedValueOnce(session);

    const result = await service.getSession("test-session");
    expect(result).toEqual(session);
  });

  it("returns null for cancelled sessions", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });
    const session = makeSession({ status: "cancelled" });

    vi.mocked(repository.getSessionBySlug).mockResolvedValueOnce(session);

    const result = await service.getSession("test-session");
    expect(result).toBeNull();
  });

  it("returns null for non-existent slug", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });

    vi.mocked(repository.getSessionBySlug).mockResolvedValueOnce(null);

    const result = await service.getSession("nonexistent");
    expect(result).toBeNull();
  });

  // ── getEntries / getEntriesAfter ──────────────────────────

  it("getEntries passes through to repository", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });
    const entries = [
      {
        id: "e1",
        session_id: "s1",
        content: "hello",
        sequence: 1,
        created_at: "2026-07-01T10:01:00Z",
      },
    ];

    vi.mocked(repository.getEntries).mockResolvedValueOnce(entries);

    const result = await service.getEntries("session-1");
    expect(result).toEqual(entries);
    expect(repository.getEntries).toHaveBeenCalledWith("session-1");
  });

  it("getEntriesAfter passes through to repository", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });
    const entries = [
      {
        id: "e2",
        session_id: "s1",
        content: "new",
        sequence: 3,
        created_at: "2026-07-01T10:03:00Z",
      },
    ];

    vi.mocked(repository.getEntriesAfter).mockResolvedValueOnce(entries);

    const result = await service.getEntriesAfter("session-1", 2);
    expect(result).toEqual(entries);
    expect(repository.getEntriesAfter).toHaveBeenCalledWith("session-1", 2);
  });

  // ── listLiveSessions ──────────────────────────────────────

  it("listLiveSessions passes through to repository", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });
    const sessions = [makeSession()];

    vi.mocked(repository.listSessions).mockResolvedValueOnce(sessions);

    const result = await service.listLiveSessions();
    expect(result).toEqual(sessions);
  });

  // ── findActiveSession ─────────────────────────────────────

  it("findActiveSession returns active session", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });
    const session = makeSession();

    vi.mocked(repository.findActiveSession).mockResolvedValueOnce(session);

    const result = await service.findActiveSession();
    expect(result).toEqual(session);
  });

  it("findActiveSession returns null when none active", async () => {
    const repository = createRepository();
    const service = createLiveBloqService({ repository });

    vi.mocked(repository.findActiveSession).mockResolvedValueOnce(null);

    const result = await service.findActiveSession();
    expect(result).toBeNull();
  });
});
