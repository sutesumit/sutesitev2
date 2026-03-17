# Plan: Telegram Channel & Bot Notifications

## Goals

1. **Broadcast new blips to Telegram channel** (currently only bytes are broadcast)
2. **Broadcast new bloqs to Telegram channel** (not currently implemented)
3. **Send bot messages for new visitors** (notify owner directly, not to channel)

---

## Current State

| Content Type | Create API | Channel Broadcast | Bot Notification |
|--------------|-----------|-------------------|------------------|
| Byte | `/api/byte` | ✅ Yes | N/A |
| Blip | `/api/blip` | ❌ No | N/A |
| Bloq | MDX file | ❌ No | ❌ No |
| Visit | `/api/visit` | N/A | ❌ No |

---

## Implementation Plan

### 1. Add Blip Broadcast to Channel

**File:** `src/app/api/blip/route.ts`

Add channel broadcast after blip creation, similar to how bytes are handled:

```typescript
// After successful blip insert, add:
const channelId = process.env.TELEGRAM_CHANNEL_ID;
if (channelId) {
  try {
    const bot = await initBot();
    await bot.api.sendMessage(
      channelId,
      replies.channelBlip(data.blip_serial, `${data.term}: ${data.meaning}`),
      { parse_mode: "HTML" }
    );
  } catch (broadcastError) {
    console.error("Failed to broadcast to channel:", broadcastError);
  }
}
```

**New reply format needed:** Add `channelBlip` format in `src/lib/telegram/replies.ts`

---

### 2. Add Bloq Broadcast to Channel

Bloqs are currently MDX files without an API. Two approaches:

**Option A: Create `/api/bloq/publish` endpoint** (Recommended)
- Create new API endpoint that accepts bloq metadata and broadcasts
- Requires adding new environment variable for authorization
- Allows CLI or webhook to trigger publish

**Option B: GitHub Actions / Webhook**
- When bloq is pushed to main with `draft: false`, trigger notification

**Implementation (Option A):**

1. Create `src/app/api/bloq/route.ts` with POST endpoint
2. Add formatters for bloq in `src/lib/telegram/formatters.ts`
3. Add bloq reply templates in `src/lib/telegram/replies.ts`

**Bloq format for channel:**
```
📝 <title>
<a href="https://www.sumitsute.com/bloq/{slug}">Read more</a>
Tags: {tags}
```

---

### 3. Add Visitor Bot Notification

**File:** `src/app/api/visit/route.ts`

After inserting visitor data, send notification to bot owner (not channel):

```typescript
// After inserting visit, add:
const ownerChatId = process.env.TELEGRAM_OWNER_CHAT_ID;
if (ownerChatId && shouldNotify()) { // with rate limiting
  try {
    const bot = await initBot();
    await bot.api.sendMessage(
      ownerChatId,
      replies.visitorNotification(visitorData),
      { parse_mode: "HTML" }
    );
  } catch (notifyError) {
    console.error("Failed to notify owner:", notifyError);
  }
}
```

**Rate limiting:** Use Supabase to track last notification time, only notify once per 24 hours

**Visitor notification format:**
```
👤 New visitor!
Location: {city}, {country}
Time: {timestamp}
Page: {referrer or "direct"}
```

---

### 4. New Environment Variables

Add to `.env.local`:

```bash
# For bot notifications (owner chat ID)
TELEGRAM_OWNER_CHAT_ID=<your_telegram_chat_id>
```

---

### 5. Files to Modify/Create

| File | Action |
|------|--------|
| `src/lib/telegram/replies.ts` | Add `channelBlip`, `visitorNotification` templates |
| `src/lib/telegram/formatters.ts` | Add `formatBloq` formatter |
| `src/app/api/blip/route.ts` | Add channel broadcast |
| `src/app/api/bloq/route.ts` | Create new endpoint (POST only) |
| `src/app/api/visit/route.ts` | Add bot notification with rate limiting |

---

## Testing Checklist

- [ ] POST to `/api/blip` broadcasts to @blipbotlive
- [ ] POST to `/api/bloq` broadcasts to @blipbotlive
- [ ] POST to `/api/visit` sends notification to bot owner
- [ ] Rate limiting works (only 1 notification per 24h)
- [ ] Error handling doesn't break main functionality

---

## Notes

- The `/api/visit` endpoint CAN be reused - it already captures visitor data (IP, city, country, etc.)
- No need to create a new endpoint - just extend the existing one
- Bot notifications go to owner (private), channel broadcasts go to public channel
