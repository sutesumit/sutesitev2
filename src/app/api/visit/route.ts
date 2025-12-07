import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

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
        

        // Fetch previous visitor, ensuring we don't get the current user's latest visit
        // We filter out the current IP so we see the actual *previous* person from a different location/device
        let query = supabase
            .from('visits')
            .select('city, country')
            .order('created_at', { ascending: false })
            .limit(1);

        if (body.ip) {
            query = query.neq('ip', body.ip);
        } else {
            // Fallback for when we don't have an IP to filter by
            // In this specific edge case, we might interpret "previous" as "2nd most recent" 
            // if we assume the most recent is the current one we just (potentially) inserted.
            // However, without an IP, we can't reliably assume identity. 
            // Using range(1, 1) mimics the old behavior as a fallback.
            query = query.range(1, 1);
        }

        const { data: prevVisits, error: fetchError } = await query;
        
        if (fetchError) {
            return NextResponse.json({ 
                error: fetchError.message
            }, { status: 500 });
        }

        const lastVisitor = prevVisits?.[0];

        return NextResponse.json({ 
            lastVisitorLocation: lastVisitor ? `${lastVisitor.city}, ${lastVisitor.country}` : null 
        });
    } catch (error) {
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
