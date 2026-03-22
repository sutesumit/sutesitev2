import { createByteService } from "@/lib/byte/service";
import { AppError, NotFoundError, getErrorMessage } from "@/lib/core/errors";
import type { ByteDetailResponse, DeleteResponse } from "@/lib/api/contracts";
import { validateApiKey, parseContent, validateContentLength } from "@/lib/api/validation";
import { jsonError, jsonSuccess, unauthorizedResponse, notFoundResponse } from "@/lib/api/responses";
import { telegramNotifier } from "@/lib/notifications/telegram-notifier";

const service = createByteService({
  notifier: telegramNotifier,
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ serial: string }> }
) {
  try {
    const { serial } = await params;
    const byte = await service.getByteBySerial(serial);
    return jsonSuccess<ByteDetailResponse>({ byte });
  } catch (error: unknown) {
    console.error("Error in byte GET by serial:", error);

    if (error instanceof NotFoundError) {
      return notFoundResponse(error.message);
    }

    return jsonError(getErrorMessage(error), 500);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ serial: string }> }
) {
  try {
    const authHeader = req.headers.get("K") || req.headers.get("X-Key");

    if (!validateApiKey(authHeader)) {
      return unauthorizedResponse();
    }

    const { serial } = await params;
    const content = await parseContent(req);
    const validation = validateContentLength(content);

    if (!validation.valid) {
      return jsonError(validation.error!, 400);
    }

    const byte = await service.updateByte(serial, content);
    return jsonSuccess<ByteDetailResponse>({ byte });
  } catch (error: unknown) {
    console.error("Error in byte PUT:", error);

    if (error instanceof NotFoundError) {
      return notFoundResponse(error.message);
    }

    if (error instanceof AppError) {
      return jsonError(error.message, error.status);
    }

    return jsonError(getErrorMessage(error), 500);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ serial: string }> }
) {
  try {
    const authHeader = req.headers.get("K") || req.headers.get("X-Key");

    if (!validateApiKey(authHeader)) {
      return unauthorizedResponse();
    }

    const { serial } = await params;
    await service.deleteByte(serial);
    return jsonSuccess<DeleteResponse>({ success: true });
  } catch (error: unknown) {
    console.error("Error in byte DELETE:", error);

    if (error instanceof NotFoundError) {
      return notFoundResponse(error.message);
    }

    return jsonError(getErrorMessage(error), 500);
  }
}
