import { revalidatePath } from "next/cache";
import type { ContentPublishEffect, PublishedContent } from "./types";

export const homepagePublishEffect: ContentPublishEffect = {
  async onPublished(_event: PublishedContent): Promise<void> {
    revalidatePath("/");
  },
};
