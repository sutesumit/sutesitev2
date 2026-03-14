import { getConfig, hasApiKey } from './config.js'

export type Byte = {
  id: string
  content: string
  created_at: string
  byte_serial: string
}

export type Blip = {
  id: string
  blip_serial: string
  term: string
  meaning: string
  tags: string[]
  created_at: string
  updated_at: string
}

export type ApiResponse<T> = {
  data: T | null
  error: string | null
  status: number
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const { url: baseUrl, key } = getConfig()
  const fullUrl = endpoint ? `${baseUrl}/${endpoint}` : baseUrl

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  }

  if (options.method !== 'GET' && hasApiKey()) {
    headers['K'] = key
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        data: null,
        error: (data as { error?: string }).error || `HTTP ${response.status}`,
        status: response.status
      }
    }

    return {
      data: data as T,
      error: null,
      status: response.status
    }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Network error',
      status: 0
    }
  }
}

export async function listBlips(): Promise<ApiResponse<{ blips: Byte[] }>> {
  return request<{ blips: Byte[] }>('blip', { method: 'GET' })
}

export async function getBlip(serial: string): Promise<ApiResponse<{ blip: Byte }>> {
  return request<{ blip: Byte }>(`blip/${serial}`, { method: 'GET' })
}

export async function createBlip(content: string): Promise<ApiResponse<{ blip: Byte }>> {
  return request<{ blip: Byte }>('byte', {
    method: 'POST',
    body: JSON.stringify({ content })
  })
}

export async function updateBlip(
  serial: string,
  content: string
): Promise<ApiResponse<{ blip: Byte }>> {
  return request<{ blip: Byte }>(`byte/${serial}`, {
    method: 'PUT',
    body: JSON.stringify({ content })
  })
}

export async function deleteBlip(serial: string): Promise<ApiResponse<{ success: boolean }>> {
  return request<{ success: boolean }>(`byte/${serial}`, {
    method: 'DELETE'
  })
}

export async function listBytes(): Promise<ApiResponse<{ bytes: Byte[] }>> {
  return request<{ bytes: Byte[] }>('byte', { method: 'GET' })
}

export async function getByte(serial: string): Promise<ApiResponse<{ byte: Byte }>> {
  return request<{ byte: Byte }>(`byte/${serial}`, { method: 'GET' })
}

export async function createByte(content: string): Promise<ApiResponse<{ byte: Byte }>> {
  return request<{ byte: Byte }>('byte', {
    method: 'POST',
    body: JSON.stringify({ content })
  })
}

export async function updateByte(serial: string, content: string): Promise<ApiResponse<{ byte: Byte }>> {
  return request<{ byte: Byte }>(`byte/${serial}`, {
    method: 'PUT',
    body: JSON.stringify({ content })
  })
}

export async function deleteByte(serial: string): Promise<ApiResponse<{ success: boolean }>> {
  return request<{ success: boolean }>(`byte/${serial}`, {
    method: 'DELETE'
  })
}

export async function listBlipsGlossary(): Promise<ApiResponse<{ blips: Blip[] }>> {
  return request<{ blips: Blip[] }>('blip', { method: 'GET' })
}

export async function getBlipGlossary(serial: string): Promise<ApiResponse<{ blip: Blip }>> {
  return request<{ blip: Blip }>(`blip/${serial}`, { method: 'GET' })
}

export async function createBlipGlossary(term: string, meaning: string): Promise<ApiResponse<{ blip: Blip }>> {
  return request<{ blip: Blip }>('blip', {
    method: 'POST',
    body: JSON.stringify({ term, meaning })
  })
}

export async function updateBlipGlossary(serial: string, term: string, meaning: string): Promise<ApiResponse<{ blip: Blip }>> {
  return request<{ blip: Blip }>(`blip/${serial}`, {
    method: 'PUT',
    body: JSON.stringify({ term, meaning })
  })
}

export async function deleteBlipGlossary(serial: string): Promise<ApiResponse<{ success: boolean }>> {
  return request<{ success: boolean }>(`blip/${serial}`, {
    method: 'DELETE'
  })
}