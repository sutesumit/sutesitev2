import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import { noStoreHeaders } from "@/lib/api/constants";
import { jsonError } from "@/lib/api/responses";
import { notifyVisitor } from "@/lib/telegram/notifications";

function parseDeviceType(userAgent: string | null): string {
    if (!userAgent) return 'Unknown';
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
        return 'Mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
    return 'Desktop';
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const userAgent = request.headers.get('user-agent');
        const deviceType = parseDeviceType(userAgent);

        const visitorData = body.ip ? {
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
        } : null;

        if (visitorData) {
            const { data: existingVisits } = await supabase
                .from('visits')
                .select('id')
                .eq('ip', body.ip);

            const isReturning = (existingVisits?.length ?? 0) > 0;
            const visitCount = (existingVisits?.length ?? 0) + 1;

            await supabase
                .from('visits')
                .insert([visitorData]);

            const notifyPromise = notifyVisitor(
                {
                    city: body.city,
                    country: body.country_code,
                    region: body.region,
                    ip: body.ip,
                    deviceType,
                    isReturning,
                    visitCount,
                },
                body.referrer
            );
            notifyPromise.catch((err) => console.error("Visitor notification error:", err));
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
