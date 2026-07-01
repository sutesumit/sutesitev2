import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { LiveSession, LiveEntry, AddEntryResult } from "./types";

export async function createSession(
  title: string,
  slug: string
): Promise<LiveSession> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("live_bloq_sessions")
    .insert({ title, slug })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function addEntry(
  sessionId: string,
  content: string
): Promise<AddEntryResult> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.rpc("add_live_entry", {
    p_session_id: sessionId,
    p_content: content,
  });

  if (error) throw error;

  // RPC returns an array with one row
  const row = (data as AddEntryResult[])?.[0];
  if (!row) {
    throw new Error("add_live_entry RPC returned no data");
  }

  return {
    entry_id: row.entry_id,
    entry_sequence: row.entry_sequence,
    session_slug: row.session_slug,
  };
}

export async function closeSession(sessionId: string): Promise<LiveSession> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("live_bloq_sessions")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("status", "active")
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function cancelSession(sessionId: string): Promise<LiveSession> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("live_bloq_sessions")
    .update({ status: "cancelled" })
    .eq("id", sessionId)
    .eq("status", "active")
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateSummary(
  sessionId: string,
  summary: string
): Promise<LiveSession> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("live_bloq_sessions")
    .update({ summary })
    .eq("id", sessionId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionBySlug(
  slug: string
): Promise<LiveSession | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("live_bloq_sessions")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching session by slug:", error);
    return null;
  }

  return data;
}

export async function getSessionById(
  id: string
): Promise<LiveSession | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("live_bloq_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching session by id:", error);
    return null;
  }

  return data;
}

export async function getEntries(sessionId: string): Promise<LiveEntry[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("live_bloq_entries")
    .select("*")
    .eq("session_id", sessionId)
    .order("sequence", { ascending: true });

  if (error) {
    console.error("Error fetching entries:", error);
    return [];
  }

  return data ?? [];
}

export async function getEntriesAfter(
  sessionId: string,
  afterSequence: number
): Promise<LiveEntry[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("live_bloq_entries")
    .select("*")
    .eq("session_id", sessionId)
    .gt("sequence", afterSequence)
    .order("sequence", { ascending: true });

  if (error) {
    console.error("Error fetching entries after:", error);
    return [];
  }

  return data ?? [];
}

export async function listSessions(): Promise<LiveSession[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("live_bloq_sessions")
    .select("*")
    .order("started_at", { ascending: false });

  if (error) {
    console.error("Error listing sessions:", error);
    return [];
  }

  return data ?? [];
}

export async function findActiveSession(): Promise<LiveSession | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("live_bloq_sessions")
    .select("*")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error finding active session:", error);
    return null;
  }

  return data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("live_bloq_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) throw error;
}
