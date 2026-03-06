import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getBloqPostBySlug } from "@/lib/bloq";

const noStoreHeaders = { 'Cache-Control': 'no-store' };

interface RouteParams {
    params: Promise<{ type: string; id: string }>
}

const VALID_POST_TYPES = ['bloq', 'blip'] as const;
type PostType = typeof VALID_POST_TYPES[number];

function validatePostType(type: string): type is PostType {
    return VALID_POST_TYPES.includes(type as PostType);
}

export async function POST(
    req: Request,
    { params }: RouteParams
) {
    try {
        const { type, id } = await params;

        if (!validatePostType(type)) {
            return NextResponse.json(
                { error: "Invalid post type. Must be 'bloq' or 'blip'" },
                { status: 400, headers: noStoreHeaders }
            );
        }

        // Validate post exists
        if (type === 'bloq') {
            const post = getBloqPostBySlug(id);
            if (!post) {
                return NextResponse.json(
                    { error: "Post not found" },
                    { status: 404, headers: noStoreHeaders }
                );
            }
        }

        const body = await req.json().catch(() => ({}));
        const fingerprint = body.fingerprint;

        if (!fingerprint || typeof fingerprint !== 'string') {
            return NextResponse.json(
                { error: "Fingerprint required" },
                { status: 400, headers: noStoreHeaders }
            );
        }

        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase.rpc("upsert_clap", {
            p_post_type: type,
            p_post_id: id,
            p_fingerprint: fingerprint,
            p_increment: 1
        });

        if (error) {
            console.error("Error upserting clap", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500, headers: noStoreHeaders }
            );
        }

        return NextResponse.json({
            userClaps: data.user_claps,
            totalClaps: data.total_claps,
            maxReached: data.max_reached
        }, { status: 200, headers: noStoreHeaders });
    } catch (error) {
        console.error("Error incrementing clap count", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500, headers: noStoreHeaders }
        );
    }
}

export async function GET(
    req: Request,
    { params }: RouteParams
) {
    try {
        const { type, id } = await params;

        if (!validatePostType(type)) {
            return NextResponse.json(
                { error: "Invalid post type. Must be 'bloq' or 'blip'" },
                { status: 400, headers: noStoreHeaders }
            );
        }

        // Validate post exists
        if (type === 'bloq') {
            const post = getBloqPostBySlug(id);
            if (!post) {
                return NextResponse.json(
                    { error: "Post not found" },
                    { status: 404, headers: noStoreHeaders }
                );
            }
        }

        const { searchParams } = new URL(req.url);
        const fingerprint = searchParams.get('fingerprint');

        const supabase = getSupabaseServerClient();

        if (fingerprint) {
            const { data, error } = await supabase.rpc("get_user_claps", {
                p_post_type: type,
                p_post_id: id,
                p_fingerprint: fingerprint
            });

            if (error) {
                console.error("Error getting user claps", error);
                return NextResponse.json(
                    { error: error.message },
                    { status: 500, headers: noStoreHeaders }
                );
            }

            return NextResponse.json({
                claps: data.total_claps,
                userClaps: data.user_claps
            }, { status: 200, headers: noStoreHeaders });
        } else {
            const { data, error } = await supabase.rpc("get_claps", {
                p_post_type: type,
                p_post_id: id
            });

            if (error) {
                console.error("Error getting claps", error);
                return NextResponse.json(
                    { error: error.message },
                    { status: 500, headers: noStoreHeaders }
                );
            }

            return NextResponse.json({
                claps: data.claps,
                userClaps: 0
            }, { status: 200, headers: noStoreHeaders });
        }
    } catch (error) {
        console.error("Error getting clap count", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500, headers: noStoreHeaders }
        );
    }
}
