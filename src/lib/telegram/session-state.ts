import type { LiveSession } from "@/lib/live-bloq/types";

interface SessionStateDeps {
  findActiveSession(): Promise<LiveSession | null>;
}

const activeSessions = new Map<number, string>();

export function getActiveSession(userId: number): string | undefined {
  return activeSessions.get(userId);
}

export function setActiveSession(userId: number, sessionId: string): void {
  activeSessions.set(userId, sessionId);
}

export function clearActiveSession(userId: number): void {
  activeSessions.delete(userId);
}

export async function getOrRecoverActiveSession(
  userId: number,
  service: SessionStateDeps
): Promise<string | null> {
  const cached = getActiveSession(userId);
  if (cached) return cached;

  const active = await service.findActiveSession();
  if (active) {
    setActiveSession(userId, active.id);
    return active.id;
  }

  return null;
}
