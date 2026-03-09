import { getConfig, hasApiKey } from './config.js'

export type Blip = {
  id: string
  content: string
  created_at: string
  blip_serial: string
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

export async function listBlips(): Promise<ApiResponse<{ blips: Blip[] }>> {
  return request<{ blips: Blip[] }>('', { method: 'GET' })
}

export async function getBlip(serial: string): Promise<ApiResponse<{ blip: Blip }>> {
  return request<{ blip: Blip }>(serial, { method: 'GET' })
}

export async function createBlip(content: string): Promise<ApiResponse<{ blip: Blip }>> {
  return request<{ blip: Blip }>('', {
    method: 'POST',
    body: JSON.stringify({ content })
  })
}

export async function updateBlip(
  serial: string,
  content: string
): Promise<ApiResponse<{ blip: Blip }>> {
  return request<{ blip: Blip }>(serial, {
    method: 'PUT',
    body: JSON.stringify({ content })
  })
}

export async function deleteBlip(serial: string): Promise<ApiResponse<{ success: boolean }>> {
  return request<{ success: boolean }>(serial, {
    method: 'DELETE'
  })
}
