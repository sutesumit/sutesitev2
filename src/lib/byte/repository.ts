import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { Byte } from '@/types/byte';

export async function getBytes(): Promise<Byte[]> {
  const supabase = getSupabaseServerClient();
  
  const { data, error } = await supabase
    .from("bytes")
    .select("id, content, created_at, byte_serial")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bytes:", error);
    return [];
  }

  return data ?? [];
}

export async function getByteBySerial(serial: string): Promise<Byte | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("bytes")
    .select("id, content, created_at, byte_serial")
    .eq("byte_serial", serial)
    .single();

  if (error) {
    console.error("Error fetching byte by serial:", error);
    return null;
  }

  return data;
}

export async function createByte(content: string): Promise<Byte> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bytes")
    .insert({ content })
    .select("id, content, created_at, byte_serial")
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateByte(serial: string, content: string): Promise<Byte> {
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

export async function deleteByte(serial: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("bytes")
    .delete()
    .eq("byte_serial", serial);
  
  if (error) throw error;
}
