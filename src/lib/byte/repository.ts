import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { Byte } from '@/types/byte';
import { PaginatedResult, createPaginationInfo, normalizePage, normalizeSearchQuery } from '@/types/pagination';

export async function getBytes(
  page: number = 1,
  limit: number = 10,
  searchQuery?: string
): Promise<PaginatedResult<Byte>> {
  const supabase = getSupabaseServerClient();
  
  const normalizedPage = normalizePage(page, 1);
  const sanitizedQuery = normalizeSearchQuery(searchQuery);
  const from = (normalizedPage - 1) * limit;
  const to = from + limit - 1;

  // Build query
  let query = supabase
    .from("bytes")
    .select("id, content, created_at, byte_serial", { count: 'exact' })
    .order("created_at", { ascending: false })
    .range(from, to);

  // Add search filter if query exists
  if (sanitizedQuery) {
    query = query.ilike('content', `%${sanitizedQuery}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching bytes:", error);
    return {
      data: [],
      pagination: createPaginationInfo(normalizedPage, limit, 0),
    };
  }

  const total = count ?? 0;

  return {
    data: data ?? [],
    pagination: createPaginationInfo(normalizedPage, limit, total),
  };
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

export async function getAdjacentBytes(currentSerial: number): Promise<{ newer: Byte | null; older: Byte | null }> {
  const supabase = getSupabaseServerClient();

  const [newerResult, olderResult] = await Promise.all([
    supabase.from("bytes")
      .select("id, content, created_at, byte_serial")
      .lt("byte_serial", currentSerial)
      .order("byte_serial", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("bytes")
      .select("id, content, created_at, byte_serial")
      .gt("byte_serial", currentSerial)
      .order("byte_serial", { ascending: true })
      .limit(1)
      .maybeSingle()
  ]);

  return {
    newer: newerResult.data,
    older: olderResult.data,
  };
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
