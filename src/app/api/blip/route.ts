import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { Blip } from "@/types/blip";
import { validateApiKey } from "@/lib/api/validation";
import { jsonError, jsonSuccess, unauthorizedResponse } from "@/lib/api/responses";

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

    if (!term) {
      return jsonError("Term is required", 400);
    }

    if (!meaning) {
      return jsonError("Meaning is required", 400);
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("blips")
      .insert({ term, meaning, tags: [] })
      .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
      .single();

    if (error) {
      console.error("Error creating blip:", error);
      return jsonError("Failed to create blip", 500);
    }

    return jsonSuccess({ blip: data as Blip }, 201);
  } catch (error: unknown) {
    console.error("Error in blip POST:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(message, 500);
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("blips")
      .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blips:", error);
      return jsonError("Failed to fetch blips", 500);
    }

    return jsonSuccess({ blips: data as Blip[] });
  } catch (error: unknown) {
    console.error("Error in blip GET:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(message, 500);
  }
}
