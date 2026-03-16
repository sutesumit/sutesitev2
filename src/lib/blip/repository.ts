import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { Blip } from '@/types/blip';
import { PaginatedResult, createPaginationInfo, normalizePage, normalizeSearchQuery } from '@/types/pagination';
import Fuse from 'fuse.js';

const fuseOptions = {
  keys: [
    { name: 'term', weight: 0.4 },
    { name: 'meaning', weight: 0.3 },
    { name: 'tags', weight: 0.3 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

export async function getBlips(
  page: number = 1,
  limit: number = 10,
  searchQuery?: string,
  tags?: string[]
): Promise<PaginatedResult<Blip>> {
  const supabase = getSupabaseServerClient();
  
  const normalizedPage = normalizePage(page, 1);
  const sanitizedQuery = normalizeSearchQuery(searchQuery);

  // Fetch all blips for fuzzy search
  const { data: allBlips, error: fetchError } = await supabase
    .from("blips")
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("Error fetching blips:", fetchError);
    return {
      data: [],
      pagination: createPaginationInfo(normalizedPage, limit, 0),
    };
  }

  let filteredBlips = allBlips ?? [];

  // Filter by tags first (if any)
  if (tags && tags.length > 0) {
    const lowerTags = tags.map(t => t.toLowerCase());
    filteredBlips = filteredBlips.filter(blip => 
      blip.tags?.some((tag: string) => lowerTags.includes(tag.toLowerCase()))
    );
  }

  // Apply Fuse.js fuzzy search if query exists
  if (sanitizedQuery && sanitizedQuery.length >= 2) {
    const fuse = new Fuse(filteredBlips, fuseOptions);
    const results = fuse.search(sanitizedQuery);
    filteredBlips = results.map(result => result.item);
  }

  const total = filteredBlips.length;

  // Paginate
  const from = (normalizedPage - 1) * limit;
  const to = from + limit;
  const paginatedData = filteredBlips.slice(from, to);

  return {
    data: paginatedData,
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
