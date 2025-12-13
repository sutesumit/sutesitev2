import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getBloqPostBySlug } from "@/lib/bloq";

const noStoreHeaders = { 'Cache-Control': 'no-store' };

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const post = getBloqPostBySlug(slug);

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" }, 
                { status: 404, headers: noStoreHeaders }
            );
        }

        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase.rpc("increment_bloq_view", {
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
        console.error("Error incrementing bloq view count", error);
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
        const post = getBloqPostBySlug(slug);

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" }, 
                { status: 404, headers: noStoreHeaders }
            );
        }

        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase
            .from("bloq_views")
            .select("views")
            .eq("slug", slug)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 is the error code for "no rows in result". This is expected for new posts.
            console.error("Error getting bloq view count", error);
            return NextResponse.json(
                { error: error.message }, 
                { status: 500, headers: noStoreHeaders }
            );
        }

        const views = data?.views ?? 0;
        return NextResponse.json({ views }, { status: 200, headers: noStoreHeaders });
    } catch (error) {
        console.error("Error getting bloq view count", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500, headers: noStoreHeaders }
        );
    }
}