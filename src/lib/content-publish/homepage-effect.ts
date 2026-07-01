import { revalidatePath } from "next/cache";
import type { ContentMutationEffect, ContentMutationEvent } from "./types";

export const homepageMutationEffect: ContentMutationEffect = {
  async onMutation(event: ContentMutationEvent): Promise<void> {
    revalidatePath("/");
    if (event.type === "live-bloq" || event.type === "bloq") {
      revalidatePath("/bloq");
    }
  },
};
