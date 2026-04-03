import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { Blip } from '@/types/blip';
import { PaginatedResult, createPaginationInfo, normalizePage, normalizeSearchQuery } from '@/types/pagination';

export async function getBlips(
  page: number = 1,
  limit: number = 10,
  searchQuery?: string,
  tags?: string[]
): Promise<PaginatedResult<Blip>> {
  const supabase = getSupabaseServerClient();
  
  const normalizedPage = normalizePage(page, 1);
  const sanitizedQuery = normalizeSearchQuery(searchQuery);
  const from = (normalizedPage - 1) * limit;
  const to = from + limit - 1;

  // Get total count for pagination
  let total = 0;
  if (sanitizedQuery && sanitizedQuery.length >= 2) {
    const { data: countData } = await supabase.rpc('search_blips_count', { p_query: sanitizedQuery });
    total = countData ?? 0;
  }

  // Build query
  let query = supabase
    .from("blips")
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
    .order("created_at", { ascending: false });

  // Apply filters BEFORE pagination
  if (sanitizedQuery && sanitizedQuery.length >= 2) {
    // Use fuzzy search via RPC (trigram + ILIKE)
    // This is handled below via filtering
  }

  // Filter by tags if specified
  if (tags && tags.length > 0) {
    query = query.contains('tags', tags);
  }

  // If no search, just get count from regular query
  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    let countQuery = supabase
      .from("blips")
      .select("*", { count: 'exact' });
    
    if (tags && tags.length > 0) {
      countQuery = countQuery.contains('tags', tags);
    }
    
    const { count } = await countQuery;
    total = count ?? 0;
  }

  // Apply pagination range
  query = query.range(from, to);

  let data;
  
  // Use fuzzy search function if query exists
  if (sanitizedQuery && sanitizedQuery.length >= 2) {
    const { data: searchResults, error } = await supabase.rpc('search_blips', {
      p_query: sanitizedQuery,
      p_limit: limit,
      p_offset: from
    });
    
    if (error) {
      console.error("Error searching blips:", error);
      return {
        data: [],
        pagination: createPaginationInfo(normalizedPage, limit, 0),
      };
    }
    
    data = searchResults ?? [];
  } else {
    const { data: regularData, error } = await query;
    if (error) {
      console.error("Error fetching blips:", error);
      return {
        data: [],
        pagination: createPaginationInfo(normalizedPage, limit, 0),
      };
    }
    data = regularData ?? [];
  }

  return {
    data: data,
    pagination: createPaginationInfo(normalizedPage, limit, total),
  };
}

export async function listAllBlips(): Promise<Blip[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all blips:", error);
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

export async function getBlipByIdentifier(identifier: string): Promise<Blip | null> {
  const supabase = getSupabaseServerClient();

  const { data: serialMatch, error: serialError } = await supabase
    .from("blips")
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
    .eq("blip_serial", identifier)
    .maybeSingle();

  if (serialError) {
    console.error("Error fetching blip by identifier:", serialError);
    return null;
  }

  if (serialMatch) {
    return serialMatch;
  }

  const { data: idMatch, error: idError } = await supabase
    .from("blips")
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
    .eq("id", identifier)
    .maybeSingle();

  if (idError) {
    console.error("Error fetching blip by identifier:", idError);
    return null;
  }

  return idMatch;
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

export async function updateBlip(serial: string, term: string, meaning: string): Promise<Blip> {
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

export async function deleteBlip(serial: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("blips")
    .delete()
    .eq("blip_serial", serial);

  if (error) throw error;
}

export async function getAllBlipTags(): Promise<{ tag: string; count: number }[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("blips")
    .select("tags")
    .not("tags", "is", null);

  if (error) {
    console.error("Error fetching blip tags:", error);
    return [];
  }

  const tagCounts = new Map<string, number>();
  
  for (const blip of data ?? []) {
    if (blip.tags && Array.isArray(blip.tags)) {
      for (const tag of blip.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  }

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
