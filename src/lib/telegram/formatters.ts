export function formatByte(byte: { byte_serial: string; content: string; created_at: string }): string {
  const date = new Date(byte.created_at);
  const timeStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `<code>${byte.byte_serial}.</code> ${byte.content}\n<i>${timeStr}</i>`;
}

export function formatBlip(blip: { blip_serial: string; term: string; meaning: string; created_at: string }): string {
  const date = new Date(blip.created_at);
  const timeStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `<code>${blip.blip_serial}.</code> <b>${blip.term}</b>: ${blip.meaning}\n<i>${timeStr}</i>`;
}
