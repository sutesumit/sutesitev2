import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

function skipIfNoEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return true
  }
  return false
}

describe('Views API Integration Tests', () => {
  const testBloqSlug = 'building-mdx-blog-system-nextjs-ai'
  const testBlipSerial = '001'
  const testByteSerial = '001'
  const testProjectSlug = 'sutesite'

  describe('GET /api/views?type=bloq&id={slug}', () => {
    it('returns views for valid bloq post', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/views?type=bloq&id=${testBloqSlug}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })

    it('returns views: 0 for non-existent bloq post', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const uniqueId = `test-non-existent-bloq-${Date.now()}`
      const response = await fetch(`${BASE_URL}/api/views?type=bloq&id=${uniqueId}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toEqual({ views: 0 })
    })
  })

  describe('POST /api/views?type=bloq&id={slug}', () => {
    it('increments view count for valid bloq post', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/views?type=bloq&id=${testBloqSlug}`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })

    it('creates view record for non-existent bloq post', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const uniqueId = `test-new-bloq-${Date.now()}`
      const response = await fetch(`${BASE_URL}/api/views?type=bloq&id=${uniqueId}`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toEqual({ views: 1 })
    })
  })

  describe('GET /api/views?type=blip&id={serial}', () => {
    it('returns views for valid blip', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/views?type=blip&id=${testBlipSerial}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })

    it('returns views: 0 for non-existent blip', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const uniqueId = `test-non-existent-blip-${Date.now()}`
      const response = await fetch(`${BASE_URL}/api/views?type=blip&id=${uniqueId}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toEqual({ views: 0 })
    })
  })

  describe('POST /api/views?type=blip&id={serial}', () => {
    it('increments view count for valid blip', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/views?type=blip&id=${testBlipSerial}`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })

    it('creates view record for non-existent blip', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const uniqueId = `test-new-blip-${Date.now()}`
      const response = await fetch(`${BASE_URL}/api/views?type=blip&id=${uniqueId}`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toEqual({ views: 1 })
    })
  })

  describe('GET /api/views?type=byte&id={serial}', () => {
    it('returns views for valid byte', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/views?type=byte&id=${testByteSerial}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })

    it('returns views: 0 for non-existent byte', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const uniqueId = `test-non-existent-byte-${Date.now()}`
      const response = await fetch(`${BASE_URL}/api/views?type=byte&id=${uniqueId}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toEqual({ views: 0 })
    })
  })

  describe('POST /api/views?type=byte&id={serial}', () => {
    it('increments view count for valid byte', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/views?type=byte&id=${testByteSerial}`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })

    it('creates view record for non-existent byte', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const uniqueId = `test-new-byte-${Date.now()}`
      const response = await fetch(`${BASE_URL}/api/views?type=byte&id=${uniqueId}`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toEqual({ views: 1 })
    })
  })

  describe('GET /api/views?type=project&id={slug}', () => {
    it('returns views for valid project', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/views?type=project&id=${testProjectSlug}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })

    it('returns views: 0 for non-existent project', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const uniqueId = `test-non-existent-project-${Date.now()}`
      const response = await fetch(`${BASE_URL}/api/views?type=project&id=${uniqueId}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toEqual({ views: 0 })
    })
  })

  describe('POST /api/views?type=project&id={slug}', () => {
    it('increments view count for valid project', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/views?type=project&id=${testProjectSlug}`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })
  })

  describe('Error handling', () => {
    it('returns 400 for invalid type parameter', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/views?type=invalid&id=test`)
      const payload = await response.json()

      expect(response.status).toBe(400)
      expect(payload).toHaveProperty('error')
    })

    it('returns 400 for missing type parameter', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/views?id=test`)
      const payload = await response.json()

      expect(response.status).toBe(400)
      expect(payload).toHaveProperty('error')
    })

    it('returns 400 for missing id parameter', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/views?type=bloq`)
      const payload = await response.json()

      expect(response.status).toBe(400)
      expect(payload).toHaveProperty('error')
    })
  })
})
