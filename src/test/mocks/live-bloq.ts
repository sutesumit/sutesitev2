import { vi } from "vitest";

/**
 * Shared mock for @/lib/live-bloq/service.
 * All test files that mock this module MUST use this factory
 * to avoid module caching conflicts across test files.
 *
 * Usage:
 *   import { mockLiveBloqService } from "@/test/mocks/live-bloq";
 *   vi.mocked(mockLiveBloqService.startSession).mockResolvedValueOnce(...);
 */
export const mockLiveBloqService = {
  startSession: vi.fn(),
  addEntry: vi.fn(),
  closeSession: vi.fn(),
  cancelSession: vi.fn(),
  getSession: vi.fn(),
  getSessionById: vi.fn(),
  getEntries: vi.fn(),
  getEntriesAfter: vi.fn(),
  listLiveSessions: vi.fn(),
  findActiveSession: vi.fn(),
};

export const mockCreateLiveBloqService = vi.fn(() => mockLiveBloqService);
