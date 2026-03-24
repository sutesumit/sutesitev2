import type {
  BlipDetailResponse,
  BlipListResponse,
  ByteDetailResponse,
  ByteListResponse,
  DeleteResponse,
} from './types.js'

export type GeneratedClientConfig = {
  baseUrl: string
  apiKey?: string
  fetchImpl?: typeof fetch
}

export type GeneratedClientResponse<T> = {
  data: T | null
  error: string | null
  status: number
}

async function request<T>(
  config: GeneratedClientConfig,
  endpoint: string,
  options: RequestInit = {}
): Promise<GeneratedClientResponse<T>> {
  const fetchImpl = config.fetchImpl ?? fetch
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  if (options.method && options.method !== 'GET' && config.apiKey) {
    headers.K = config.apiKey
  }

  try {
    const response = await fetchImpl(`${config.baseUrl}/${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        data: null,
        error: (data as { error?: string }).error || `HTTP ${response.status}`,
        status: response.status,
      }
    }

    return {
      data: data as T,
      error: null,
      status: response.status,
    }
  } catch (error: unknown) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    }
  }
}

export function createSuteSiteClient(config: GeneratedClientConfig) {
  return {
    listBytes(): Promise<GeneratedClientResponse<ByteListResponse>> {
      return request<ByteListResponse>(config, 'byte', { method: 'GET' })
    },

    getByte(serial: string): Promise<GeneratedClientResponse<ByteDetailResponse>> {
      return request<ByteDetailResponse>(config, `byte/${serial}`, { method: 'GET' })
    },

    createByte(content: string): Promise<GeneratedClientResponse<ByteDetailResponse>> {
      return request<ByteDetailResponse>(config, 'byte', {
        method: 'POST',
        body: JSON.stringify({ content }),
      })
    },

    updateByte(serial: string, content: string): Promise<GeneratedClientResponse<ByteDetailResponse>> {
      return request<ByteDetailResponse>(config, `byte/${serial}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      })
    },

    deleteByte(serial: string): Promise<GeneratedClientResponse<DeleteResponse>> {
      return request<DeleteResponse>(config, `byte/${serial}`, { method: 'DELETE' })
    },

    listBlips(): Promise<GeneratedClientResponse<BlipListResponse>> {
      return request<BlipListResponse>(config, 'blip', { method: 'GET' })
    },

    getBlip(serial: string): Promise<GeneratedClientResponse<BlipDetailResponse>> {
      return request<BlipDetailResponse>(config, `blip/${serial}`, { method: 'GET' })
    },

    createBlip(term: string, meaning: string): Promise<GeneratedClientResponse<BlipDetailResponse>> {
      return request<BlipDetailResponse>(config, 'blip', {
        method: 'POST',
        body: JSON.stringify({ term, meaning }),
      })
    },

    updateBlip(serial: string, term: string, meaning: string): Promise<GeneratedClientResponse<BlipDetailResponse>> {
      return request<BlipDetailResponse>(config, `blip/${serial}`, {
        method: 'PUT',
        body: JSON.stringify({ term, meaning }),
      })
    },

    deleteBlip(serial: string): Promise<GeneratedClientResponse<DeleteResponse>> {
      return request<DeleteResponse>(config, `blip/${serial}`, { method: 'DELETE' })
    },
  }
}
