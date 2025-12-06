import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
    if (!supabaseInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Supabase environment variables are not configured");
        }

        supabaseInstance = createClient(supabaseUrl, supabaseKey);
    }

    return supabaseInstance;
}

// For backward compatibility, export a getter
export const supabase = new Proxy({} as SupabaseClient, {
    get(target, prop) {
        return getSupabaseClient()[prop as keyof SupabaseClient];
    }
});