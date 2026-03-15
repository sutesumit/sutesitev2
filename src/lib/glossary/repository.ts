import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { Blip } from '@/types/glossary';
import { PaginatedResult, createPaginationInfo, normalizePage, normalizeSearchQuery } from '@/types/pagination';

export async function getBlips(
  page: number = 1,
  limit: number = 10,
  searchQuery?: string
): Promise<PaginatedResult<Blip>> {
  const supabase = getSupabaseServerClient();
  
  const normalizedPage = normalizePage(page, 1);
  const sanitizedQuery = normalizeSearchQuery(searchQuery);
  const from = (normalizedPage - 1) * limit;
  const to = from + limit - 1;

  // Build query
  let query = supabase
    .from("blips")
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at", { count: 'exact' })
    .order("created_at", { ascending: false })
    .range(from, to);

  // Add search filter if query exists (search in term and meaning)
  if (sanitizedQuery) {
    query = query.or(`term.ilike.%${sanitizedQuery}%,meaning.ilike.%${sanitizedQuery}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching blips:", error);
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

export async function getAdjacentBlips(currentSerial: number): Promise<{ newer: Blip | null; older: Blip | null }> {
  const supabase = getSupabaseServerClient();

  const [newerResult, olderResult] = await Promise.all([
    supabase.from("blips")
      .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
      .lt("blip_serial", currentSerial)
      .order("blip_serial", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("blips")
      .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
      .gt("blip_serial", currentSerial)
      .order("blip_serial", { ascending: true })
      .limit(1)
      .maybeSingle()
  ]);

  return {
    newer: newerResult.data,
    older: olderResult.data,
  };
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
