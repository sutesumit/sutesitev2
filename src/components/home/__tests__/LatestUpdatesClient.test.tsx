import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LatestUpdatesClient } from "../LatestUpdatesClient";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/shared/ScrambleText", () => ({
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));

vi.mock("@/lib/formatTimeAgo", () => ({
  formatTimeAgo: () => "just now",
}));

describe("LatestUpdatesClient", () => {
  it("renders links for the latest bloq, byte, and blip", () => {
    render(
      <LatestUpdatesClient
        latestBloq={{
          slug: "latest-bloq",
          title: "Latest Bloq",
          publishedAt: "2026-03-28T00:00:00Z",
          summary: "Summary",
          content: "",
          url: "latest-bloq",
          category: "notes",
          tags: [],
          authors: [],
          image: undefined,
          draft: false,
          featured: false,
          status: "published",
          readingTime: 1,
        }}
        latestByte={{
          id: "1",
          byte_serial: "001",
          content: "Latest Byte",
          created_at: "2026-03-28T00:00:00Z",
        }}
        latestBlip={{
          id: "1",
          blip_serial: "B001",
          term: "Latest Blip",
          meaning: "Meaning",
          tags: [],
          created_at: "2026-03-28T00:00:00Z",
          updated_at: "2026-03-28T00:00:00Z",
        }}
      />
    );

    expect(screen.getByRole("link", { name: /bloq/i })).toHaveAttribute("href", "/bloq/latest-bloq");
    expect(screen.getByRole("link", { name: /byte/i })).toHaveAttribute("href", "/byte/001");
    expect(screen.getByRole("link", { name: /blip/i })).toHaveAttribute("href", "/blip/B001");
  });
});
