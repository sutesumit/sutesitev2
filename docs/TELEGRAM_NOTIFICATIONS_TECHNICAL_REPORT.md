# Telegram Notification System - Technical Report

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Variables](#environment-variables)
4. [Notification Types](#notification-types)
5. [API Endpoints](#api-endpoints)
6. [Code Flow](#code-flow)
7. [Rate Limiting](#rate-limiting)
8. [Key Files](#key-files)
9. [Error Handling](#error-handling)
10. [Testing](#testing)

---

## Overview

The Telegram Notification System provides real-time notifications about website activity through a Telegram bot. It delivers three types of notifications:

- **Visitor Notifications**: Alerts the site owner when someone visits the website
- **Blip Channel Broadcasts**: Notifies subscribers when a new blip (term:meaning pair) is created
- **Bloq Channel Broadcasts**: Notifies subscribers when a new bloq (blog article) is published

The system uses the [Grammy](https://grammy.dev/) library for Telegram Bot API interactions and stores notifications in a Supabase database.

---

## Architecture

### File Structure

```
src/
├── lib/
│   └── telegram/
│       ├── __tests__/
│       │   ├── telegram-notifications.test.ts    # 55 test cases
│       │   └── handlers.test.ts                  # 6 test cases for channel broadcast
│       ├── bot.ts                                 # Bot initialization
│       ├── formatters.ts                          # Message formatting
│       ├── index.ts                               # Public exports
│       ├── middleware/
│       │   └── auth.ts                           # User authentication
│       ├── notifications.ts                       # Notification logic + rate limiting
│       ├── replies.ts                             # Message templates
│       ├── repository.ts                          # Database operations
│       └── commands/
│           └── handlers.ts                       # Bot command handlers (with channel broadcast)
├── app/
│   └── api/
│       ├── visit/
│       │   └── route.ts                          # Visit tracking endpoint
│       ├── blip/
│       │   └── route.ts                          # Blip CRUD endpoint
│       └── bloq/
│           └── route.ts                          # Bloq publish endpoint
```

### Component Connection Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                        │
├──────────────────┬──────────────────┬───────────────────────────────────┤
│   Website       │   Blip API        │   Bloq API                       │
│   (POST /visit) │   (POST /api/blip)│   (POST /api/bloq)               │
└────────┬────────┴────────┬──────────┴───────────────┬─────────────────┘
         │                 │                             │
         ▼                 ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        API LAYER                                         │
├──────────────────┬──────────────────┬───────────────────────────────────┤
│ /api/visit       │ /api/blip        │ /api/bloq                        │
│ route.ts         │ route.ts         │ route.ts                         │
└────────┬────────┴────────┬──────────┴───────────────┬─────────────────┘
         │                 │                             │
         ▼                 ▼                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  notifyVisitor()           broadcastChannelBlip()   broadcastChannelBloq()│
│  (notifications.ts)        (blip route.ts)          (bloq route.ts)     │
└────────┬────────────────────┬────────────────────────┬─────────────────┘
         │                    │                        │
         ▼                    ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    TELEGRAM BOT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  initBot() (bot.ts) - Uses Grammy library                               │
│  - Sends messages to user (TELEGRAM_ALLOWED_USER_IDS)                 │
│  - Broadcasts to channel (TELEGRAM_CHANNEL_ID)                         │
└─────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      TELEGRAM API                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  https://api.telegram.org/bot<token>/sendMessage                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Bot API token from @BotFather |
| `TELEGRAM_ALLOWED_USER_IDS` | Yes | Comma-separated list of user IDs that can interact with the bot |
| `TELEGRAM_CHANNEL_ID` | No | Channel ID for broadcasting blips and bloqs |
| `BLOQ_API_KEY` | Yes* | API key for publishing bloqs via `/api/bloq` |

*Only required when using the `/api/bloq` endpoint.

### Configuration Example

```env
# Required
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ALLOWED_USER_IDS=123456789,987654321

# Optional
TELEGRAM_CHANNEL_ID=-1001234567890
BLOQ_API_KEY=your-secure-api-key-here
```

---

## Notification Types

### 1. Visitor Notifications

**Trigger**: When a visitor accesses the website

**Flow**:
```
Visitor → Website → POST /api/visit → Database (visits table)
                                         │
                                         ▼
                                   notifyVisitor()
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                                         ▼
           Rate Limiting Check                      TELEGRAM_ALLOWED_USER_IDS
           (1 minute)                                    (User 1)
                    │                                         │
                    ▼                                         ▼
           Allow/Deny                                    Telegram Message
```

**Message Format**:
```
👤 👋 returning (3x)
📍 Mumbai, Maharashtra, India
💻 Desktop
🌐 192.168.1.1
🔗 https://google.com
```

**Fields**:
| Field | Description | Example |
|-------|-------------|---------|
| 👤 Status | New or returning visitor with visit count | `👋 returning (3x)` or `✨ new` |
| 📍 Location | City, Region, Country | `Mumbai, Maharashtra, India` |
| 💻 Device | Device type parsed from user-agent | `Desktop`, `Mobile`, `Tablet` |
| 🌐 IP | Visitor's IP address | `192.168.1.1` |
| 🔗 Source | Referrer or direct | `google.com` or `direct` |

### 2. Blip Channel Broadcast

**Trigger**: When a blip is created via POST `/api/blip` or via Telegram bot `/blip` command

**Flow**:
```
Client → POST /api/blip → Validate API Key
                              │
                              ▼
                         Database (blips table)
                              │
                              ▼
                    TELEGRAM_CHANNEL_ID
                              │
                              ▼
                    Channel Message
```

**Bot Command Flow**:
```
Telegram User → /blip term:meaning → handleBlip()
                                           │
                                           ▼
                                      Database (blips table)
                                           │
                                           ▼
                                    TELEGRAM_CHANNEL_ID
                                           │
                                           ▼
                                    Channel Message
```

**Message Format**:
```
🤖: <a href="https://www.sumitsute.com/blip/001">API: Application Programming Interface</a>
```

### 2b. Byte Channel Broadcast

**Trigger**: When a byte is created via Telegram bot `/byte` command or direct message

**Flow**:
```
Telegram User → /byte content → handleByte()
                                      │
                                      ▼
                                 Database (bytes table)
                                      │
                                      ▼
                               TELEGRAM_CHANNEL_ID
                                      │
                                      ▼
                               Channel Message
```

**Message Format**:
```
🤖: <a href="https://www.sumitsute.com/blip/001">Test byte content</a>
```

**Note**: Bytes are stored in the `bytes` table but displayed at `/blip/{serial}` URL.

### 3. Bloq Channel Broadcast

**Trigger**: When a bloq is published via POST `/api/bloq`

**Flow**:
```
Client → POST /api/bloq → Validate BLOQ_API_KEY
                              │
                              ▼
                         Database (bloq_views table)
                              │
                              ▼
                    TELEGRAM_CHANNEL_ID
                              │
                              ▼
                    Channel Message
```

**Message Format**:
```
📝 My New Article
<a href="https://www.sumitsute.com/bloq/my-new-article">Read more</a>
Tags: react, nextjs
```

---

## API Endpoints

### POST /api/visit

Track a website visit and optionally notify the owner.

**Request**:
```json
{
  "ip": "192.168.1.1",
  "city": "Mumbai",
  "region": "Maharashtra",
  "country_code": "IN",
  "postal": "400001",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "org": "ISP Name",
  "timezone": "Asia/Kolkata",
  "referrer": "https://google.com"
}
```

**Response**:
```json
{
  "lastVisitorLocation": "Mumbai, India",
  "lastVisitTime": "2026-03-18T10:00:00Z",
  "visitorCount": 1523
}
```

**Authentication**: None (public endpoint)

### POST /api/blip

Create a new blip and broadcast to the channel.

**Headers**:
```
K: <api-key>
# or
X-Key: <api-key>
```

**Request**:
```json
{
  "term": "API",
  "meaning": "Application Programming Interface"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "blip": {
      "id": "uuid",
      "blip_serial": "042",
      "term": "API",
      "meaning": "Application Programming Interface",
      "tags": [],
      "created_at": "2026-03-18T10:00:00Z",
      "updated_at": "2026-03-18T10:00:00Z"
    }
  }
}
```

**Authentication**: API key via `K` or `X-Key` header

### POST /api/bloq

Publish a new bloq and broadcast to the channel.

**Headers**:
```
K: <BLOQ_API_KEY>
# or
X-Key: <BLOQ_API_KEY>
```

**Request**:
```json
{
  "title": "Understanding React Server Components",
  "slug": "understanding-rsc",
  "summary": "A deep dive into React Server Components",
  "tags": ["react", "nextjs", "server-components"],
  "category": "technology"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "bloq": {
      "id": "uuid",
      "title": "Understanding React Server Components",
      "slug": "understanding-rsc",
      "summary": "A deep dive into React Server Components",
      "tags": ["react", "nextjs", "server-components"],
      "category": "technology",
      "created_at": "2026-03-18T10:00:00Z",
      "updated_at": "2026-03-18T10:00:00Z"
    }
  }
}
```

**Authentication**: `BLOQ_API_KEY` via `K` or `X-Key` header

---

## Code Flow

### Visitor Notification Flow

```typescript
// Step 1: Client sends POST /api/visit with location data
// File: src/app/api/visit/route.ts

export async function POST(request: Request) {
  const body = await request.json();
  const userAgent = request.headers.get('user-agent');
  const deviceType = parseDeviceType(userAgent);
  
  // Step 2: Check if returning visitor and count visits
  const { data: existingVisits } = await supabase
    .from('visits')
    .select('id')
    .eq('ip', body.ip);
  
  const isReturning = (existingVisits?.length ?? 0) > 0;
  const visitCount = (existingVisits?.length ?? 0) + 1;
  
  // Step 3: Insert visit to database
  await supabase.from('visits').insert([visitorData]);
  
  // Step 4: API calls notifyVisitor() in background
  const notifyPromise = notifyVisitor(
    { 
      city: body.city, 
      country: body.country_code, 
      region: body.region,
      ip: body.ip,
      deviceType,
      isReturning,
      visitCount,
    },
    body.referrer
  );
  notifyPromise.catch((err) => console.error("Visitor notification error:", err));
  
  // Step 8: Returns response to client
  return NextResponse.json({ ... });
}
```

```typescript
// Step 4: notifyVisitor checks rate limit (1 min)
// File: src/lib/telegram/notifications.ts

const MINUTE_1_MS = 60 * 1000;

export async function shouldNotifyVisitor(visitor: { ip?: string }): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  
  // Get last visit from database
  const { data } = await supabase
    .from('visits')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (!data || data.length === 0) {
    return true; // First visitor ever
  }
  
  const lastVisit = new Date(data[0].created_at);
  const now = new Date();
  const timeDiff = now.getTime() - lastVisit.getTime();
  
  // Step 4 (continued): Check if enough time has passed
  return timeDiff > MINUTE_1_MS;
}

export async function notifyVisitor(visitor: { 
  city?: string; 
  country?: string; 
  region?: string; 
  ip?: string;
  deviceType?: string;
  isReturning?: boolean;
  visitCount?: number;
}, referrer?: string): Promise<void> {
  // Step 4: Check rate limiting
  const shouldNotify = await shouldNotifyVisitor(visitor);
  if (!shouldNotify) {
    return; // Skip notification
  }
  
  // Step 5: Get first user from TELEGRAM_ALLOWED_USER_IDS
  const allowedUserIds = process.env.TELEGRAM_ALLOWED_USER_IDS;
  const userIds = allowedUserIds.split(',').map(id => id.trim());
  const chatId = userIds[0];
  
  // Step 5 (continued): Send message to user
  const bot = await initBot();
  await bot.api.sendMessage(
    chatId,
    replies.visitorNotification(visitor, referrer),
    { parse_mode: "HTML" }
  );
}
```

### Blip Creation Flow

```typescript
// File: src/app/api/blip/route.ts

export async function POST(req: Request) {
  // Step a: Validate API key
  const authHeader = req.headers.get("K") || req.headers.get("X-Key");
  if (!validateApiKey(authHeader)) {
    return unauthorizedResponse();
  }
  
  const body = await req.json();
  const { term, meaning } = body;
  
  // Step b: Insert to database
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blips")
    .insert({ term, meaning, tags: [] })
    .select("id, blip_serial, term, meaning, tags, created_at, updated_at")
    .single();
  
  // Step c: Broadcast to TELEGRAM_CHANNEL_ID
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (channelId) {
    const bot = await initBot();
    await bot.api.sendMessage(
      channelId,
      replies.channelBlip(data.blip_serial, `${data.term}: ${data.meaning}`),
      { parse_mode: "HTML" }
    );
  }
  
  // Step d: Return response
  return jsonSuccess({ blip: data }, 201);
}
```

### Bloq Publishing Flow

```typescript
// File: src/app/api/bloq/route.ts

export async function POST(req: Request) {
  // Step a: Validate BLOQ_API_KEY
  const authHeader = req.headers.get("K") || req.headers.get("X-Key");
  const expectedKey = process.env.BLOQ_API_KEY;
  
  if (!expectedKey || authHeader !== expectedKey) {
    return unauthorizedResponse();
  }
  
  const body = await req.json();
  const { title, slug, summary, tags, category } = body;
  
  // Step b: Insert to database
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bloq_views")
    .insert({ title, slug, summary, tags, category })
    .select("id, title, slug, summary, tags, category, created_at, updated_at")
    .single();
  
  // Step c: Broadcast to TELEGRAM_CHANNEL_ID
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (channelId) {
    const bot = await initBot();
    await bot.api.sendMessage(
      channelId,
      replies.channelBloq(data.slug, data.title, data.tags),
      { parse_mode: "HTML" }
    );
  }
  
  // Step d: Return response
  return jsonSuccess({ bloq: data }, 201);
}
```

---

## Rate Limiting

### Visitor Notifications

**Limit**: One notification per minute (60,000 milliseconds)

**Implementation**:
```typescript
// File: src/lib/telegram/notifications.ts

const MINUTE_1_MS = 60 * 1000;

export async function shouldNotifyVisitor(visitor: { ip?: string }): Promise<boolean> {
  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from('visits')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!data || data.length === 0) {
      return true; // Always notify for first visitor
    }

    const lastVisit = new Date(data[0].created_at);
    const now = new Date();
    const timeDiff = now.getTime() - lastVisit.getTime();

    return timeDiff > MINUTE_1_MS;
  } catch {
    return true; // Fail open - notify if rate check fails
  }
}
```

**Behavior**:
- If there are no previous visits, notification is always sent
- If the last visit was more than 1 minute ago, notification is sent
- If the last visit was within 1 minute, notification is skipped
- If rate limiting check fails, notifications are sent (fail-open pattern)

### Channel Broadcasts

No rate limiting is applied to channel broadcasts. Each blip or bloq creation triggers an immediate broadcast.

---

## Key Files

### src/lib/telegram/notifications.ts

Core notification logic with rate limiting.

**Exports**:
- `shouldNotifyVisitor(visitor)` - Check if visitor notification should be sent
- `notifyVisitor(visitor, referrer)` - Send visitor notification to owner

**Key Features**:
- Rate limiting (1 minute between notifications)
- Fail-open pattern for error handling
- Uses first user from `TELEGRAM_ALLOWED_USER_IDS`

### src/lib/telegram/replies.ts

Message templates for all notification types.

**Key Templates**:
```typescript
replies.visitorNotification(visitor, referrer)  // Visitor alerts with device, IP, returning status
replies.channelBlip(serial, content)             // Blip broadcasts
replies.channelBloq(slug, title, tags)           // Bloq broadcasts
```

**Visitor Notification Data**:
```typescript
visitor: {
  city?: string;       // "Mumbai"
  country?: string;    // "India"
  region?: string;     // "Maharashtra"
  ip?: string;         // "192.168.1.1"
  deviceType?: string; // "Desktop" | "Mobile" | "Tablet"
  isReturning?: boolean;  // true if IP seen before
  visitCount?: number;    // number of visits from this IP
}
```

### src/lib/telegram/formatters.ts

Formatting functions for displaying content.

**Functions**:
```typescript
formatByte(byte)    // Format a byte for display
formatBlip(blip)    // Format a blip for display
formatBloq(bloq)    // Format a bloq for display
```

### src/app/api/visit/route.ts

Visit tracking endpoint.

**Responsibilities**:
- Accept visitor location data
- Parse device type from user-agent header
- Check if visitor is returning (by IP lookup)
- Count total visits from this IP
- Insert visit to database
- Trigger background notification with enriched data
- Return visitor statistics

### src/app/api/blip/route.ts

Blip CRUD endpoint with broadcasting.

**Responsibilities**:
- Validate API key
- Create blip in database
- Broadcast to Telegram channel
- Return created blip

### src/app/api/bloq/route.ts

Bloq publishing endpoint with broadcasting.

**Responsibilities**:
- Validate `BLOQ_API_KEY`
- Publish bloq to database
- Broadcast to Telegram channel
- Return published bloq

---

## Error Handling

### Pattern

All errors are caught and logged without throwing:

```typescript
// In notifications.ts
try {
  const bot = await initBot();
  await bot.api.sendMessage(chatId, message, { parse_mode: "HTML" });
} catch (error) {
  console.error("Failed to notify owner:", error);
}

// In API routes
try {
  // ... operation
} catch (error: unknown) {
  console.error("Error in operation:", error);
  const message = error instanceof Error ? error.message : 'Unknown error';
  return jsonError(message, 500);
}
```

### Error Handling Strategies

| Scenario | Behavior |
|----------|----------|
| Telegram API failure | Log error, continue execution |
| Database error | Return JSON error with message |
| Rate limit check fails | Fail open - allow notification |
| Missing env variables | Gracefully skip operation |
| Invalid API key | Return 401 unauthorized |

---

## Testing

### Test Coverage

The test suite contains **61 test cases** covering:

- **Message Formatting**: 22 tests
- **Telegram Replies**: 14 tests
- **Formatters**: 12 tests
- **Edge Cases**: 14 tests
- **Rate Limiting**: 4 tests
- **Error Handling**: 3 tests
- **Handler Channel Broadcast**: 6 tests

### Running Tests

```bash
# Run all tests
npm test

# Run telegram tests specifically
npm test -- telegram

# Run handler broadcast tests
npm test -- handlers.test.ts
```

### Handler Broadcast Tests

Tests for channel broadcast behavior in `/byte` and `/blip` commands:

```typescript
describe('handleByte', () => {
  it('broadcasts to channel on success', async () => {
    // Verifies bot.api.sendMessage is called with channel ID
  });

  it('skips broadcast if no TELEGRAM_CHANNEL_ID', async () => {
    // Verifies no broadcast when env var is not set
  });

  it('handles broadcast errors gracefully', async () => {
    // Verifies errors are logged but don't break the command
  });
});

describe('handleBlip', () => {
  it('broadcasts to channel on success', async () => {
    // Verifies bot.api.sendMessage is called with channel ID
  });

  it('includes term:meaning in message', async () => {
    // Verifies the full term:meaning is in the broadcast
  });

  it('skips broadcast if no TELEGRAM_CHANNEL_ID', async () => {
    // Verifies no broadcast when env var is not set
  });
});
```

### Test Categories

#### Message Formatting Tests
```typescript
it('should format blip with serial and content', () => {
  const result = replies.channelBlip('001', 'Test content');
  expect(result).toContain('001');
  expect(result).toContain('Test content');
});

it('should format bloq with tags', () => {
  const result = replies.channelBloq('Test Title', 'test-slug', ['react', 'nextjs']);
  expect(result).toContain('react');
  expect(result).toContain('nextjs');
});
```

#### Edge Case Tests
```typescript
it('should handle very long content in channelBlip', () => {
  const longContent = 'a'.repeat(1000);
  const result = replies.channelBlip('001', longContent);
  expect(result).toContain(longContent);
});

it('should handle Unicode characters in content', () => {
  const content = 'Hello 🌍 世界 مرحبا';
  const result = replies.channelBlip('001', content);
  expect(result).toContain('Hello');
  expect(result).toContain('🌍');
});
```

#### Rate Limiting Tests
```typescript
it('should return true for first visitor (no previous visits)', () => {
  const lastVisitTime = null;
  const result = !lastVisitTime || (Date.now() - new Date(lastVisitTime).getTime()) > MINUTE_1_MS;
  expect(result).toBe(true);
});

it('should return false within 1 minute', () => {
  const lastVisitTime = new Date(Date.now() - 30 * 1000).toISOString();
  const result = !lastVisitTime || (Date.now() - new Date(lastVisitTime).getTime()) > MINUTE_1_MS;
  expect(result).toBe(false);
});
```

---

## Appendix

### Dependencies

- **grammy**: Telegram Bot API library
- **@supabase/supabase-js**: Supabase client for database operations

### Related Environment Variables

| Variable | Used By | Description |
|----------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | bot.ts | Bot authentication |
| `TELEGRAM_ALLOWED_USER_IDS` | notifications.ts | Owner user IDs |
| `TELEGRAM_CHANNEL_ID` | blip/bloq routes | Broadcast channel |
| `BLOQ_API_KEY` | bloq route | Bloq publishing auth |

### Database Tables

| Table | Used By | Description |
|-------|---------|-------------|
| `visits` | /api/visit | Visitor tracking |
| `blips` | /api/blip | Blip storage |
| `bloq_views` | /api/bloq | Bloq storage |

---

*Last Updated: March 2026*
