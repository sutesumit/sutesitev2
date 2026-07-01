import { describe, expect, it } from "vitest";
import { liveSessionToBloqPost } from "../to-bloq-post";
import type { LiveSession } from "../types";

function makeSession(overrides: Partial<LiveSession> = {}): LiveSession {
  return {
    id: "session-1",
    slug: "test-session",
    title: "Test Session",
    status: "closed",
    tags: [],
    category: "Live",
    authors: ["Sumit Sute"],
    summary: null,
    started_at: "2026-07-01T10:00:00Z",
    closed_at: "2026-07-01T11:00:00Z",
    entry_count: 5,
    created_at: "2026-07-01T10:00:00Z",
    ...overrides,
  };
}

describe("liveSessionToBloqPost", () => {
  it("sets url to live/slug", () => {
    const result = liveSessionToBloqPost(makeSession({ slug: "my-live" }));
    expect(result.url).toBe("live/my-live");
  });

  it("sets category to Live", () => {
    const result = liveSessionToBloqPost(makeSession());
    expect(result.category).toBe("Live");
  });

  it("sets draft to false", () => {
    const result = liveSessionToBloqPost(makeSession());
    expect(result.draft).toBe(false);
  });

  it("sets status to published", () => {
    const result = liveSessionToBloqPost(makeSession());
    expect(result.status).toBe("published");
  });

  it("sets publishedAt to started_at", () => {
    const result = liveSessionToBloqPost(
      makeSession({ started_at: "2026-07-01T10:00:00Z" })
    );
    expect(result.publishedAt).toBe("2026-07-01T10:00:00Z");
  });

  it("sets updatedAt to closed_at when available", () => {
    const result = liveSessionToBloqPost(
      makeSession({ closed_at: "2026-07-01T11:00:00Z" })
    );
    expect(result.updatedAt).toBe("2026-07-01T11:00:00Z");
  });

  it("generates summary from entry_count when no summary", () => {
    const result = liveSessionToBloqPost(
      makeSession({ summary: null, entry_count: 12 })
    );
    expect(result.summary).toBe("12 entries from live session");
  });

  it("generates summary for zero entries", () => {
    const result = liveSessionToBloqPost(
      makeSession({ summary: null, entry_count: 0 })
    );
    expect(result.summary).toBe("Live session in progress");
  });

  it("uses explicit summary when provided", () => {
    const result = liveSessionToBloqPost(
      makeSession({ summary: "Custom summary text", entry_count: 5 })
    );
    expect(result.summary).toBe("Custom summary text");
  });

  it("merges tags with 'live' tag", () => {
    const result = liveSessionToBloqPost(
      makeSession({ tags: ["react", "conference"] })
    );
    expect(result.tags).toContain("react");
    expect(result.tags).toContain("conference");
    expect(result.tags).toContain("live");
  });

  it("adds only 'live' tag when session has no tags", () => {
    const result = liveSessionToBloqPost(makeSession({ tags: [] }));
    expect(result.tags).toEqual(["live"]);
  });

  it("calculates readingTime from entry_count", () => {
    const result = liveSessionToBloqPost(makeSession({ entry_count: 12 }));
    expect(result.readingTime).toBe(2); // ceil(12/10) = 2
  });

  it("readingTime minimum is 1 for non-zero entries", () => {
    const result = liveSessionToBloqPost(makeSession({ entry_count: 3 }));
    expect(result.readingTime).toBe(1); // max(1, ceil(3/10)) = 1
  });

  it("readingTime is undefined for zero entries", () => {
    const result = liveSessionToBloqPost(makeSession({ entry_count: 0 }));
    expect(result.readingTime).toBeUndefined();
  });

  it("featured is false", () => {
    const result = liveSessionToBloqPost(makeSession());
    expect(result.featured).toBe(false);
  });

  it("image is undefined", () => {
    const result = liveSessionToBloqPost(makeSession());
    expect(result.image).toBeUndefined();
  });

  it("content is empty string", () => {
    const result = liveSessionToBloqPost(makeSession());
    expect(result.content).toBe("");
  });

  it("preserves authors from session", () => {
    const result = liveSessionToBloqPost(
      makeSession({ authors: ["John", "Jane"] })
    );
    expect(result.authors).toEqual(["John", "Jane"]);
  });

  it("defaults authors when empty", () => {
    const result = liveSessionToBloqPost(makeSession({ authors: [] }));
    expect(result.authors).toEqual([]);
  });
});
