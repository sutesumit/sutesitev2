import { getConfig, hasApiKey } from './config.js'
import type {
  BlipDetailResponse,
  BlipListResponse,
  ByteDetailResponse,
  ByteListResponse,
  DeleteResponse,
  BlipRecord as Blip,
  ByteRecord as Byte,
} from '../../../shared/api-contracts'
import { createSuteSiteClient, type GeneratedClientResponse } from '../../../shared/generated/sutesite-client'

export type { Blip, Byte }

export type ApiResponse<T> = {
  data: T | null
  error: string | null
  status: number
}

function getClient() {
  const { url: baseUrl, key } = getConfig()
  return createSuteSiteClient({
    baseUrl,
    apiKey: hasApiKey() ? key : undefined,
  })
}

export async function listBytes(): Promise<ApiResponse<ByteListResponse>> {
  return getClient().listBytes() as Promise<GeneratedClientResponse<ByteListResponse>>
}

export async function getByte(serial: string): Promise<ApiResponse<ByteDetailResponse>> {
  return getClient().getByte(serial) as Promise<GeneratedClientResponse<ByteDetailResponse>>
}

export async function createByte(content: string): Promise<ApiResponse<ByteDetailResponse>> {
  return getClient().createByte(content) as Promise<GeneratedClientResponse<ByteDetailResponse>>
}

export async function updateByte(serial: string, content: string): Promise<ApiResponse<ByteDetailResponse>> {
  return getClient().updateByte(serial, content) as Promise<GeneratedClientResponse<ByteDetailResponse>>
}

export async function deleteByte(serial: string): Promise<ApiResponse<DeleteResponse>> {
  return getClient().deleteByte(serial) as Promise<GeneratedClientResponse<DeleteResponse>>
}

export async function listBlipsGlossary(): Promise<ApiResponse<BlipListResponse>> {
  return getClient().listBlips() as Promise<GeneratedClientResponse<BlipListResponse>>
}

export async function getBlipGlossary(serial: string): Promise<ApiResponse<BlipDetailResponse>> {
  return getClient().getBlip(serial) as Promise<GeneratedClientResponse<BlipDetailResponse>>
}

export async function createBlipGlossary(term: string, meaning: string): Promise<ApiResponse<BlipDetailResponse>> {
  return getClient().createBlip(term, meaning) as Promise<GeneratedClientResponse<BlipDetailResponse>>
}

export async function updateBlipGlossary(serial: string, term: string, meaning: string): Promise<ApiResponse<BlipDetailResponse>> {
  return getClient().updateBlip(serial, term, meaning) as Promise<GeneratedClientResponse<BlipDetailResponse>>
}

export async function deleteBlipGlossary(serial: string): Promise<ApiResponse<DeleteResponse>> {
  return getClient().deleteBlip(serial) as Promise<GeneratedClientResponse<DeleteResponse>>
}

export const listBlips = listBlipsGlossary
export const getBlip = getBlipGlossary
export const createBlip = createBlipGlossary
export const updateBlip = updateBlipGlossary
export const deleteBlip = deleteBlipGlossary
