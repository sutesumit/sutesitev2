# SuteSite API Reference

**Version:** 1.0.0  
**Base URL:** `https://sumitsute.com`

This document provides a technical reference for all API endpoints on sumitsute.com.

---

## Table of Contents

- [Authentication](#authentication)
- [Content Types](#content-types)
- [Response Format](#response-format)
- [Endpoints](#endpoints)
  - [Blips](#blips)
  - [Bytes](#bytes)
  - [Views](#views)
  - [Claps](#claps)
  - [Telegram](#telegram)
  - [Analytics](#analytics)

---

## Authentication

The API uses three different authentication schemes depending on the endpoint:

| Scheme | Header | Environment Variable | Usage |
|--------|--------|---------------------|-------|
| **API Key** | `K` or `X-Key` | `BLIP_SECRET_KEY` | Blip/Byte CRUD operations |
| **Telegram Webhook** | `X-Telegram-Bot-Api-Secret-Token` | `TELEGRAM_WEBHOOK_SECRET` | Telegram bot webhook (SHA256 hashed) |
| **Broadcast** | `X-Broadcast-Secret` | `TELEGRAM_BROADCAST_SECRET` | Telegram channel bloq broadcast |

### API Key Authentication

```bash
curl -H "K: your-api-key" https://sumitsute.com/api/blip
# or legacy header
curl -H "X-Key: your-api-key" https://sumitsute.com/api/blip
```

### Telegram Webhook Authentication

The webhook validates the secret by computing a SHA256 hash:

```typescript
const expected = crypto.createHash("sha256")
  .update(process.env.TELEGRAM_WEBHOOK_SECRET)
  .digest("hex");
```

---

## Content Types

The API accepts multiple content types for write operations:

- `application/json` (preferred)
- `application/x-www-form-urlencoded`
- `text/plain` (bytes only)

---

## Response Format

All responses include `Cache-Control: no-store` header.

### Success Response

```json
{
  "blip": { ... },
  "byte": { ... },
  "views": 42
}
```

### Error Response

```json
{
  "error": "Error message"
}
```

---

## Endpoints

### Blips

Short-form content entries with term/meaning pairs.

#### List All Blips

```
GET /api/blip
```

**Auth:** None

**Response:**
```json
{
  "blips": [
    {
      "id": "uuid",
      "blip_serial": "B001",
      "term": "API",
      "meaning": "Application Programming Interface",
      "tags": ["tech", "programming"],
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### Create Blip

```
POST /api/blip
```

**Auth:** API Key required

**Request Body:**
```json
{
  "term": "API",
  "meaning": "Application Programming Interface",
  "tags": ["tech"]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `term` | string | Yes | The term/phrase |
| `meaning` | string | Yes | Definition/explanation |
| `tags` | string[] | No | Array of tags |

**Response:** `201 Created`

```json
{
  "blip": {
    "id": "uuid",
    "blip_serial": "B001",
    "term": "API",
    "meaning": "Application Programming Interface",
    "tags": ["tech"],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400` - Term is required / Meaning is required
- `401` - Unauthorized

---

#### Get Single Blip

```
GET /api/blip/{serial}
```

**Auth:** None

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `serial` | string | Blip serial identifier (e.g., `B001`) |

**Response:** `200 OK`

```json
{
  "blip": {
    "id": "uuid",
    "blip_serial": "B001",
    "term": "API",
    "meaning": "Application Programming Interface",
    "tags": ["tech"],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `404` - Blip not found

---

#### Update Blip

```
PUT /api/blip/{serial}
```

**Auth:** API Key required

**Content Types:** `application/json`, `application/x-www-form-urlencoded`

**Request Body:**
```json
{
  "term": "Updated term",
  "meaning": "Updated meaning"
}
```

**Response:** `200 OK`

**Errors:**
- `400` - Term is required / Meaning is required
- `401` - Unauthorized
- `404` - Blip not found or update failed

---

#### Delete Blip

```
DELETE /api/blip/{serial}
```

**Auth:** API Key required

**Response:** `200 OK`

```json
{
  "success": true
}
```

**Errors:**
- `401` - Unauthorized
- `500` - Failed to delete blip

---

### Bytes

Micro-content limited to 280 characters.

#### List All Bytes

```
GET /api/byte
```

**Auth:** None

**Response:**
```json
{
  "bytes": [
    {
      "id": "uuid",
      "byte_serial": "BY001",
      "content": "Just shipped a new feature!",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### Create Byte

```
POST /api/byte
```

**Auth:** API Key required

**Content Types:** `application/json`, `application/x-www-form-urlencoded`, `text/plain`

**Request Body (JSON):**
```json
{
  "content": "Just shipped a new feature!"
}
```

**Request Body (Form):**
```
content=Just shipped a new feature!
```

**Request Body (Plain Text):**
```
Just shipped a new feature!
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `content` | string | Yes | Max 280 characters |

**Response:** `201 Created`

```json
{
  "byte": {
    "id": "uuid",
    "byte_serial": "BY001",
    "content": "Just shipped a new feature!",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400` - Content is required / Content must be 280 characters or less
- `401` - Unauthorized

---

#### Get Single Byte

```
GET /api/byte/{serial}
```

**Auth:** None

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `serial` | string | Byte serial identifier |

**Response:** `200 OK`

```json
{
  "byte": {
    "id": "uuid",
    "byte_serial": "BY001",
    "content": "Just shipped a new feature!",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `404` - Byte not found

---

#### Update Byte

```
PUT /api/byte/{serial}
```

**Auth:** API Key required

**Content Types:** `application/json`, `application/x-www-form-urlencoded`, `text/plain`

**Request Body:**
```json
{
  "content": "Updated content here"
}
```

**Response:** `200 OK`

**Errors:**
- `400` - Content validation error
- `401` - Unauthorized
- `404` - Byte not found or update failed

---

#### Delete Byte

```
DELETE /api/byte/{serial}
```

**Auth:** API Key required

**Response:** `200 OK`

```json
{
  "success": true
}
```

---

### Views

View counter endpoints for various content types. All use RPC functions for atomic increments.

#### Blip Views

```
GET  /api/blip/views/{serial}   # Get view count
POST /api/blip/views/{serial}   # Increment view count
```

**Auth:** None

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `serial` | string | Blip serial identifier |

**RPC Functions:**
- `increment_blip_view(p_serial)` - Increments and returns count
- Query `blip_views` table for GET

**Response:**
```json
{
  "views": 42
}
```

**Errors:**
- `404` - Blip not found

---

#### Byte Views

Two equivalent paths exist:

```
GET  /api/byte/views/{serial}      # Get view count
POST /api/byte/views/{serial}      # Increment view count
GET  /api/byte/{serial}/views      # Alternate: Get view count
POST /api/byte/{serial}/views      # Alternate: Increment view count
```

**Auth:** None

**RPC Functions:**
- `increment_byte_view(p_serial)`
- Query `byte_views` table for GET

**Response:**
```json
{
  "views": 42
}
```

---

#### Blog Post Views

```
GET  /api/bloq/views/{slug}   # Get view count
POST /api/bloq/views/{slug}   # Increment view count
```

**Auth:** None

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `slug` | string | Blog post slug |

**RPC Functions:**
- `increment_bloq_view(p_slug)`
- Query `bloq_views` table for GET

**Validation:** Checks if post exists via `getBloqPostBySlug()` before incrementing.

**Response:**
```json
{
  "views": 142
}
```

**Errors:**
- `404` - Post not found

---

#### Project Views

```
GET  /api/project/views/{slug}   # Get view count
POST /api/project/views/{slug}   # Increment view count
```

**Auth:** None

**RPC Functions:**
- `increment_project_view(p_slug)`
- Query `project_views` table for GET

**Response:**
```json
{
  "views": 89
}
```

---

### Claps

Fingerprint-based clap system with per-user limits.

#### Get/Add Claps

```
GET  /api/claps/{type}/{id}
POST /api/claps/{type}/{id}
```

**Auth:** None

**Path Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `type` | string | Post type: `bloq`, `blip`, or `byte` |
| `id` | string | Serial (blip/byte) or slug (bloq) |

**Query Parameters (GET only):**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fingerprint` | string | No | User fingerprint for personal clap count |

**Request Body (POST):**
```json
{
  "fingerprint": "user-fingerprint-hash"
}
```

**RPC Functions:**
- `upsert_clap(p_post_type, p_post_id, p_fingerprint, p_increment)`
- `get_user_claps(p_post_type, p_post_id, p_fingerprint)`
- `get_claps(p_post_type, p_post_id)`

**GET Response (with fingerprint):**
```json
{
  "claps": 42,
  "userClaps": 3
}
```

**GET Response (without fingerprint):**
```json
{
  "claps": 42,
  "userClaps": 0
}
```

**POST Response:**
```json
{
  "userClaps": 4,
  "totalClaps": 43,
  "maxReached": false
}
```

**Errors:**
- `400` - Invalid post type / Fingerprint required
- `404` - Post not found (bloq only, validates via `getBloqPostBySlug()`)

---

### Telegram

Telegram bot integration endpoints.

#### Webhook

```
POST /api/telegram/webhook
```

**Auth:** `X-Telegram-Bot-Api-Secret-Token` (SHA256 hash of `TELEGRAM_WEBHOOK_SECRET`)

**Request Body:** Telegram Update object

**Response:**
```json
{
  "ok": true
}
```

**Implementation:**
- Validates secret via SHA256 hash comparison
- Passes update to grammy bot via `bot.handleUpdate()`

**Errors:**
- `401` - Unauthorized

---

#### Broadcast

```
POST /api/telegram/broadcast
```

**Auth:** `X-Broadcast-Secret` (must match `TELEGRAM_BROADCAST_SECRET`)

**Request Body:**
```json
{
  "type": "bloq",
  "title": "New Blog Post",
  "slug": "my-new-post",
  "tags": "tech, programming"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | `bloq` |
| `title` | string | Yes | Post title |
| `slug` | string | Yes | Post slug/serial |
| `tags` | string | No | Comma-separated tags |

**Response:**
```json
{
  "ok": true,
  "broadcast": true
}
```

`tags` may be sent either as a comma-separated string or as a string array.

**Errors:**
- `400` - Unsupported broadcast type / Invalid payload
- `401` - Unauthorized
- `500` - Broadcast error

---

### Analytics

#### Visitor Tracking

```
POST /api/visit
```

**Auth:** None

**Request Body:**
```json
{
  "ip": "192.168.1.1",
  "network": "ISP Network",
  "city": "Mumbai",
  "region": "Maharashtra",
  "country_code": "IN",
  "postal": "400001",
  "latitude": 19.076,
  "longitude": 72.8777,
  "org": "ISP Name",
  "timezone": "Asia/Kolkata",
  "referrer": "https://google.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ip` | string | No* | Visitor IP address |
| `network` | string | No | Network name |
| `city` | string | No | City name |
| `region` | string | No | Region/state |
| `country_code` | string | No | ISO country code |
| `postal` | string | No | Postal code |
| `latitude` | number | No | Latitude coordinate |
| `longitude` | number | No | Longitude coordinate |
| `org` | string | No | Organization/ISP |
| `timezone` | string | No | Timezone |
| `referrer` | string | No | Referrer URL |

*If `ip` is provided, visitor is tracked and notification is sent.

**Response:**
```json
{
  "lastVisitorLocation": "Delhi, IN",
  "lastVisitTime": "2024-01-15T09:30:00Z",
  "visitorCount": 1234
}
```

**Implementation:**
- Parses device type from User-Agent header
- Checks for returning visitors by IP
- Sends Telegram notification via `notifyVisitor()`
- Uses `get_unique_visitor_count` RPC for total count

---

#### GitHub Activity

```
GET /api/github-activity?year=YYYY&month=MM
```

**Auth:** None

**Caching:** `revalidate: 3600` (1 hour)

**Query Parameters:**

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `year` | number | Yes | Four-digit calendar year |
| `month` | number | Yes | Calendar month `1-12` |

**Response:** `200 OK`

```json
{
  "year": 2026,
  "month": 5,
  "monthKey": "2026-05",
  "data": {
    "2026-05-01": 2,
    "2026-05-02": 0
  }
}
```

**Notes:**
- This endpoint returns one bounded contribution month at a time.
- `month` is calendar-based (`1-12`), not JavaScript `Date` month indexing.
- `data` keys are ISO calendar dates for the requested month.

**Errors:**
```json
{
  "error": "Failed to fetch GitHub activity",
  "details": "Error message"
}
```

Common error cases:
- `400` for missing or invalid `year` / `month`
- `500` for upstream GitHub fetch failures

---

## Data Schemas

### Blip

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `blip_serial` | string | Human-readable serial (e.g., `B001`) |
| `term` | string | The term/phrase |
| `meaning` | string | Definition/explanation |
| `tags` | string[] | Array of tags |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |

### Byte

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Unique identifier |
| `byte_serial` | string | Human-readable serial (e.g., `BY001`) |
| `content` | string | Content (max 280 characters) |
| `created_at` | datetime | Creation timestamp |

---

## Error Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## Implementation Notes

1. **No Caching:** All endpoints return `Cache-Control: no-store`
2. **Error Handling:** Uses `error: unknown` pattern with `instanceof Error` check
3. **Content Parsing:** Bytes accept JSON, form-urlencoded, and plain text
4. **RPC Functions:** View counters and claps use Supabase RPC for atomic operations
5. **Telegram Integration:** New blips/bytes auto-broadcast to channel if `TELEGRAM_CHANNEL_ID` is set
6. **Duplicate Routes:** `/api/byte/views/{serial}` and `/api/byte/{serial}/views` are functionally identical
