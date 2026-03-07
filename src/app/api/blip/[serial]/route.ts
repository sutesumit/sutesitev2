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
  
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    const content = params.get("content") || params.get("") || text.replace(/^content=/, "");
    return content.trim();
  }
  
  if (contentType.includes("application/json")) {
    try {
      const body = await req.json();
      return typeof body?.content === 'string' ? body.content.trim() : "";
    } catch {
      return "";
    }
  }
  
  try {
    const text = await req.text();
    return text.trim();
  } catch {
    return "";
  }
}

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
      return NextResponse.json(
        { error: "Blip not found" },
        { status: 404, headers: noStoreHeaders }
      );
    }

    return NextResponse.json(
      { blip: data as Blip },
      { status: 200, headers: noStoreHeaders }
    );
  } catch (error: unknown) {
    console.error("Error in blip GET by serial:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: noStoreHeaders }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ serial: string }> }
) {
  try {
    const authHeader = req.headers.get("K") || req.headers.get("X-Key");
    
    if (!validateApiKey(authHeader)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: noStoreHeaders }
      );
    }

    const { serial } = await params;
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
      .update({ content })
      .eq("blip_serial", serial)
      .select("id, content, created_at, blip_serial")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Blip not found or update failed" },
        { status: 404, headers: noStoreHeaders }
      );
    }

    return NextResponse.json(
      { blip: data as Blip },
      { status: 200, headers: noStoreHeaders }
    );
  } catch (error: unknown) {
    console.error("Error in blip PUT:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: noStoreHeaders }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ serial: string }> }
) {
  try {
    const authHeader = req.headers.get("K") || req.headers.get("X-Key");
    
    if (!validateApiKey(authHeader)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: noStoreHeaders }
      );
    }

    const { serial } = await params;
    const supabase = getSupabaseServerClient();
    
    const { error } = await supabase
      .from("blips")
      .delete()
      .eq("blip_serial", serial);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete blip" },
        { status: 500, headers: noStoreHeaders }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: noStoreHeaders }
    );
  } catch (error: unknown) {
    console.error("Error in blip DELETE:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
