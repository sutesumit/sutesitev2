import { createBlipService } from "@/lib/blip/service";
import { AppError, getErrorMessage } from "@/lib/core/errors";
import type { BlipDetailResponse, BlipListResponse } from "@/lib/api/contracts";
import { validateApiKey } from "@/lib/api/validation";
import { jsonError, jsonSuccess, unauthorizedResponse } from "@/lib/api/responses";
import { contentMutationEffects } from "@/lib/content-publish";

const service = createBlipService({
  mutationEffect: contentMutationEffects,
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("K") || req.headers.get("X-Key");

    if (!validateApiKey(authHeader)) {
      return unauthorizedResponse();
    }

    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return jsonError("Content-Type must be application/json", 400);
    }

    const body = await req.json();
    const term = body?.term?.trim() || "";
    const meaning = body?.meaning?.trim() || "";
    const blip = await service.createBlip(term, meaning);

    return jsonSuccess<BlipDetailResponse>({ blip }, 201);
  } catch (error: unknown) {
    console.error("Error in blip POST:", error);

    if (error instanceof AppError) {
      return jsonError(error.message, error.status);
    }

    return jsonError(getErrorMessage(error), 500);
  }
}

export async function GET() {
  try {
    const blips = await service.listAllBlips();
    return jsonSuccess<BlipListResponse>({ blips });
  } catch (error: unknown) {
    console.error("Error in blip GET:", error);
    return jsonError(getErrorMessage(error), 500);
  }
}
