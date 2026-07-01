import type { LiveSession, LiveEntry, AddEntryResult } from "./types";
import {
  createSession as createSessionRecord,
  addEntry as addEntryRecord,
  closeSession as closeSessionRecord,
  cancelSession as cancelSessionRecord,
  updateSummary as updateSummaryRecord,
  getSessionBySlug as getSessionRecordBySlug,
  getSessionById as getSessionRecordById,
  getEntries as getEntriesRecord,
  getEntriesAfter as getEntriesAfterRecord,
  listSessions as listSessionsRecord,
  findActiveSession as findActiveSessionRecord,
} from "./repository";
import { ValidationError } from "@/lib/core/errors";
import { noopContentMutationEffect, type ContentMutationEffect } from "@/lib/content-publish/types";
import { revalidatePath } from "next/cache";
import { toUrlSafeString, getBloqPosts } from "@/lib/bloq";

export interface LiveBloqRepository {
  createSession(title: string, slug: string): Promise<LiveSession>;
  addEntry(sessionId: string, content: string): Promise<AddEntryResult>;
  closeSession(sessionId: string): Promise<LiveSession>;
  cancelSession(sessionId: string): Promise<LiveSession>;
  updateSummary(sessionId: string, summary: string): Promise<LiveSession>;
  getSessionBySlug(slug: string): Promise<LiveSession | null>;
  getSessionById(id: string): Promise<LiveSession | null>;
  getEntries(sessionId: string): Promise<LiveEntry[]>;
  getEntriesAfter(sessionId: string, afterSequence: number): Promise<LiveEntry[]>;
  listSessions(): Promise<LiveSession[]>;
  findActiveSession(): Promise<LiveSession | null>;
}

const liveBloqRepository: LiveBloqRepository = {
  createSession: createSessionRecord,
  addEntry: addEntryRecord,
  closeSession: closeSessionRecord,
  cancelSession: cancelSessionRecord,
  updateSummary: updateSummaryRecord,
  getSessionBySlug: getSessionRecordBySlug,
  getSessionById: getSessionRecordById,
  getEntries: getEntriesRecord,
  getEntriesAfter: getEntriesAfterRecord,
  listSessions: listSessionsRecord,
  findActiveSession: findActiveSessionRecord,
};

export function createLiveBloqService(deps?: {
  repository?: LiveBloqRepository;
  mutationEffect?: ContentMutationEffect;
}) {
  const repository = deps?.repository ?? liveBloqRepository;
  const mutationEffect = deps?.mutationEffect ?? noopContentMutationEffect;

  async function generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = toUrlSafeString(title.trim());

    const existingMdxSlugs = new Set(getBloqPosts().map((p) => p.url));

    const isCollision = async (candidate: string) => {
      if (existingMdxSlugs.has(candidate)) return true;
      const existing = await repository.getSessionBySlug(candidate);
      return existing !== null;
    };

    if (!(await isCollision(baseSlug))) return baseSlug;

    for (let attempt = 2; attempt <= 11; attempt++) {
      const candidate = `${baseSlug}-${attempt}`;
      if (!(await isCollision(candidate))) return candidate;
    }

    throw new Error("Could not generate a unique slug after 10 attempts");
  }

  return {
    async startSession(title: string): Promise<LiveSession> {
      const trimmed = title.trim();
      if (!trimmed) {
        throw new ValidationError("Title cannot be empty");
      }

      const slug = await generateUniqueSlug(trimmed);
      const session = await repository.createSession(title, slug);

      await mutationEffect.onMutation({
        action: "published",
        type: "live-bloq",
        liveBloq: session,
      });

      return session;
    },

    async addEntry(sessionId: string, content: string): Promise<AddEntryResult> {
      if (!content.trim()) {
        throw new ValidationError("Content cannot be empty");
      }

      const result = await repository.addEntry(sessionId, content);
      revalidatePath(`/bloq/live/${result.session_slug}`);
      return result;
    },

    async closeSession(sessionId: string): Promise<LiveSession> {
      const session = await repository.closeSession(sessionId);
      revalidatePath(`/bloq/live/${session.slug}`);
      revalidatePath('/bloq');
      return session;
    },

    async cancelSession(sessionId: string): Promise<LiveSession> {
      const session = await repository.cancelSession(sessionId);
      revalidatePath(`/bloq/live/${session.slug}`);
      revalidatePath('/bloq');
      return session;
    },

    async updateSummary(sessionId: string, summary: string): Promise<LiveSession> {
      const trimmed = summary.trim();
      if (!trimmed) {
        throw new ValidationError("Summary cannot be empty");
      }
      return repository.updateSummary(sessionId, trimmed);
    },

    async getSession(slug: string): Promise<LiveSession | null> {
      const session = await repository.getSessionBySlug(slug);
      if (!session) return null;
      // Hide cancelled sessions from public
      if (session.status === "cancelled") return null;
      return session;
    },

    async getSessionById(id: string): Promise<LiveSession | null> {
      return repository.getSessionById(id);
    },

    async getEntries(sessionId: string): Promise<LiveEntry[]> {
      return repository.getEntries(sessionId);
    },

    async getEntriesAfter(
      sessionId: string,
      afterSequence: number
    ): Promise<LiveEntry[]> {
      return repository.getEntriesAfter(sessionId, afterSequence);
    },

    async listLiveSessions(): Promise<LiveSession[]> {
      return repository.listSessions();
    },

    async findActiveSession(): Promise<LiveSession | null> {
      return repository.findActiveSession();
    },
  };
}

export const liveBloqService = createLiveBloqService({
  mutationEffect: noopContentMutationEffect,
});
