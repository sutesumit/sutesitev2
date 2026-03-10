import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function createBlip(content: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .insert({ content })
    .select("id, content, created_at, blip_serial")
    .single();
  
  if (error) throw error;
  return data;
}

export async function getBlips(limit = 10) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .select("id, content, created_at, blip_serial")
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

export async function getBlipBySerial(serial: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .select("id, content, created_at, blip_serial")
    .eq("blip_serial", serial)
    .single();
  
  if (error) return null;
  return data;
}

export async function updateBlip(serial: string, content: string) {
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

export async function deleteBlip(serial: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("blips")
    .delete()
    .eq("blip_serial", serial);
  
  if (error) throw error;
}
