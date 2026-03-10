import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { Blip } from "@/types/blip";
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
      .from("blips")
      .select("id, content, created_at, blip_serial")
      .eq("blip_serial", serial)
      .single();

    if (error || !data) {
      return notFoundResponse("Blip not found");
    }

    return jsonSuccess({ blip: data as Blip });
  } catch (error: unknown) {
    console.error("Error in blip GET by serial:", error);
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
      .from("blips")
      .update({ content })
      .eq("blip_serial", serial)
      .select("id, content, created_at, blip_serial")
      .single();

    if (error || !data) {
      return notFoundResponse("Blip not found or update failed");
    }

    return jsonSuccess({ blip: data as Blip });
  } catch (error: unknown) {
    console.error("Error in blip PUT:", error);
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
      .from("blips")
      .delete()
      .eq("blip_serial", serial);

    if (error) {
      return jsonError("Failed to delete blip", 500);
    }

    return jsonSuccess({ success: true });
  } catch (error: unknown) {
    console.error("Error in blip DELETE:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(message, 500);
  }
}
