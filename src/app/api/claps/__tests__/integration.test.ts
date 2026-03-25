import { describe, it, expect, beforeAll } from 'vitest'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

function skipIfNoEnv() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return true
  }
  return false
}

describe('Claps API Integration Tests', () => {
  const testBloqSlug = 'building-mdx-blog-system-nextjs-ai'
  const testBlipSerial = '001'
  const testByteSerial = '001'
  const testProjectSlug = 'sutesite'
  const testFingerprint = 'test-integration-fingerprint-123'

  describe('GET /api/claps/bloq/{id}', () => {
    it('returns claps for valid bloq post', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/bloq/${testBloqSlug}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('claps')
      expect(payload).toHaveProperty('userClaps')
      expect(typeof payload.claps).toBe('number')
      expect(typeof payload.userClaps).toBe('number')
    })

    it('returns claps with fingerprint for user claps', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(
        `${BASE_URL}/api/claps/bloq/${testBloqSlug}?fingerprint=${testFingerprint}`
      )
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('claps')
      expect(payload).toHaveProperty('userClaps')
    })

    it('returns 404 for non-existent bloq post', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/bloq/non-existent-post`)
      const payload = await response.json()

      expect(response.status).toBe(404)
      expect(payload).toEqual({ error: 'Post not found' })
    })
  })

  describe('POST /api/claps/bloq/{id}', () => {
    it('increments claps for valid bloq post', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/bloq/${testBloqSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: testFingerprint }),
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('userClaps')
      expect(payload).toHaveProperty('totalClaps')
      expect(payload).toHaveProperty('maxReached')
      expect(typeof payload.userClaps).toBe('number')
      expect(typeof payload.totalClaps).toBe('number')
      expect(typeof payload.maxReached).toBe('boolean')
    })

    it('returns 404 for non-existent bloq post', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/bloq/non-existent-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: testFingerprint }),
      })
      const payload = await response.json()

      expect(response.status).toBe(404)
      expect(payload).toEqual({ error: 'Post not found' })
    })

    it('returns 400 when fingerprint is missing', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/bloq/${testBloqSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const payload = await response.json()

      expect(response.status).toBe(400)
      expect(payload).toEqual({ error: 'Fingerprint required' })
    })
  })

  describe('GET /api/claps/blip/{id}', () => {
    it('returns claps for valid blip', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/blip/${testBlipSerial}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('claps')
      expect(payload).toHaveProperty('userClaps')
      expect(typeof payload.claps).toBe('number')
    })

    it('returns claps with fingerprint', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(
        `${BASE_URL}/api/claps/blip/${testBlipSerial}?fingerprint=${testFingerprint}`
      )
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('claps')
      expect(payload).toHaveProperty('userClaps')
    })
  })

  describe('POST /api/claps/blip/{id}', () => {
    it('increments claps for valid blip', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/blip/${testBlipSerial}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: testFingerprint }),
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('userClaps')
      expect(payload).toHaveProperty('totalClaps')
      expect(payload).toHaveProperty('maxReached')
    })

    it('returns 400 when fingerprint is missing', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/blip/${testBlipSerial}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const payload = await response.json()

      expect(response.status).toBe(400)
      expect(payload).toEqual({ error: 'Fingerprint required' })
    })
  })

  describe('GET /api/claps/byte/{id}', () => {
    it('returns claps for valid byte', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/byte/${testByteSerial}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('claps')
      expect(payload).toHaveProperty('userClaps')
    })
  })

  describe('POST /api/claps/byte/{id}', () => {
    it('increments claps for valid byte', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/byte/${testByteSerial}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: testFingerprint }),
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('userClaps')
      expect(payload).toHaveProperty('totalClaps')
    })
  })

  describe('GET /api/claps/project/{id}', () => {
    it('returns claps for valid project', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/project/${testProjectSlug}`)
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('claps')
      expect(payload).toHaveProperty('userClaps')
    })
  })

  describe('POST /api/claps/project/{id}', () => {
    it('increments claps for valid project', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/project/${testProjectSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: testFingerprint }),
      })
      const payload = await response.json()

      expect(response.status).toBe(200)
      expect(payload).toHaveProperty('userClaps')
      expect(payload).toHaveProperty('totalClaps')
    })
  })

  describe('Validation tests', () => {
    it('returns 400 for invalid type', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/invalid/123`)
      const payload = await response.json()

      expect(response.status).toBe(400)
      expect(payload).toEqual({ error: "Invalid post type. Must be 'bloq', 'blip', 'byte', or 'project'" })
    })

    it('returns 400 for invalid type on POST', async () => {
      if (skipIfNoEnv()) {
        console.log('Skipping: Supabase environment variables not configured')
        return
      }

      const response = await fetch(`${BASE_URL}/api/claps/invalid/123`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: testFingerprint }),
      })
      const payload = await response.json()

      expect(response.status).toBe(400)
      expect(payload).toEqual({ error: "Invalid post type. Must be 'bloq', 'blip', 'byte', or 'project'" })
    })
  })
})