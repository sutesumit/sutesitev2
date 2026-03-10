import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { Blip } from '@/types/blip';

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

export async function createBlip(content: string): Promise<Blip> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .insert({ content })
    .select("id, content, created_at, blip_serial")
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateBlip(serial: string, content: string): Promise<Blip> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .update({ content })
    .eq("blip_serial", serial)
    .select("id, content, created_at, blip_serial")
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteBlip(serial: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("blips")
    .delete()
    .eq("blip_serial", serial);
  
  if (error) throw error;
}
