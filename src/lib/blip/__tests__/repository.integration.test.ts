import { describe, expect, it } from "vitest";
import { createBlip, deleteBlip, getBlipBySerial, listAllBlips, updateBlip } from "../repository";

const hasIntegrationEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.RUN_SUPABASE_INTEGRATION_TESTS === "true"
);

const describeIf = hasIntegrationEnv ? describe : describe.skip;

describeIf("Blip repository integration", () => {
  it("creates, reads, updates, and deletes a blip against Supabase", async () => {
    const created = await createBlip(`term-${Date.now()}`, "integration meaning");

    expect(created.blip_serial).toBeTruthy();

    const fetched = await getBlipBySerial(created.blip_serial);
    expect(fetched?.blip_serial).toBe(created.blip_serial);

    const updated = await updateBlip(created.blip_serial, `term-${Date.now()}-updated`, "updated meaning");
    expect(updated.blip_serial).toBe(created.blip_serial);
    expect(updated.meaning).toBe("updated meaning");

    const allBlips = await listAllBlips();
    expect(allBlips.some((blip) => blip.blip_serial === created.blip_serial)).toBe(true);

    await deleteBlip(created.blip_serial);

    const deleted = await getBlipBySerial(created.blip_serial);
    expect(deleted).toBeNull();
  });
});
