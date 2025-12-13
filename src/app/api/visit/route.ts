import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Only insert if we have valid location data
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
                
            // Silently continue even if insert fails - still fetch previous visitor
        }
        

        // Always fetch previous visitor using Service Role key if available to bypass RLS
        // // This is crucial because "anonymous" users usually can't see *other* users' data

        const queryClient = await getSupabaseServerClient();

        const { data: prevVisits, error: fetchError } = await queryClient
            .from('visits')
            .select('city, country')
            .neq('ip', body.ip)
            .order('created_at', { ascending: false })
            .limit(1);

        if (fetchError) {
            console.error(fetchError);
            return NextResponse.json({
                error: fetchError.message
            }, { status: 500 });
        }

        const { data: uniqueCount } = await queryClient.rpc('get_unique_visitor_count');

        const lastVisitor = prevVisits?.[0] ?? null;

        return NextResponse.json({ 
            lastVisitorLocation: lastVisitor 
                ? `${lastVisitor.city}, ${lastVisitor.country}` 
                : null,
            visitorCount: uniqueCount ?? null
        });
    } catch (error) {
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
