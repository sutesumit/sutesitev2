import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { getBlipBySerial } from "@/lib/blip";

const noStoreHeaders = { 'Cache-Control': 'no-store' };

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ serial: string }> }
) {
    try {
        const { serial } = await params;
        const blip = await getBlipBySerial(serial);

        if (!blip) {
            return NextResponse.json(
                { error: "Blip not found" }, 
                { status: 404, headers: noStoreHeaders }
            );
        }

        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase.rpc("increment_blip_view", {
            p_serial: serial
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
        console.error("Error incrementing blip view count", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500, headers: noStoreHeaders }
        );
    }
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ serial: string }> }
) {
    try {
        const { serial } = await params;
        const blip = await getBlipBySerial(serial);

        if (!blip) {
            return NextResponse.json(
                { error: "Blip not found" }, 
                { status: 404, headers: noStoreHeaders }
            );
        }

        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase
            .from("blip_views")
            .select("views")
            .eq("serial", serial)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Error getting blip view count", error);
            return NextResponse.json(
                { error: error.message }, 
                { status: 500, headers: noStoreHeaders }
            );
        }

        const views = data?.views ?? 0;
        return NextResponse.json({ views }, { status: 200, headers: noStoreHeaders });
    } catch (error) {
        console.error("Error getting blip view count", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500, headers: noStoreHeaders }
        );
    }
}
