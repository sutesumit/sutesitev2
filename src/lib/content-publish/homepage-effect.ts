import { revalidatePath } from "next/cache";
import type { ContentMutationEffect, ContentMutationEvent } from "./types";

export const homepageMutationEffect: ContentMutationEffect = {
  async onMutation(_event: ContentMutationEvent): Promise<void> {
    revalidatePath("/");
  },
};
