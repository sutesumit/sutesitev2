import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { noStoreHeaders } from "@/lib/api/constants";
import { jsonError } from "@/lib/api/responses";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.city || body.country_code) {
            await supabase
                .from('visits')
                .insert([
                    {
                        ip: body.ip,
                        network: body.network,
                        city: body.city,
                        region: body.region,
                        country: body.country_code,
                        postal: body.postal,
                        latitude: body.latitude,
                        longitude: body.longitude,
                        org: body.org,
                        timezone: body.timezone,
                    }
                ]);
        }

        const queryClient = await getSupabaseServerClient();

        const { data: prevVisits, error: fetchError } = await queryClient
            .from('visits')
            .select('city, country')
            .neq('ip', body.ip)
            .order('created_at', { ascending: false })
            .limit(1);

        if (fetchError) {
            console.error(fetchError);
            return jsonError(fetchError.message, 500);
        }

        const { data: uniqueCount } = await queryClient.rpc('get_unique_visitor_count');

        const lastVisitor = prevVisits?.[0] ?? null;

        return NextResponse.json({ 
            lastVisitorLocation: lastVisitor 
                ? `${lastVisitor.city}, ${lastVisitor.country}` 
                : null,
            visitorCount: uniqueCount ?? null
        }, {
            headers: noStoreHeaders
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return jsonError(message, 500);
    }
}
