import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getBloqPostBySlug } from "@/lib/bloq";
import { jsonError, jsonSuccess } from "@/lib/api/responses";
import { resolveNotificationContentSummary } from "@/lib/notifications/content-summary";
import { telegramNotifier } from "@/lib/notifications/telegram-notifier";

interface RouteParams {
    params: Promise<{ type: string; id: string }>
}

const VALID_POST_TYPES = ['bloq', 'blip', 'byte', 'project'] as const;
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
            return jsonError("Invalid post type. Must be 'bloq', 'blip', 'byte', or 'project'", 400);
        }

        if (type === 'bloq') {
            const post = getBloqPostBySlug(id);
            if (!post) {
                return jsonError("Post not found", 404);
            }
        }

        const body = await req.json().catch(() => ({}));
        const fingerprint = body.fingerprint;
        const ip = typeof body.ip === "string" ? body.ip : null;

        if (!fingerprint || typeof fingerprint !== 'string') {
            return jsonError("Fingerprint required", 400);
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
            return jsonError(error.message, 500);
        }

        void resolveNotificationContentSummary(type, id)
            .then((summary) => telegramNotifier.notifyClapIncrement({
                ...summary,
                ip,
                total: data.total_claps,
            }))
            .catch((error: unknown) => {
                console.error("Clap notification error:", error);
            });

        return jsonSuccess({
            userClaps: data.user_claps,
            totalClaps: data.total_claps,
            maxReached: data.max_reached
        });
    } catch (error: unknown) {
        console.error("Error incrementing clap count", error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return jsonError(message, 500);
    }
}

export async function GET(
    req: Request,
    { params }: RouteParams
) {
    try {
        const { type, id } = await params;

        if (!validatePostType(type)) {
            return jsonError("Invalid post type. Must be 'bloq', 'blip', 'byte', or 'project'", 400);
        }

        if (type === 'bloq') {
            const post = getBloqPostBySlug(id);
            if (!post) {
                return jsonError("Post not found", 404);
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
                return jsonError(error.message, 500);
            }

            return jsonSuccess({
                claps: data.total_claps,
                userClaps: data.user_claps
            });
        } else {
            const { data, error } = await supabase.rpc("get_claps", {
                p_post_type: type,
                p_post_id: id
            });

            if (error) {
                console.error("Error getting claps", error);
                return jsonError(error.message, 500);
            }

            return jsonSuccess({
                claps: data.claps,
                userClaps: 0
            });
        }
    } catch (error: unknown) {
        console.error("Error getting clap count", error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return jsonError(message, 500);
    }
}
