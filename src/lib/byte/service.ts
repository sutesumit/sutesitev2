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
import { noopContentPublishEffect, type ContentPublishEffect } from "@/lib/content-publish/types";

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
  publishEffect?: ContentPublishEffect;
}) {
  const repository = deps?.repository ?? byteRepository;
  const publishEffect = deps?.publishEffect ?? noopContentPublishEffect;

  return {
    async createByte(content: string, options?: { notify?: boolean }): Promise<Byte> {
      const normalizedContent = assertValidByteContent(content);
      const byte = await repository.createByte(normalizedContent);

      if (options?.notify !== false) {
        await publishEffect.onPublished({ type: "byte", byte });
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

      try {
        return await repository.updateByte(serial, normalizedContent);
      } catch {
        throw new NotFoundError("Byte not found or update failed");
      }
    },

    async deleteByte(serial: string): Promise<void> {
      try {
        await repository.deleteByte(serial);
      } catch {
        throw new NotFoundError("Byte not found or delete failed");
      }
    },
  };
}

export const byteService = createByteService({
  publishEffect: noopContentPublishEffect,
});
