import { beforeEach, describe, expect, it, vi } from "vitest";

const createMockSupabase = () => ({
  from: vi.fn((table: string) => ({
    select: vi.fn((columns: string) => ({
      eq: vi.fn((field: string, value: string) => ({
        single: vi.fn().mockResolvedValue({
          data: table === "bloq_views" 
            ? { views: 42 }
            : table === "blip_views"
            ? { views: 10 }
            : table === "byte_views"
            ? { views: 5 }
            : { views: 20 },
          error: null,
        }),
      })),
    })),
  })),
  rpc: vi.fn(),
});

const supabaseMock = createMockSupabase();

vi.mock("@/lib/supabaseServerClient", () => ({
  getSupabaseServerClient: vi.fn(() => supabaseMock),
}));

vi.mock("@/lib/bloq", () => ({
  getBloqPostBySlug: vi.fn(),
}));

vi.mock("@/lib/blip", () => ({
  getBlipBySerial: vi.fn(),
}));

vi.mock("@/lib/byte", () => ({
  getByteBySerial: vi.fn(),
}));

import { GET as BloqGET, POST as BloqPOST } from "../../bloq/views/[slug]/route";
import { GET as BlipGET, POST as BlipPOST } from "../../blip/views/[serial]/route";
import { GET as ByteGET, POST as BytePOST } from "../../byte/views/[serial]/route";
import { GET as ProjectGET, POST as ProjectPOST } from "../../project/views/[slug]/route";

describe("/api/bloq/views/[slug] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns views for valid content", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue({
      slug: "test-post",
      title: "Test Post",
    } as any);

    const response = await BloqGET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "test-post" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ views: 42 });
  });

  it("GET returns 0 for non-existent content", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue(undefined);

    const response = await BloqGET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "non-existent" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Post not found" });
  });

  it("POST increments view count", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue({
      slug: "test-post",
      title: "Test Post",
    } as any);

    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 43, error: null });

    const response = await BloqPOST(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "test-post" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ views: 43 });
  });

  it("POST returns 404 for non-existent post", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue(undefined);

    const response = await BloqPOST(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "non-existent" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Post not found" });
  });

  it("returns 500 on RPC error", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue({
      slug: "test-post",
      title: "Test Post",
    } as any);

    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: null, error: { message: "RPC error" } });

    const response = await BloqPOST(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "test-post" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "RPC error" });
  });
});

