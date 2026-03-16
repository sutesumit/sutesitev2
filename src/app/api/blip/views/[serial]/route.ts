import { getBlipBySerial } from "@/lib/blip";
import { jsonSuccess, notFoundResponse } from "@/lib/api/responses";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ serial: string }> }
) {
    const { serial } = await params;
    const blip = await getBlipBySerial(serial);

    if (!blip) {
        return notFoundResponse("Blip not found");
    }

    return jsonSuccess({
        id: blip.id,
        blip_serial: blip.blip_serial,
        term: blip.term,
        meaning: blip.meaning,
        tags: blip.tags,
        created_at: blip.created_at,
        updated_at: blip.updated_at
    });
}
