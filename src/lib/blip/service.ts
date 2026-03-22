import type { Blip } from "@/types/blip";
import {
  createBlip as createBlipRecord,
  deleteBlip as deleteBlipRecord,
  getBlipBySerial as getBlipRecordBySerial,
  getBlips as getPaginatedBlips,
  listAllBlips,
  updateBlip as updateBlipRecord,
} from "./repository";
import { assertValidBlipInput } from "./validation";
import { NotFoundError } from "@/lib/core/errors";
import { noopTelegramNotifier, type TelegramNotifier } from "@/lib/notifications/types";

export interface BlipRepository {
  createBlip(term: string, meaning: string, tags?: string[]): Promise<Blip>;
  listAllBlips(): Promise<Blip[]>;
  getBlipBySerial(serial: string): Promise<Blip | null>;
  getBlips(page?: number, limit?: number, searchQuery?: string, tags?: string[]): Promise<{ data: Blip[] }>;
  updateBlip(serial: string, term: string, meaning: string): Promise<Blip>;
  deleteBlip(serial: string): Promise<void>;
}

const blipRepository: BlipRepository = {
  createBlip: createBlipRecord,
  listAllBlips,
  getBlipBySerial: getBlipRecordBySerial,
  getBlips: getPaginatedBlips,
  updateBlip: updateBlipRecord,
  deleteBlip: deleteBlipRecord,
};

export function createBlipService(deps?: {
  repository?: BlipRepository;
  notifier?: TelegramNotifier;
}) {
  const repository = deps?.repository ?? blipRepository;
  const notifier = deps?.notifier ?? noopTelegramNotifier;

  return {
    async createBlip(term: string, meaning: string, options?: { notify?: boolean }): Promise<Blip> {
      const normalized = assertValidBlipInput(term, meaning);
      const blip = await repository.createBlip(normalized.term, normalized.meaning);

      if (options?.notify !== false) {
        await notifier.notifyBlipCreated(blip);
      }

      return blip;
    },

    async listAllBlips(): Promise<Blip[]> {
      return repository.listAllBlips();
    },

    async listRecentBlips(limit = 10): Promise<Blip[]> {
      const result = await repository.getBlips(1, limit);
      return result.data;
    },

    async getBlipBySerial(serial: string): Promise<Blip> {
      const blip = await repository.getBlipBySerial(serial);

      if (!blip) {
        throw new NotFoundError("Blip not found");
      }

      return blip;
    },

    async updateBlip(serial: string, term: string, meaning: string): Promise<Blip> {
      const normalized = assertValidBlipInput(term, meaning);

      try {
        return await repository.updateBlip(serial, normalized.term, normalized.meaning);
      } catch {
        throw new NotFoundError("Blip not found or update failed");
      }
    },

    async deleteBlip(serial: string): Promise<void> {
      try {
        await repository.deleteBlip(serial);
      } catch {
        throw new NotFoundError("Blip not found or delete failed");
      }
    },
  };
}

export const blipService = createBlipService({
  notifier: noopTelegramNotifier,
});