describe("/api/blip/views/[serial] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns views for valid content", async () => {
    const { getBlipBySerial } = await import("@/lib/blip");
    vi.mocked(getBlipBySerial).mockResolvedValueOnce({
      blip_serial: "001",
      content: "test",
    });

    const response = await BlipGET(new Request("http://localhost"), {
      params: Promise.resolve({ serial: "001" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ views: 10 });
  });

  it("GET returns 404 for non-existent content", async () => {
    const { getBlipBySerial } = await import("@/lib/blip");
    vi.mocked(getBlipBySerial).mockResolvedValueOnce(null);

    const response = await BlipGET(new Request("http://localhost"), {
      params: Promise.resolve({ serial: "999" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Blip not found" });
  });

  it("POST increments view count", async () => {
    const { getBlipBySerial } = await import("@/lib/blip");
    vi.mocked(getBlipBySerial).mockResolvedValueOnce({
      blip_serial: "001",
      content: "test",
    });

    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 11, error: null });

    const response = await BlipPOST(new Request("http://localhost"), {
      params: Promise.resolve({ serial: "001" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ views: 11 });
  });

  it("POST returns 404 for non-existent blip", async () => {
    const { getBlipBySerial } = await import("@/lib/blip");
    vi.mocked(getBlipBySerial).mockResolvedValueOnce(null);

    const response = await BlipPOST(new Request("http://localhost"), {
      params: Promise.resolve({ serial: "999" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Blip not found" });
  });

  it("returns 500 on RPC error", async () => {
    const { getBlipBySerial } = await import("@/lib/blip");
    vi.mocked(getBlipBySerial).mockResolvedValueOnce({
      blip_serial: "001",
      content: "test",
    });

    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: null, error: { message: "RPC error" } });

    const response = await BlipPOST(new Request("http://localhost"), {
      params: Promise.resolve({ serial: "001" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "RPC error" });
  });
});

describe("/api/byte/views/[serial] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns views for valid content", async () => {
    const { getByteBySerial } = await import("@/lib/byte");
    vi.mocked(getByteBySerial).mockResolvedValueOnce({
      byte_serial: "001",
      content: "test",
    });

    const response = await ByteGET(new Request("http://localhost"), {
      params: Promise.resolve({ serial: "001" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ views: 5 });
  });

  it("GET returns 404 for non-existent content", async () => {
    const { getByteBySerial } = await import("@/lib/byte");
    vi.mocked(getByteBySerial).mockResolvedValueOnce(null);

    const response = await ByteGET(new Request("http://localhost"), {
      params: Promise.resolve({ serial: "999" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Byte not found" });
  });

  it("POST increments view count", async () => {
    const { getByteBySerial } = await import("@/lib/byte");
    vi.mocked(getByteBySerial).mockResolvedValueOnce({
      byte_serial: "001",
      content: "test",
    });

    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 6, error: null });

    const response = await BytePOST(new Request("http://localhost"), {
      params: Promise.resolve({ serial: "001" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ views: 6 });
  });

  it("POST returns 404 for non-existent byte", async () => {
    const { getByteBySerial } = await import("@/lib/byte");
    vi.mocked(getByteBySerial).mockResolvedValueOnce(null);

    const response = await BytePOST(new Request("http://localhost"), {
      params: Promise.resolve({ serial: "999" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Byte not found" });
  });

  it("returns 500 on RPC error", async () => {
    const { getByteBySerial } = await import("@/lib/byte");
    vi.mocked(getByteBySerial).mockResolvedValueOnce({
      byte_serial: "001",
      content: "test",
    });

    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: null, error: { message: "RPC error" } });

    const response = await BytePOST(new Request("http://localhost"), {
      params: Promise.resolve({ serial: "001" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "RPC error" });
  });
});

describe("/api/project/views/[slug] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns views for valid project", async () => {
    vi.mocked(supabaseMock.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { views: 20 },
            error: null,
          }),
        }),
      }),
    } as any);

    const response = await ProjectGET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "test-project" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ views: 20 });
  });

  it("GET returns 0 for non-existent project", async () => {
    vi.mocked(supabaseMock.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: "PGRST116" },
          }),
        }),
      }),
    } as any);

    const response = await ProjectGET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "non-existent" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ views: 0 });
  });

  it("POST increments view count", async () => {
    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: 21, error: null });

    const response = await ProjectPOST(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "test-project" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ views: 21 });
  });

  it("returns 500 on RPC error", async () => {
    vi.mocked(supabaseMock.rpc).mockResolvedValueOnce({ data: null, error: { message: "RPC error" } });

    const response = await ProjectPOST(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "test-project" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "RPC error" });
  });

  it("returns 500 on database error", async () => {
    vi.mocked(supabaseMock.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: "PGRST100", message: "Database error" },
          }),
        }),
      }),
    } as any);

    const response = await ProjectGET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "test-project" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "Database error" });
  });
});

describe("Error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles invalid content type for bloq", async () => {
    const { getBloqPostBySlug } = await import("@/lib/bloq");
    vi.mocked(getBloqPostBySlug).mockReturnValue(undefined);

    const response = await BloqGET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "invalid-slug-123" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toBe("Post not found");
  });

  it("handles invalid content type for blip", async () => {
    const { getBlipBySerial } = await import("@/lib/blip");
    vi.mocked(getBlipBySerial).mockResolvedValueOnce(null);

    const response = await BlipGET(new Request("http://localhost"), {
      params: Promise.resolve({ serial: "invalid-serial" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toBe("Blip not found");
  });

  it("handles invalid content type for byte", async () => {
    const { getByteBySerial } = await import("@/lib/byte");
    vi.mocked(getByteBySerial).mockResolvedValueOnce(null);

    const response = await ByteGET(new Request("http://localhost"), {
      params: Promise.resolve({ serial: "invalid-serial" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toBe("Byte not found");
  });

  it("handles missing slug for project", async () => {
    vi.mocked(supabaseMock.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: "PGRST116" },
          }),
        }),
      }),
    } as any);

    const response = await ProjectGET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.views).toBe(0);
  });
});