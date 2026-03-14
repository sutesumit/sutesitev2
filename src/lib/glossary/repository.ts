import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { Blip } from '@/types/glossary';

export async function getBlips(): Promise<Blip[]> {
  const supabase = getSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("blips")
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching blips:", error);
    return [];
  }

  return data ?? [];
}

export async function getBlipBySerial(serial: string): Promise<Blip | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("blips")
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
    .eq("blip_serial", serial)
    .single();

  if (error) {
    console.error("Error fetching blip by serial:", error);
    return null;
  }

  return data;
}

export async function createBlip(term: string, meaning: string, tags: string[] = []): Promise<Blip> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .insert({ term, meaning, tags })
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
    .single();
  
  if (error) throw error;
  return data;
}
