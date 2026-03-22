import { describe, expect, it } from "vitest";
import { createByte, deleteByte, getByteBySerial, listAllBytes, updateByte } from "../repository";

const hasIntegrationEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.RUN_SUPABASE_INTEGRATION_TESTS === "true"
);

const describeIf = hasIntegrationEnv ? describe : describe.skip;

describeIf("Byte repository integration", () => {
  it("creates, reads, updates, and deletes a byte against Supabase", async () => {
    const created = await createByte(`integration byte ${Date.now()}`);

    expect(created.byte_serial).toBeTruthy();

    const fetched = await getByteBySerial(created.byte_serial);
    expect(fetched?.byte_serial).toBe(created.byte_serial);

    const updated = await updateByte(created.byte_serial, `updated integration byte ${Date.now()}`);
    expect(updated.byte_serial).toBe(created.byte_serial);
    expect(updated.content).toContain("updated integration byte");

    const allBytes = await listAllBytes();
    expect(allBytes.some((byte) => byte.byte_serial === created.byte_serial)).toBe(true);

    await deleteByte(created.byte_serial);

    const deleted = await getByteBySerial(created.byte_serial);
    expect(deleted).toBeNull();
  });
});
