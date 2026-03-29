import { createByteService } from "@/lib/byte/service";
import { AppError, getErrorMessage } from "@/lib/core/errors";
import type { ByteDetailResponse, ByteListResponse } from "@/lib/api/contracts";
import { validateApiKey, parseContent, validateContentLength } from "@/lib/api/validation";
import { jsonError, jsonSuccess, unauthorizedResponse } from "@/lib/api/responses";
import { contentMutationEffects } from "@/lib/content-publish";

const service = createByteService({
  mutationEffect: contentMutationEffects,
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("K") || req.headers.get("X-Key");

    if (!validateApiKey(authHeader)) {
      return unauthorizedResponse();
    }

    const content = await parseContent(req);
    const validation = validateContentLength(content);

    if (!validation.valid) {
      return jsonError(validation.error!, 400);
    }

    const byte = await service.createByte(content);
    return jsonSuccess<ByteDetailResponse>({ byte }, 201);
  } catch (error: unknown) {
    console.error("Error in byte POST:", error);

    if (error instanceof AppError) {
      return jsonError(error.message, error.status);
    }

    return jsonError(getErrorMessage(error), 500);
  }
}

export async function GET() {
  try {
    const bytes = await service.listAllBytes();
    return jsonSuccess<ByteListResponse>({ bytes });
  } catch (error: unknown) {
    console.error("Error in byte GET:", error);
    return jsonError(getErrorMessage(error), 500);
  }
}
