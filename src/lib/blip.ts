import { getSupabaseServerClient } from "./supabaseServerClient";
import type { Blip } from "@/types/blip";

export async function getBlips(): Promise<Blip[]> {
  const supabase = getSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("blips")
    .select("id, content, created_at, blip_serial")
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
    .select("id, content, created_at, blip_serial")
    .eq("blip_serial", serial)
    .single();

  if (error) {
    console.error("Error fetching blip by serial:", error);
    return null;
  }

  return data;
}
