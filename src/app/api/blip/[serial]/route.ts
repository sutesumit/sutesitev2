import { createBlipService } from "@/lib/blip/service";
import { AppError, NotFoundError, getErrorMessage } from "@/lib/core/errors";
import type { BlipDetailResponse, DeleteResponse } from "@/lib/api/contracts";
import { validateApiKey } from "@/lib/api/validation";
import { jsonError, jsonSuccess, unauthorizedResponse, notFoundResponse } from "@/lib/api/responses";
import { telegramNotifier } from "@/lib/notifications/telegram-notifier";

const service = createBlipService({
  notifier: telegramNotifier,
});

function parseBlipBody(contentType: string, body: unknown): { term: string; meaning: string } {
  if (contentType.includes("application/json")) {
    const payload = body as { term?: string; meaning?: string };
    return {
      term: typeof payload.term === "string" ? payload.term.trim() : "",
      meaning: typeof payload.meaning === "string" ? payload.meaning.trim() : "",
    };
  }

  const text = typeof body === "string" ? body : "";
  const params = new URLSearchParams(text);

  return {
    term: (params.get("term") || "").trim(),
    meaning: (params.get("meaning") || "").trim(),
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ serial: string }> }
) {
  try {
    const { serial } = await params;
    const blip = await service.getBlipBySerial(serial);
    return jsonSuccess<BlipDetailResponse>({ blip });
  } catch (error: unknown) {
    console.error("Error in blip GET by serial:", error);

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
    const contentType = req.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await req.json()
      : await req.text();
    const { term, meaning } = parseBlipBody(contentType, payload);
    const blip = await service.updateBlip(serial, term, meaning);

    return jsonSuccess<BlipDetailResponse>({ blip });
  } catch (error: unknown) {
    console.error("Error in blip PUT:", error);

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
    await service.deleteBlip(serial);

    return jsonSuccess<DeleteResponse>({ success: true });
  } catch (error: unknown) {
    console.error("Error in blip DELETE:", error);

    if (error instanceof NotFoundError) {
      return notFoundResponse(error.message);
    }

    return jsonError(getErrorMessage(error), 500);
  }
}
