import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { noStoreHeaders } from "@/lib/api/constants";
import { jsonError } from "@/lib/api/responses";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.ip) {
            await supabase
                .from('visits')
                .insert([
                    {
                        ip: body.ip,
                        network: body.network,
                        city: body.city || null,
                        region: body.region || null,
                        country: body.country_code || null,
                        postal: body.postal || null,
                        latitude: body.latitude || null,
                        longitude: body.longitude || null,
                        org: body.org || null,
                        timezone: body.timezone || null,
                    }
                ]);
        }

        const queryClient = await getSupabaseServerClient();

        let query = queryClient
            .from('visits')
            .select('ip, city, country, created_at')
            .order('created_at', { ascending: false });

        if (body.ip) {
            query = query.neq('ip', body.ip);
        }

        const { data: prevVisits, error: fetchError } = await query.limit(1);

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
            lastVisitTime: lastVisitor?.created_at ?? null,
            visitorCount: uniqueCount ?? null
        }, {
            headers: noStoreHeaders
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return jsonError(message, 500);
    }
}
