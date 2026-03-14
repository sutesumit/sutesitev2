import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { Blip } from "@/types/glossary";
import { validateApiKey } from "@/lib/api/validation";
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
      .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
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
    
    const contentType = req.headers.get("content-type") || "";
    let term = "";
    let meaning = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      term = typeof body?.term === 'string' ? body.term.trim() : "";
      meaning = typeof body?.meaning === 'string' ? body.meaning.trim() : "";
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      term = (params.get("term") || "").trim();
      meaning = (params.get("meaning") || "").trim();
    } else {
      const text = await req.text();
      const params = new URLSearchParams(text);
      term = (params.get("term") || "").trim();
      meaning = (params.get("meaning") || "").trim();
    }

    if (!term) {
      return jsonError("Term is required", 400);
    }

    if (!meaning) {
      return jsonError("Meaning is required", 400);
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("blips")
      .update({ term, meaning })
      .eq("blip_serial", serial)
      .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
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
