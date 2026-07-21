import { describe, expect, it } from "vitest";
import {
  LIVE_BLOQ_ID_PREFIX,
  buildLiveBloqEngagementId,
  getBloqEngagementIdentity,
  isLiveBloqEngagementId,
  parseLiveBloqSlug,
} from "../content-identity";

describe("content-identity", () => {
  it("builds live bloq engagement ids with the shared prefix", () => {
    expect(LIVE_BLOQ_ID_PREFIX).toBe("live/");
    expect(buildLiveBloqEngagementId("react-conf")).toBe("live/react-conf");
  });

  it("detects and parses live bloq engagement ids", () => {
    expect(isLiveBloqEngagementId("live/my-session")).toBe(true);
    expect(isLiveBloqEngagementId("my-mdx-post")).toBe(false);
    expect(parseLiveBloqSlug("live/my-session")).toBe("my-session");
    expect(parseLiveBloqSlug("my-mdx-post")).toBeNull();
  });

  it("returns bloq engagement identity from BloqPost.url", () => {
    expect(getBloqEngagementIdentity({ url: "live/my-session" })).toEqual({
      type: "bloq",
      id: "live/my-session",
    });
    expect(getBloqEngagementIdentity({ url: "ordinary-post" })).toEqual({
      type: "bloq",
      id: "ordinary-post",
    });
  });
});
