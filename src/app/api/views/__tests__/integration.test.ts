import { describe, it, expect, beforeAll } from 'vitest'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

function skipIfNoEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return true
  }
  return false
}

describe('Views API Integration Tests', () => {
  const testBloqSlug = '2026-03-08-api-architecture-when-to-unify-vs-separate'
  const testBlipSerial = '001'
  const testByteSerial = '001'
  const testProjectSlug = 'test-project'

  describe('GET /api/bloq/views/{slug}', () => {
    it('returns views for valid bloq post', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/bloq/views/${testBloqSlug}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })

    it('returns 404 for non-existent bloq post', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/bloq/views/non-existent-post-123`)
      const payload = await response.json()

      expect(response.status).toBe(404)
      expect(payload).toEqual({ error: 'Post not found' })
    })
  })

  describe('POST /api/bloq/views/{slug}', () => {
    it('increments view count for valid bloq post', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/bloq/views/${testBloqSlug}`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })

    it('returns 404 for non-existent bloq post', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/bloq/views/non-existent-post-123`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(404)
      expect(payload).toEqual({ error: 'Post not found' })
    })
  })

  describe('GET /api/blip/views/{serial}', () => {
    it('returns views for valid blip', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/blip/views/${testBlipSerial}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })

    it('returns 404 for non-existent blip', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/blip/views/999`)
      const payload = await response.json()

      expect(response.status).toBe(404)
      expect(payload).toEqual({ error: 'Blip not found' })
    })
  })

  describe('POST /api/blip/views/{serial}', () => {
    it('increments view count for valid blip', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/blip/views/${testBlipSerial}`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })

    it('returns 404 for non-existent blip', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/blip/views/999`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(404)
      expect(payload).toEqual({ error: 'Blip not found' })
    })
  })

  describe('GET /api/byte/views/{serial}', () => {
    it('returns views for valid byte', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/byte/views/${testByteSerial}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })

    it('returns 404 for non-existent byte', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/byte/views/999`)
      const payload = await response.json()

      expect(response.status).toBe(404)
      expect(payload).toEqual({ error: 'Byte not found' })
    })
  })

  describe('POST /api/byte/views/{serial}', () => {
    it('increments view count for valid byte', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/byte/views/${testByteSerial}`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })

    it('returns 404 for non-existent byte', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/byte/views/999`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(404)
      expect(payload).toEqual({ error: 'Byte not found' })
    })
  })

  describe('GET /api/project/views/{slug}', () => {
    it('returns views for valid project', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/project/views/${testProjectSlug}`)
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

      const response = await fetch(`${BASE_URL}/api/project/views/non-existent-project`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toEqual({ views: 0 })
    })
  })

  describe('POST /api/project/views/{slug}', () => {
    it('increments view count for valid project', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/project/views/${testProjectSlug}`, {
        method: 'POST',
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('views')
      expect(typeof payload.views).toBe('number')
    })
  })

  describe('Database constraints and validation', () => {
    it('handles empty slug gracefully', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/project/views/`)
      expect(response.status).toBe(404)
    })

    it('handles special characters in slug', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/bloq/views/<script>alert('xss')</script>`)
      expect(response.status).toBe(404)
    })
  })
})