import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function createByte(content: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bytes")
    .insert({ content })
    .select("id, content, created_at, byte_serial")
    .single();
  
  if (error) throw error;
  return data;
}

export async function getBytes(limit = 10) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bytes")
    .select("id, content, created_at, byte_serial")
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

export async function getByteBySerial(serial: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bytes")
    .select("id, content, created_at, byte_serial")
    .eq("byte_serial", serial)
    .single();
  
  if (error) return null;
  return data;
}

export async function updateByte(serial: string, content: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bytes")
    .update({ content })
    .eq("byte_serial", serial)
    .select("id, content, created_at, byte_serial")
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteByte(serial: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("bytes")
    .delete()
    .eq("byte_serial", serial);
  
  if (error) throw error;
}

export async function createBlip(term: string, meaning: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .insert({ term, meaning, tags: [] })
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
    .single();
  
  if (error) throw error;
  return data;
}

export async function getBlips(limit = 10) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

export async function getBlipBySerial(serial: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
    .eq("blip_serial", serial)
    .single();
  
  if (error) return null;
  return data;
}

export async function updateBlip(serial: string, term: string, meaning: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .update({ term, meaning })
    .eq("blip_serial", serial)
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
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
