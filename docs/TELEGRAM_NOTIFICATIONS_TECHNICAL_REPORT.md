# Telegram Notification System - Technical Report

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Variables](#environment-variables)
4. [Notification Types](#notification-types)
5. [Bot Initialization](#bot-initialization)
6. [API Endpoints](#api-endpoints)
7. [Code Flow](#code-flow)
8. [Key Files](#key-files)
9. [Error Handling](#error-handling)
10. [Testing](#testing)
11. [Future Scope](#future-scope)

---

## Overview

The Telegram Notification System provides real-time notifications about website activity through a Telegram bot. It delivers three types of notifications:

- **Visitor Notifications**: Alerts the site owner when someone visits the website
- **Byte Channel Broadcasts**: Notifies subscribers when a new byte (short thought) is created
- **Blip Channel Broadcasts**: Notifies subscribers when a new blip (term:meaning pair) is created

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
│       ├── bot.ts                                 # Bot initialization (singleton)
│       ├── formatters.ts                          # Message formatting
│       ├── index.ts                               # Public exports
│       ├── middleware/
│       │   └── auth.ts                           # User authentication
│       ├── notifications.ts                       # Visitor notification logic
│       ├── replies.ts                             # Message templates
│       ├── repository.ts                          # Database operations
│       └── commands/
│           └── handlers.ts                       # Bot command handlers (with channel broadcast)
├── app/
│   └── api/
│       ├── visit/
│       │   └── route.ts                          # Visit tracking endpoint
│       ├── byte/
│       │   └── route.ts                          # Byte CRUD endpoint
│       ├── blip/
│       │   └── route.ts                          # Blip CRUD endpoint
│       └── telegram/
│           └── webhook/
│               └── route.ts                      # Telegram webhook endpoint
```

### Component Connection Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                           │
├──────────────────┬──────────────────┬──────────────────┬───────────────────┤
│   Website        │   Byte API       │   Blip API       │   Telegram       │
│   (POST /visit)  │   (POST /api/byte)│  (POST /api/blip)│  (Webhook)       │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴────────┬─────────┘
         │                  │                  │                  │
         ▼                  ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                        API LAYER                                            │
├──────────────────┬──────────────────┬──────────────────┬───────────────────┤
│ /api/visit       │ /api/byte        │ /api/blip        │ /api/telegram/   │
│ route.ts         │ route.ts         │ route.ts         │ webhook/route.ts │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴────────┬─────────┘
         │                  │                  │                  │
         ▼                  ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION LAYER                                      │
├────────────────────────────────────────────────────────────────────────────┤
│  notifyVisitor()      broadcastChannelByte()  broadcastChannelBlip()       │
│  (notifications.ts)   (byte route.ts)         (blip route.ts)              │
│                       (handlers.ts)           (handlers.ts)                 │
└────────┬─────────────────────┬──────────────────┬───────────────────────────┘
         │                     │                  │
         ▼                     ▼                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    TELEGRAM BOT LAYER                                       │
├────────────────────────────────────────────────────────────────────────────┤
│  initBot() (bot.ts) - Uses Grammy library                                  │
│  - Sends messages to user (TELEGRAM_ALLOWED_USER_IDS)                    │
│  - Broadcasts to channel (TELEGRAM_CHANNEL_ID)                            │
│  - Handles incoming commands via webhook                                   │
└────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                      TELEGRAM API                                           │
├────────────────────────────────────────────────────────────────────────────┤
│  https://api.telegram.org/bot<token>/sendMessage                           │
│  https://api.telegram.org/bot<token>/setWebhook                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | Bot API token from @BotFather |
| `TELEGRAM_ALLOWED_USER_IDS` | Yes | Comma-separated list of user IDs that can interact with the bot |
| `TELEGRAM_CHANNEL_ID` | No | Channel ID for broadcasting bytes and blips |

### Configuration Example

```env
# Required
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ALLOWED_USER_IDS=123456789,987654321

# Optional
TELEGRAM_CHANNEL_ID=-1001234567890
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
                                         ▼
                              TELEGRAM_ALLOWED_USER_IDS
                                   (First User)
                                         │
                                         ▼
                                Telegram Message
```

**Message Format**:
```
👤 👋 returning (3x)
📍 Mumbai, Maharashtra, India
💻 iPhone
🌐 192.168.1.1
🔗 https://google.com
```

**Fields**:
| Field | Description | Example |
|-------|-------------|---------|
| 👤 Status | New or returning visitor with visit count | `👋 returning (3x)` or `✨ new` |
| 📍 Location | City, Region, Country | `Mumbai, Maharashtra, India` |
| 💻 Device | Device type parsed from user-agent | `iPhone`, `Android`, `Windows`, `Mac`, etc. |
| 🌐 IP | Visitor's IP address | `192.168.1.1` |
| 🔗 Source | Referrer or direct | `google.com` or `direct` |

**Device Type Parsing**:
The system parses the User-Agent header to identify specific devices:

| Device | Detection |
|--------|-----------|
| `iPhone` | `iphone` in user-agent |
| `iPad` | `ipad` in user-agent |
| `Mac` | `macintosh` or `mac os x` in user-agent |
| `Android` | `android` without tablet indicators |
| `Android Tablet` | `android` with `tablet` or `tab` |
| `Windows` | `windows` in user-agent |
| `Linux` | `linux` in user-agent |
| `Chromebook` | `cros` or `chromebook` in user-agent |
| `Mobile` | `mobile` fallback |
| `Desktop` | Default fallback |

### 2. Byte Channel Broadcast

**Trigger**: When a byte is created via POST `/api/byte` or via Telegram bot `/byte` command or direct message

**API Flow**:
```
Client → POST /api/byte → Validate API Key
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

**Bot Command Flow**:
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

**Direct Message Flow**:
```
Telegram User → any text → handleMessage()
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

### 3. Blip Channel Broadcast

**Trigger**: When a blip is created via POST `/api/blip` or via Telegram bot `/blip` command

**API Flow**:
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

---

## Bot Initialization

### The `initBot()` Function

The bot uses a **singleton pattern** to ensure only one bot instance exists throughout the application lifecycle.

```typescript
// File: src/lib/telegram/bot.ts

let botInstance: Bot<MyContext> | null = null;

export async function initBot(): Promise<Bot<MyContext>> {
  // Return cached instance if it exists
  if (botInstance) {
    await botInstance.api.setMyCommands([...BOT_COMMANDS]);
    return botInstance;
  }

  // Create new instance (only runs once)
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }

  botInstance = new Bot<MyContext>(token);
  await botInstance.init();

  // Register command menu with Telegram
  await botInstance.api.setMyCommands([...BOT_COMMANDS]);

  // Register command handlers
  botInstance.command("start", handleStart);
  botInstance.command("byte", (ctx) => handleByte(ctx, botInstance!));
  botInstance.command("blip", (ctx) => handleBlip(ctx, botInstance!));
  botInstance.command("list", handleList);
  botInstance.command("get", handleGet);
  botInstance.command("edit", handleEdit);
  botInstance.command("del", handleDel);
  
  // Catch-all for non-command messages
  botInstance.on("message", (ctx) => handleMessage(ctx, botInstance!));

  return botInstance;
}
```

### Why Singleton?

| Reason | Explanation |
|--------|-------------|
| **Handler registration** | Grammy handlers are registered once per instance |
| **Connection state** | Bot maintains internal state for API calls |
| **Efficiency** | Avoid recreating the bot on every webhook call |
| **Consistency** | Same handlers apply to all incoming messages |

### When `initBot()` is Called

1. **Webhook receives message** → `initBot()` → `bot.handleUpdate(update)` → handlers run
2. **Visitor notification** → `initBot()` → `bot.api.sendMessage()`
3. **Channel broadcast** → `initBot()` → `bot.api.sendMessage()`

Each call after the first returns the cached `botInstance`.

### Two Modes of Bot Operation

**Mode 1: Outgoing Messages (Your code initiates)**
```typescript
// Send notification to user or channel
const bot = await initBot();
await bot.api.sendMessage(chatId, "Hello!", { parse_mode: "HTML" });
```

**Mode 2: Incoming Messages (Telegram initiates)**
```typescript
// Telegram POSTs to /api/telegram/webhook
// Your code handles the update
const bot = await initBot();
await bot.handleUpdate(update);  // Routes to appropriate handler
```

---

## API Endpoints

### POST /api/visit

Track a website visit and notify the owner.

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

### POST /api/byte

Create a new byte and broadcast to the channel.

**Headers**:
```
K: <api-key>
# or
X-Key: <api-key>
```

**Request**:
```json
{
  "content": "Just had a great idea for a new project"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "byte": {
      "id": "uuid",
      "byte_serial": "042",
      "content": "Just had a great idea for a new project",
      "created_at": "2026-03-18T10:00:00Z"
    }
  }
}
```

**Authentication**: API key via `K` or `X-Key` header

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

### POST /api/telegram/webhook

Handle incoming messages from Telegram.

**Request**: Telegram Update object (JSON)

**Response**:
```json
{ "ok": true }
```

**Authentication**: None (Telegram posts directly)

---

## Code Flow

### Visitor Notification Flow

```typescript
// Step 1: Client sends POST /api/visit with location data
// File: src/app/api/visit/route.ts

export async function POST(request: Request) {
  const body = await request.json();
  const userAgent = request.headers.get('user-agent');
  const deviceType = parseDeviceType(userAgent);  // e.g., "iPhone", "Windows"
  
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
  
  // Step 5: Returns response to client
  return NextResponse.json({ ... });
}
```

```typescript
// Step 4: notifyVisitor sends notification
// File: src/lib/telegram/notifications.ts

export async function notifyVisitor(visitor: {
  city?: string;
  country?: string;
  region?: string;
  ip?: string;
  deviceType?: string;
  isReturning?: boolean;
  visitCount?: number;
}, referrer?: string): Promise<void> {
  const allowedUserIds = process.env.TELEGRAM_ALLOWED_USER_IDS;
  const userIds = allowedUserIds.split(',').map(id => id.trim());
  const chatId = userIds[0];

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

---

## Key Files

### src/lib/telegram/bot.ts

Bot initialization with singleton pattern.

**Exports**:
- `initBot()` - Get or create the bot instance

**Key Features**:
- Singleton pattern for efficiency
- Registers all command handlers
- Sets up command menu with Telegram

### src/lib/telegram/notifications.ts

Core notification logic for visitor alerts.

**Exports**:
- `notifyVisitor(visitor, referrer)` - Send visitor notification to owner

**Key Features**:
- Uses first user from `TELEGRAM_ALLOWED_USER_IDS`
- Graceful error handling

### src/lib/telegram/replies.ts

Message templates for all notification types.

**Key Templates**:
```typescript
replies.visitorNotification(visitor, referrer)  // Visitor alerts with device, IP, returning status
replies.channelBlip(serial, content)             // Blip/Byte broadcasts
```

**Visitor Notification Data**:
```typescript
visitor: {
  city?: string;       // "Mumbai"
  country?: string;    // "India"
  region?: string;     // "Maharashtra"
  ip?: string;         // "192.168.1.1"
  deviceType?: string; // "iPhone", "Android", "Windows", etc.
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
```

### src/lib/telegram/commands/handlers.ts

Bot command handlers with channel broadcast.

**Handlers**:
- `handleStart` - Show help
- `handleByte` - Create byte + broadcast
- `handleBlip` - Create blip + broadcast
- `handleList` - List bytes/blips
- `handleGet` - Get specific item
- `handleEdit` - Edit item
- `handleDel` - Delete item
- `handleMessage` - Catch-all for creating bytes

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

### src/app/api/byte/route.ts

Byte CRUD endpoint with broadcasting.

**Responsibilities**:
- Validate API key
- Create byte in database
- Broadcast to Telegram channel
- Return created byte

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

---

## Future Scope

### 1. Daily Visitor Digest (Cron Job)

Instead of real-time visitor notifications, send a consolidated daily report.

**Proposed Implementation**:
- Create `/api/cron/visitor-digest` endpoint
- Query visits from last 24 hours
- Send summary message with:
  - Total visits
  - Unique visitors
  - Top locations
  - Device breakdown

**Message Format**:
```
📊 Daily Visitor Digest

👥 47 visits (32 unique)

📍 Top locations:
  • Mumbai, India (12x)
  • Delhi, India (8x)
  • New York, USA (5x)

💻 Devices: 25 iPhone, 12 Windows, 8 Android, 2 Mac

🗓️ Last 24 hours
```

**Trigger Options**:
- Vercel Cron Jobs (if deployed on Vercel)
- GitHub Actions scheduled workflow
- External cron service (cron-job.org)

### 2. Bloq Publication Notification (GitHub Actions)

When a new bloq is published (MDX file added), broadcast to the channel.

**Proposed Implementation**:
```yaml
# .github/workflows/notify-bloq.yml
name: Notify New Bloq

on:
  push:
    branches: [main]
    paths:
      - 'src/content/bloqs/**/index.mdx'

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2
      
      - name: Get new bloq info
        run: |
          # Extract bloq metadata from new/modified MDX files
          # Send Telegram notification via API
```

**Message Format**:
```
📝 Understanding React Server Components
<a href="https://www.sumitsute.com/bloq/understanding-rsc">Read more</a>
Tags: react, nextjs
```

### 3. CLI Tool for Content Management

A separate command-line interface for managing bytes and blips without Telegram.

**Proposed Features**:
- `blip "content"` - Create byte
- `blip "term:meaning"` - Create blip
- `blips` - List recent items
- `blip-edit <serial>` - Edit item
- `blip-del <serial>` - Delete item

**Note**: This is documented in a separate article.

---

## Appendix

### Dependencies

- **grammy**: Telegram Bot API library
- **@supabase/supabase-js**: Supabase client for database operations

### Related Environment Variables

| Variable | Used By | Description |
|----------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | bot.ts | Bot authentication |
| `TELEGRAM_ALLOWED_USER_IDS` | notifications.ts, handlers.ts | Owner user IDs |
| `TELEGRAM_CHANNEL_ID` | byte/blip routes, handlers.ts | Broadcast channel |

### Database Tables

| Table | Used By | Description |
|-------|---------|-------------|
| `visits` | /api/visit | Visitor tracking |
| `bytes` | /api/byte, bot handlers | Byte storage (short thoughts) |
| `blips` | /api/blip, bot handlers | Blip storage (term:meaning pairs) |
| `bloq_views` | /api/bloq/views/[slug] | Bloq view counter |

---

*Last Updated: March 2026*
