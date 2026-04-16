import { NextResponse } from "next/server";
import { createBloqNotificationService } from "@/lib/bloq/service";
import { AppError, getErrorMessage } from "@/lib/core/errors";
import { contentMutationEffects } from "@/lib/content-publish";

const noStoreHeaders = { "Cache-Control": "no-store" };
const bloqNotificationService = createBloqNotificationService(contentMutationEffects);

function validateBroadcastSecret(authHeader: string | null): boolean {
  if (!authHeader) return false;
  const validSecrets = [
    process.env.TELEGRAM_BROADCAST_SECRET,
    process.env.TELEGRAM_BOT_TOKEN,
    process.env.TELEGRAM_WEBHOOK_SECRET,
  ].filter(Boolean);
  return validSecrets.some((secret) => secret && authHeader === secret);
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("X-Broadcast-Secret");

  if (!validateBroadcastSecret(authHeader)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: noStoreHeaders }
    );
  }

  try {
    const body = await req.json();
    const { type, title, slug, tags } = body;

    if (type !== "bloq") {
      return NextResponse.json(
        { error: "Unsupported broadcast type" },
        { status: 400, headers: noStoreHeaders }
      );
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
        ? tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
        : [];

    await bloqNotificationService.notifyBloqPublished({
      title,
      slug,
      tags: parsedTags,
    });

    return NextResponse.json(
      { ok: true, broadcast: true },
      { status: 200, headers: noStoreHeaders }
    );
  } catch (error: unknown) {
    console.error("Broadcast error:", error);
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status, headers: noStoreHeaders }
    );
  }
}
