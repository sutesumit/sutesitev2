import { describe, expect, it } from "vitest";
import { formatByte, formatBlip, formatBloq } from "@/lib/telegram/formatters";
import { replies } from "@/lib/telegram/replies";

describe("telegram replies and formatters", () => {
  it("formats channel blip links", () => {
    const result = replies.channelBlip("042", "Some term: some meaning");
    expect(result).toContain("042");
    expect(result).toContain("Some term: some meaning");
    expect(result).toContain("<a href=");
  });

  it("formats bloq channel messages with tags", () => {
    const result = replies.channelBloq("Test Title", "test-slug", ["react", "nextjs"]);
    expect(result).toContain("Test Title");
    expect(result).toContain("test-slug");
    expect(result).toContain("react");
    expect(result).toContain("nextjs");
  });

  it("formats visitor notifications", () => {
    const result = replies.visitorNotification(
      { city: "Mumbai", country: "India", deviceType: "Mac", ip: "127.0.0.1" },
      "https://google.com"
    );

    expect(result).toContain("Mumbai");
    expect(result).toContain("India");
    expect(result).toContain("Mac");
    expect(result).toContain("127.0.0.1");
    expect(result).toContain("google.com");
  });

  it("formats returning visitor counts", () => {
    const result = replies.visitorNotification(
      {
        city: "Vijayawada",
        region: "Andhra Pradesh",
        country: "IN",
        deviceType: "Windows",
        ip: "49.204.148.221",
        isReturning: true,
        visitCount: 520,
      },
      "direct"
    );

    expect(result).toContain("returning");
    expect(result).toContain("(520)");
    expect(result).toContain("Vijayawada");
    expect(result).toContain("Windows");
  });

  it("escapes unsafe content in formatter output", () => {
    const result = formatByte({
      byte_serial: "001",
      content: '<script>alert("xss")</script>',
      created_at: "2026-03-15T10:00:00Z",
    });

    expect(result).toContain("&lt;script&gt;");
    expect(result).not.toContain('<script>');
  });

  it("formats byte entries", () => {
    const result = formatByte({
      byte_serial: "001",
      content: "Test content",
      created_at: "2026-03-15T10:00:00Z",
    });

    expect(result).toContain("001");
    expect(result).toContain("Test content");
    expect(result).toContain("Mar");
  });

  it("formats blip entries", () => {
    const result = formatBlip({
      blip_serial: "001",
      term: "API",
      meaning: "Application Programming Interface",
      created_at: "2026-03-15T10:00:00Z",
    });

    expect(result).toContain("<b>API</b>");
    expect(result).toContain("Application Programming Interface");
  });

  it("formats bloq entries", () => {
    const result = formatBloq({
      title: "Test Title",
      summary: "Test summary",
      slug: "test-title",
      tags: ["react"],
    });

    expect(result).toContain("Test Title");
    expect(result).toContain("Test summary");
    expect(result).toContain("test-title");
    expect(result).toContain("react");
  });
});
