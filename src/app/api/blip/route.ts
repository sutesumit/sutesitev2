import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { Blip } from "@/types/blip";

const noStoreHeaders = { 'Cache-Control': 'no-store' };
const MAX_CONTENT_LENGTH = 280;

function validateApiKey(authHeader: string | null): boolean {
  const key = process.env.BLIP_SECRET_KEY;
  if (!key) {
    console.error("BLIP_SECRET_KEY not configured");
    return false;
  }
  if (!authHeader) return false;
  return authHeader === key;
}

async function parseContent(req: Request): Promise<string> {
  const contentType = req.headers.get("content-type") || "";
  
  // Handle form-urlencoded (curl -d "content=...")
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    // Support both "content=message" and raw "message"
    const content = params.get("content") || params.get("") || text.replace(/^content=/, "");
    return content.trim();
  }
  
  // Handle JSON (curl -H "Content-Type: application/json" -d '{"content":"..."}')
  if (contentType.includes("application/json")) {
    try {
      const body = await req.json();
      return typeof body?.content === 'string' ? body.content.trim() : "";
    } catch {
      return "";
    }
  }
  
  // Raw body (curl -d "message" without content-type)
  try {
    const text = await req.text();
    return text.trim();
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  try {
    // Support both "K" (short) and "X-Key" (legacy) headers
    const authHeader = req.headers.get("K") || req.headers.get("X-Key");
    
    if (!validateApiKey(authHeader)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: noStoreHeaders }
      );
    }

    const content = await parseContent(req);

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400, headers: noStoreHeaders }
      );
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Content must be ${MAX_CONTENT_LENGTH} characters or less` },
        { status: 400, headers: noStoreHeaders }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("blips")
      .insert({ content })
      .select("id, content, created_at")
      .single();

    if (error) {
      console.error("Error creating blip:", error);
      return NextResponse.json(
        { error: "Failed to create blip" },
        { status: 500, headers: noStoreHeaders }
      );
    }

    return NextResponse.json(
      { blip: data as Blip },
      { status: 201, headers: noStoreHeaders }
    );
  } catch (error: unknown) {
    console.error("Error in blip POST:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: noStoreHeaders }
    );
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("blips")
      .select("id, content, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blips:", error);
      return NextResponse.json(
        { error: "Failed to fetch blips" },
        { status: 500, headers: noStoreHeaders }
      );
    }

    return NextResponse.json(
      { blips: data as Blip[] },
      { status: 200, headers: noStoreHeaders }
    );
  } catch (error: unknown) {
    console.error("Error in blip GET:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
