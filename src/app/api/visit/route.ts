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
        

        // Always fetch previous visitor using Service Role key if available to bypass RLS
        // This is crucial because "anonymous" users usually can't see *other* users' data
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        const getQueryClient = async () => {
            if (supabaseUrl && serviceKey) {
                const { createClient } = await import('@supabase/supabase-js');
                return createClient(supabaseUrl, serviceKey);
            }
            return supabase;
        };

        const queryClient = await getQueryClient();

        const query = queryClient
            .from('visits')
            .select('city, country')
            .order('created_at', { ascending: false })
            .limit(1);

        const { data: prevVisits, error: fetchError } = await query;
        
        // Fetch unique visitor count using RPC
        const { data: uniqueCount, error: countError } = await queryClient.rpc('get_unique_visitor_count');

        if (fetchError) {
             // ... error handling
             console.error('Error fetching previous visitor:', fetchError);
             return NextResponse.json({ 
                 error: fetchError.message
             }, { status: 500 });
        }
        
        if (countError) {
             console.error('Error fetching visitor count:', countError);
             // We don't fail the whole request if count fails, just return null
        }

        const lastVisitor = prevVisits?.[0];

        return NextResponse.json({ 
            lastVisitorLocation: lastVisitor ? `${lastVisitor.city}, ${lastVisitor.country}` : null,
            visitorCount: uniqueCount
        });

    } catch (error) {
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
