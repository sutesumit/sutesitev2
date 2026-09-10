import { describe, expect, it, vi, beforeEach } from "vitest";
import type { BloqPost } from "../types";
import type { LiveSession } from "@/lib/live-bloq/types";

const { getBloqPostBySlug, getSessionBySlug, liveSessionToBloqPost } =
  vi.hoisted(() => ({
    getBloqPostBySlug: vi.fn(),
    getSessionBySlug: vi.fn(),
    liveSessionToBloqPost: vi.fn(),
  }));

vi.mock("../parser", () => ({ getBloqPostBySlug }));
vi.mock("@/lib/live-bloq/repository", () => ({ getSessionBySlug }));
vi.mock("@/lib/live-bloq/to-bloq-post", () => ({ liveSessionToBloqPost }));

import { resolveBloqPost } from "../lookup";

function makeStaticPost(url: string): BloqPost {
  return {
    slug: url,
    title: `Static ${url}`,
    publishedAt: "2026-01-01T00:00:00Z",
    summary: "static summary",
    content: "",
    url,
    tags: [],
    authors: [],
    draft: false,
    featured: false,
  };
}

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
    closed_at: null,
    entry_count: 5,
    created_at: "2026-07-01T09:00:00Z",
    ...overrides,
  };
}

describe("resolveBloqPost", () => {
  beforeEach(() => {
    getBloqPostBySlug.mockReset();
    getSessionBySlug.mockReset();
    liveSessionToBloqPost.mockReset();
  });

  it("returns the static post without touching the live store", async () => {
    const post = makeStaticPost("react-nexus-2026-report");
    getBloqPostBySlug.mockReturnValueOnce(post);

    const result = await resolveBloqPost("react-nexus-2026-report");

    expect(result).toBe(post);
    expect(getSessionBySlug).not.toHaveBeenCalled();
  });

  it("falls back to a live session when no static post matches", async () => {
    const session = makeSession({ slug: "notes-from-react-nexus-2026" });
    const dressed = makeStaticPost("live/notes-from-react-nexus-2026");
    getBloqPostBySlug.mockReturnValueOnce(undefined);
    getSessionBySlug.mockResolvedValueOnce(session);
    liveSessionToBloqPost.mockReturnValueOnce(dressed);

    const result = await resolveBloqPost("notes-from-react-nexus-2026");

    expect(getSessionBySlug).toHaveBeenCalledWith("notes-from-react-nexus-2026");
    expect(liveSessionToBloqPost).toHaveBeenCalledWith(session);
    expect(result).toBe(dressed);
  });

  it("strips the live/ prefix before the session lookup", async () => {
    getBloqPostBySlug.mockReturnValueOnce(undefined);
    getSessionBySlug.mockResolvedValueOnce(null);

    await resolveBloqPost("live/notes-from-react-nexus-2026");

    expect(getSessionBySlug).toHaveBeenCalledWith("notes-from-react-nexus-2026");
  });

  it("resolves undefined for cancelled sessions", async () => {
    getBloqPostBySlug.mockReturnValueOnce(undefined);
    getSessionBySlug.mockResolvedValueOnce(
      makeSession({ status: "cancelled" }),
    );

    const result = await resolveBloqPost("test-session");

    expect(liveSessionToBloqPost).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("resolves undefined when no session exists", async () => {
    getBloqPostBySlug.mockReturnValueOnce(undefined);
    getSessionBySlug.mockResolvedValueOnce(null);

    const result = await resolveBloqPost("missing-slug");

    expect(result).toBeUndefined();
  });

  it("resolves undefined when the live store throws (missing env)", async () => {
    getBloqPostBySlug.mockReturnValueOnce(undefined);
    getSessionBySlug.mockRejectedValueOnce(
      new Error("Supabase environment variables are not configured"),
    );

    const result = await resolveBloqPost("test-session");

    expect(result).toBeUndefined();
  });

  it("prefers the static post over a live session with the same slug", async () => {
    const post = makeStaticPost("shared-slug");
    getBloqPostBySlug.mockReturnValueOnce(post);

    const result = await resolveBloqPost("shared-slug");

    expect(result).toBe(post);
    expect(getSessionBySlug).not.toHaveBeenCalled();
    expect(liveSessionToBloqPost).not.toHaveBeenCalled();
  });
});
