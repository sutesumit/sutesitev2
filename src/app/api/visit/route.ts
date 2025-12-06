import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
    const body = await request.json();

    const { error: insertError } = await supabase
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
        ])
        if (insertError) {
            console.error('Error inserting visit:', insertError);
            return NextResponse.json({ error: 'Error inserting visit' }, { status: 500 });
        }
    const { data: prevVisits, error: fetchError } = await supabase
        .from('visits')
        .select('city, country')
        .order('created_at', { ascending: false })
        .limit(1)
        .range(1, 1);
    
    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const lastVisitor = prevVisits?.[0];

    return NextResponse.json({ 
        lastVisitorLocation: lastVisitor ? `${lastVisitor.city}, ${lastVisitor.country}` : null 
     });
}

