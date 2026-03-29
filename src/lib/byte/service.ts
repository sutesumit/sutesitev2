import type { Byte } from "@/types/byte";
import {
  createByte as createByteRecord,
  deleteByte as deleteByteRecord,
  getByteBySerial as getByteRecordBySerial,
  getBytes as getPaginatedBytes,
  listAllBytes,
  updateByte as updateByteRecord,
} from "./repository";
import { assertValidByteContent } from "./validation";
import { NotFoundError } from "@/lib/core/errors";
import { noopContentMutationEffect, type ContentMutationEffect } from "@/lib/content-publish/types";

export interface ByteRepository {
  createByte(content: string): Promise<Byte>;
  listAllBytes(): Promise<Byte[]>;
  getByteBySerial(serial: string): Promise<Byte | null>;
  getBytes(page?: number, limit?: number, searchQuery?: string): Promise<{ data: Byte[] }>;
  updateByte(serial: string, content: string): Promise<Byte>;
  deleteByte(serial: string): Promise<void>;
}

const byteRepository: ByteRepository = {
  createByte: createByteRecord,
  listAllBytes,
  getByteBySerial: getByteRecordBySerial,
  getBytes: getPaginatedBytes,
  updateByte: updateByteRecord,
  deleteByte: deleteByteRecord,
};

export function createByteService(deps?: {
  repository?: ByteRepository;
  mutationEffect?: ContentMutationEffect;
}) {
  const repository = deps?.repository ?? byteRepository;
  const mutationEffect = deps?.mutationEffect ?? noopContentMutationEffect;

  return {
    async createByte(content: string, options?: { notify?: boolean }): Promise<Byte> {
      const normalizedContent = assertValidByteContent(content);
      const byte = await repository.createByte(normalizedContent);

      if (options?.notify !== false) {
        await mutationEffect.onMutation({ action: "published", type: "byte", byte });
      }

      return byte;
    },

    async listAllBytes(): Promise<Byte[]> {
      return repository.listAllBytes();
    },

    async listRecentBytes(limit = 10): Promise<Byte[]> {
      const result = await repository.getBytes(1, limit);
      return result.data;
    },

    async getByteBySerial(serial: string): Promise<Byte> {
      const byte = await repository.getByteBySerial(serial);

      if (!byte) {
        throw new NotFoundError("Byte not found");
      }

      return byte;
    },

    async updateByte(serial: string, content: string): Promise<Byte> {
      const normalizedContent = assertValidByteContent(content);
      let byte: Byte;

      try {
        byte = await repository.updateByte(serial, normalizedContent);
      } catch {
        throw new NotFoundError("Byte not found or update failed");
      }

      await mutationEffect.onMutation({ action: "updated", type: "byte", byte });
      return byte;
    },

    async deleteByte(serial: string): Promise<void> {
      try {
        await repository.deleteByte(serial);
      } catch {
        throw new NotFoundError("Byte not found or delete failed");
      }

      await mutationEffect.onMutation({ action: "deleted", type: "byte", serial });
    },
  };
}

export const byteService = createByteService({
  mutationEffect: noopContentMutationEffect,
});
