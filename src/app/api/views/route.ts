import { NextResponse } from "next/server";
import { resolveNotificationContentSummary } from "@/lib/notifications/content-summary";
import { telegramNotifier } from "@/lib/notifications/telegram-notifier";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

const VALID_CONTENT_TYPES = ['bloq', 'blip', 'byte', 'project'] as const;
type ContentType = typeof VALID_CONTENT_TYPES[number];

const noStoreHeaders = { 'Cache-Control': 'no-store' };

function isValidContentType(type: string): type is ContentType {
    return VALID_CONTENT_TYPES.includes(type as ContentType);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type) {
        return NextResponse.json({ error: 'type is required' }, { status: 400, headers: noStoreHeaders });
    }
    if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400, headers: noStoreHeaders });
    }

    if (!isValidContentType(type)) {
        return NextResponse.json({ 
            error: `Invalid type. Must be one of: ${VALID_CONTENT_TYPES.join(', ')}` 
        }, { status: 400, headers: noStoreHeaders });
    }

    try {
        const supabase = getSupabaseServerClient();
        
        const { data, error } = await supabase.rpc('get_content_view', {
            p_content_type: type,
            p_identifier: id
        });

        if (error) {
            console.error('Error getting view count:', error);
            return NextResponse.json({ error: error.message }, { status: 500, headers: noStoreHeaders });
        }

        return NextResponse.json({ views: data ?? 0 }, { status: 200, headers: noStoreHeaders });
    } catch (error: unknown) {
        console.error('Error getting view count:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500, headers: noStoreHeaders });
    }
}

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type) {
        return NextResponse.json({ error: 'type is required' }, { status: 400, headers: noStoreHeaders });
    }
    if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400, headers: noStoreHeaders });
    }

    if (!isValidContentType(type)) {
        return NextResponse.json({ 
            error: `Invalid type. Must be one of: ${VALID_CONTENT_TYPES.join(', ')}` 
        }, { status: 400, headers: noStoreHeaders });
    }

    try {
        const body = await request.json().catch(() => null);
        const ip = typeof body?.ip === 'string' ? body.ip : null;
        const supabase = getSupabaseServerClient();
        
        const { data, error } = await supabase.rpc('increment_content_view', {
            p_content_type: type,
            p_identifier: id
        });

        if (error) {
            console.error('Error incrementing view count:', error);
            return NextResponse.json({ error: error.message }, { status: 500, headers: noStoreHeaders });
        }

        const views = typeof data === 'number' ? data : 0;

        void resolveNotificationContentSummary(type, id)
            .then((summary) => telegramNotifier.notifyViewIncrement({
                ...summary,
                ip,
                total: views,
            }))
            .catch((error: unknown) => {
                console.error('View notification error:', error);
            });

        return NextResponse.json({ views }, { status: 200, headers: noStoreHeaders });
    } catch (error: unknown) {
        console.error('Error incrementing view count:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500, headers: noStoreHeaders });
    }
}
