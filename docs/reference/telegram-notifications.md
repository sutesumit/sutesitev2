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
| `TELEGRAM_WEBHOOK_SECRET` | Yes | Secret token for webhook authentication |
| `TELEGRAM_PROD_WEBHOOK_URL` | Yes | Full URL to your webhook endpoint (production) |
| `TELEGRAM_CHANNEL_ID` | No | Channel ID for broadcasting bytes and blips |

### Configuration Example

```env
# Required
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ALLOWED_USER_IDS=123456789,987654321
TELEGRAM_WEBHOOK_SECRET=your-random-secret-string-here
TELEGRAM_PROD_WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook

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
    return botInstance;
  }

  // Create new instance (only runs once)
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }

  botInstance = new Bot<MyContext>(token);
  await botInstance.init();

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

**Note**: Bot commands are registered once during setup via `npm run telegram:setup`, not on every webhook call.
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

**Headers**:
```
X-Telegram-Bot-Api-Secret-Token: <sha256-hash-of-webhook-secret>
```

**Response**:
```json
{ "ok": true }
```

**Authentication**: Webhook secret via `X-Telegram-Bot-Api-Secret-Token` header. The header must contain the SHA-256 hash of `TELEGRAM_WEBHOOK_SECRET`.

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

## Security

### Mental Model: How Telegram Bot Security Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SETUP (one-time)                                │
│                                                                     │
│  Your machine ──setWebhook()──► Telegram Server                    │
│  (local or prod env vars)         (api.telegram.org)               │
│                                                                     │
│  Payload: {                                                         │
│    url: "https://your-domain.com/api/telegram/webhook",            │
│    secret_token: "sha256-hash-of-your-secret"                      │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Telegram Server (remembers this)                       │
│                                                                     │
│  "When I receive a message for this bot,                            │
│   POST to https://your-domain.com/api/telegram/webhook             │
│   with X-Telegram-Bot-Api-Secret-Token: <hash>"                    │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (when user messages your bot)
┌─────────────────────────────────────────────────────────────────────┐
│                     RUNTIME (every message)                         │
│                                                                     │
│  Telegram Server ──POST──► Your Webhook Endpoint                   │
│                              (your-domain.com)                      │
│                                                                     │
│  Headers:                                                           │
│    X-Telegram-Bot-Api-Secret-Token: <hash>                         │
│                                                                     │
│  Body:                                                              │
│    { update object with message content }                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Mental Model: Command Menu vs Handlers

These are two separate things that shouldn't be conflated:

```
┌────────────────────────────────────────────────────────────────────┐
│  SETUP SCRIPT (run once)                                           │
│                                                                    │
│  telegram:setup ──► "Telegram, show these commands in menu"       │
│                     [/start, /byte, /blip, ...]                   │
│                                                                    │
│  Stored on Telegram's servers - just UI metadata                  │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  YOUR DEPLOYED CODE (runs on every message)                        │
│                                                                    │
│  bot.ts:                                                           │
│    bot.command("byte", handleByte)  ← executes here               │
│    bot.command("blip", handleBlip)                                 │
│    ...                                                             │
│                                                                    │
│  Lives on your server - actual logic                              │
└────────────────────────────────────────────────────────────────────┘
```

| What | Where | When it runs |
|------|-------|--------------|
| **Command menu** (what shows when typing `/`) | Registered via setup script → Telegram stores it | One-time setup |
| **Command handlers** (what executes on `/byte`) | In `bot.ts` → Your deployed code | Every webhook call |

### Authentication Summary

| Endpoint | Auth Method | Env Var | Who uses it |
|----------|-------------|---------|-------------|
| `/api/telegram/webhook` | SHA-256 hash in `X-Telegram-Bot-Api-Secret-Token` header | `TELEGRAM_WEBHOOK_SECRET` | Telegram servers |
| `/api/blip`, `/api/byte` | API key in `K` or `X-Key` header | `BLIP_SECRET_KEY` | You (via curl, CLI, etc.) |

**Key insight:** The webhook secret is ONLY for Telegram-to-your-server communication. Your own API calls to `/api/blip` and `/api/byte` continue using the existing API key.

### Webhook Authentication

The webhook endpoint (`/api/telegram/webhook`) authenticates requests using a secret token:

1. **Setup**: Generate a random secret and set it as `TELEGRAM_WEBHOOK_SECRET`
2. **Registration**: Run `npm run telegram:setup` to register the webhook with Telegram, passing the SHA-256 hash of the secret
3. **Verification**: Telegram includes the hash in the `X-Telegram-Bot-Api-Secret-Token` header
4. **Validation**: The endpoint verifies the header matches the expected hash

This prevents unauthorized parties from sending forged POST requests to your webhook endpoint.

### User Authorization

Within the bot, user authorization is handled via a whitelist:

```typescript
// File: src/lib/telegram/middleware/auth.ts
const allowedIds = process.env.TELEGRAM_ALLOWED_USER_IDS?.split(',').map(id => id.trim()) ?? [];

if (!allowedIds.includes(ctx.from?.id?.toString() ?? '')) {
  return ctx.reply("Unauthorized.");
}
```

Only users whose Telegram IDs are in `TELEGRAM_ALLOWED_USER_IDS` can interact with the bot.

### Bot Token Security

The bot token is the master key. If compromised, an attacker can:
- Change the webhook URL
- Send messages as your bot
- Read messages sent to your bot
- Modify bot settings

**Common ways tokens get leaked:**
1. Hardcoded in source code committed to public repos
2. `.env` files accidentally committed
3. CI/CD logs exposing environment variables
4. Compromised Telegram account (via @BotFather)
5. Server/hosting provider breach

**Protection measures:**
- Store in environment variables only
- Add `.env*` to `.gitignore`
- Use `git-secrets` or similar tools
- Enable 2FA on your Telegram account
- Rotate token if any suspicion of compromise

### Setup Script

The `npm run telegram:setup` script performs one-time setup:

```bash
# Run from local machine with production credentials
TELEGRAM_BOT_TOKEN=xxx \
TELEGRAM_PROD_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook \
TELEGRAM_WEBHOOK_SECRET=xxx \
npm run telegram:setup
```

**What it does:**
1. Registers bot commands with Telegram (`/start`, `/byte`, `/blip`, etc.)
2. Sets the webhook URL with the secret hash
3. Verifies the webhook is properly configured

**Output:**
```
Bot: @yourbot

1. Setting bot commands...
   Commands set successfully

2. Setting webhook...
   Webhook set to: https://your-domain.com/api/telegram/webhook

3. Verifying webhook...
   Status: Active
   URL: https://your-domain.com/api/telegram/webhook
   Pending updates: 0

Setup complete!
```

**When to run:**
- Once after initial deployment
- When changing your domain
- When rotating the webhook secret
- When adding new commands to the menu

**When NOT needed:**
- After code changes (handlers live in your deployed code)
- After adding new features to existing commands
- After bug fixes in handlers

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
| `TELEGRAM_WEBHOOK_SECRET` | webhook/route.ts, setup script | Webhook authentication |
| `TELEGRAM_PROD_WEBHOOK_URL` | setup script | Webhook endpoint URL (production) |

### Database Tables

| Table | Used By | Description |
|-------|---------|-------------|
| `visits` | /api/visit | Visitor tracking |
| `bytes` | /api/byte, bot handlers | Byte storage (short thoughts) |
| `blips` | /api/blip, bot handlers | Blip storage (term:meaning pairs) |
| `bloq_views` | /api/bloq/views/[slug] | Bloq view counter |

---

*Last Updated: March 2026*
