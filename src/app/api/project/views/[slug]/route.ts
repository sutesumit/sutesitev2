import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

const noStoreHeaders = { 'Cache-Control': 'no-store' };

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase.rpc("increment_project_view", {
            p_slug: slug
        })

        if (error) {
            return NextResponse.json(
                { error: error.message }, 
                { status: 500, headers: noStoreHeaders }
            );
        }

        const views = typeof data === 'number' ? data : 0;
        return NextResponse.json({ views }, { status: 200, headers: noStoreHeaders });
    } catch (error) {
        console.error("Error incrementing project view count", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500, headers: noStoreHeaders }
        );
    }
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase
            .from("project_views")
            .select("views")
            .eq("slug", slug)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Error getting project view count", error);
            return NextResponse.json(
                { error: error.message }, 
                { status: 500, headers: noStoreHeaders }
            );
        }

        const views = data?.views ?? 0;
        return NextResponse.json({ views }, { status: 200, headers: noStoreHeaders });
    } catch (error) {
        console.error("Error getting project view count", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500, headers: noStoreHeaders }
        );
    }
}
