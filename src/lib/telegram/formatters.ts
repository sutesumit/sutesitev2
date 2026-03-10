export function formatBlip(blip: { blip_serial: string; content: string; created_at: string }): string {
  const date = new Date(blip.created_at);
  const timeStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `<code>${blip.blip_serial}.</code> ${blip.content}\n<i>${timeStr}</i>`;
}
