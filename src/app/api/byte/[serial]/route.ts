import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { Byte } from "@/types/byte";
import { validateApiKey, parseContent, validateContentLength } from "@/lib/api/validation";
import { jsonError, jsonSuccess, unauthorizedResponse, notFoundResponse } from "@/lib/api/responses";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ serial: string }> }
) {
  try {
    const { serial } = await params;
    const supabase = getSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("bytes")
      .select("id, content, created_at, byte_serial")
      .eq("byte_serial", serial)
      .single();

    if (error || !data) {
      return notFoundResponse("Byte not found");
    }

    return jsonSuccess({ byte: data as Byte });
  } catch (error: unknown) {
    console.error("Error in byte GET by serial:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(message, 500);
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

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("bytes")
      .update({ content })
      .eq("byte_serial", serial)
      .select("id, content, created_at, byte_serial")
      .single();

    if (error || !data) {
      return notFoundResponse("Byte not found or update failed");
    }

    return jsonSuccess({ byte: data as Byte });
  } catch (error: unknown) {
    console.error("Error in byte PUT:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(message, 500);
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
    const supabase = getSupabaseServerClient();
    
    const { error } = await supabase
      .from("bytes")
      .delete()
      .eq("byte_serial", serial);

    if (error) {
      return jsonError("Failed to delete byte", 500);
    }

    return jsonSuccess({ success: true });
  } catch (error: unknown) {
    console.error("Error in byte DELETE:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(message, 500);
  }
}
