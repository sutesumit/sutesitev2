import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LiveBloqFeed } from "../LiveBloqFeed";
import type { LiveEntry, LiveSession } from "@/lib/live-bloq/types";

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Capture setInterval callback for manual invocation
let capturedPollCallback: (() => void) | null = null;

function makeEntry(
  overrides: Partial<LiveEntry> & { sequence: number; content: string }
): LiveEntry {
  return {
    id: `entry-${overrides.sequence}`,
    session_id: "session-1",
    content: overrides.content,
    sequence: overrides.sequence,
    created_at:
      overrides.created_at ??
      new Date(Date.now() + overrides.sequence * 60000).toISOString(),
  };
}

function makeSession(
  overrides: Partial<LiveSession> = {}
): LiveSession {
  return {
    id: "session-1",
    slug: "test-session",
    title: "Test Session",
    status: "active",
    tags: [],
    category: "Live",
    authors: ["Sumit Sute"],
    summary: null,
    started_at: new Date().toISOString(),
    closed_at: null,
    entry_count: 0,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("LiveBloqFeed", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    capturedPollCallback = null;
    vi.spyOn(globalThis, "setInterval").mockImplementation(((fn: () => void) => {
      capturedPollCallback = fn;
      return 1 as unknown as ReturnType<typeof setInterval>;
    }) as typeof setInterval);
    vi.spyOn(globalThis, "clearInterval").mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders initial entries with timestamps", () => {
    const session = makeSession({ entry_count: 2 });
    const entries = [
      makeEntry({ sequence: 1, content: "First entry" }),
      makeEntry({ sequence: 2, content: "Second entry" }),
    ];

    render(
      <LiveBloqFeed session={session} initialEntries={entries} slug="test" />
    );

    expect(screen.getByText("First entry")).toBeDefined();
    expect(screen.getByText("Second entry")).toBeDefined();
    const times = document.querySelectorAll("time");
    expect(times.length).toBe(2);
  });

  it("shows Live badge for active session", () => {
    const session = makeSession({ status: "active" });

    render(
      <LiveBloqFeed session={session} initialEntries={[]} slug="test" />
    );

    expect(screen.getByText(/Live/i)).toBeDefined();
  });

  it("shows Session ended badge for closed session", () => {
    const session = makeSession({ status: "closed", closed_at: new Date().toISOString() });

    render(
      <LiveBloqFeed session={session} initialEntries={[]} slug="test" />
    );

    expect(screen.getByText(/Session ended/i)).toBeDefined();
  });

  it("renders empty feed without crashing", () => {
    const session = makeSession({ entry_count: 0, status: "active" });

    render(
      <LiveBloqFeed session={session} initialEntries={[]} slug="test" />
    );

    // Active session with 0 entries shows "Waiting for the first update"
    expect(screen.getByText(/Waiting for the first update/i)).toBeDefined();
  });

  it("starts polling for active session", () => {
    const session = makeSession({ status: "active" });

    render(
      <LiveBloqFeed session={session} initialEntries={[]} slug="test" />
    );

    expect(globalThis.setInterval).toHaveBeenCalled();
    expect(capturedPollCallback).not.toBeNull();
  });

  it("does not start polling for closed session", () => {
    const session = makeSession({ status: "closed" });

    render(
      <LiveBloqFeed session={session} initialEntries={[]} slug="test" />
    );

    expect(globalThis.setInterval).not.toHaveBeenCalled();
  });

  it("polls correct API endpoint", async () => {
    const session = makeSession({ status: "active" });
    const entries = [
      makeEntry({ sequence: 1, content: "Entry 1" }),
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ entries: [], sessionStatus: "active" }),
    });

    render(
      <LiveBloqFeed
        session={session}
        initialEntries={entries}
        slug="my-live-slug"
      />
    );

    expect(capturedPollCallback).not.toBeNull();
    await capturedPollCallback!();

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/live-bloq/my-live-slug/entries?after=1"
    );
  });

  it("appends new entries from poll response", async () => {
    const session = makeSession({ status: "active", entry_count: 1 });
    const entries = [
      makeEntry({ sequence: 1, content: "Original" }),
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          entries: [
            {
              id: "entry-2",
              session_id: "session-1",
              content: "New entry from poll",
              sequence: 2,
              created_at: new Date().toISOString(),
            },
          ],
          sessionStatus: "active",
        }),
    });

    render(
      <LiveBloqFeed
        session={session}
        initialEntries={entries}
        slug="test"
      />
    );

    expect(screen.getByText("Original")).toBeDefined();

    await capturedPollCallback!();

    await waitFor(() => {
      expect(screen.getByText("New entry from poll")).toBeDefined();
    });
  });

  it("stops polling when sessionStatus changes to closed", async () => {
    const session = makeSession({ status: "active", entry_count: 1 });
    const entries = [
      makeEntry({ sequence: 1, content: "Only entry" }),
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          entries: [],
          sessionStatus: "closed",
        }),
    });

    render(
      <LiveBloqFeed
        session={session}
        initialEntries={entries}
        slug="test"
      />
    );

    await capturedPollCallback!();

    await waitFor(() => {
      expect(screen.getByText(/Session ended/i)).toBeDefined();
    });

    expect(globalThis.clearInterval).toHaveBeenCalled();
  });

  it("handles fetch errors gracefully", async () => {
    const session = makeSession({ status: "active", entry_count: 1 });
    const entries = [
      makeEntry({ sequence: 1, content: "Entry" }),
    ];

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(
      <LiveBloqFeed session={session} initialEntries={entries} slug="test" />
    );

    await capturedPollCallback!();

    expect(screen.getByText("Entry")).toBeDefined();
  });

  it("appends multiple entries from poll in correct sequence order", async () => {
    const session = makeSession({ status: "active", entry_count: 1 });
    const entries = [
      makeEntry({ sequence: 1, content: "Entry 1" }),
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          entries: [
            {
              id: "entry-2",
              session_id: "session-1",
              content: "Entry 2",
              sequence: 2,
              created_at: new Date().toISOString(),
            },
            {
              id: "entry-3",
              session_id: "session-1",
              content: "Entry 3",
              sequence: 3,
              created_at: new Date().toISOString(),
            },
          ],
          sessionStatus: "active",
        }),
    });

    render(
      <LiveBloqFeed
        session={session}
        initialEntries={entries}
        slug="test"
      />
    );

    await capturedPollCallback!();

    await waitFor(() => {
      expect(screen.getByText("Entry 2")).toBeDefined();
      expect(screen.getByText("Entry 3")).toBeDefined();
    });
  });
});
