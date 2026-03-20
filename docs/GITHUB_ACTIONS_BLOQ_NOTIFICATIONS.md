# GitHub Actions Implementation Plan: Bloq Publication Notifications

## Overview

Automatically notify the Telegram channel when a new bloq is published.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  TRIGGER                                                            │
│                                                                     │
│  git push to main                                                   │
│  with changes to src/content/bloqs/**/index.mdx                    │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  GITHUB ACTIONS WORKFLOW                                            │
│                                                                     │
│  1. Checkout repo (fetch-depth: 2 for diff)                        │
│  2. Detect NEW bloq files (not modified)                           │
│  3. Extract frontmatter (title, slug, tags)                        │
│  4. Call API endpoint to broadcast                                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  API ENDPOINT (NEW)                                                 │
│                                                                     │
│  POST /api/telegram/broadcast                                       │
│  - Validates secret header                                          │
│  - Formats message                                                  │
│  - Sends to TELEGRAM_CHANNEL_ID                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  TELEGRAM CHANNEL                                                   │
│                                                                     │
│  📝 The Bot That Talks to My Database                              │
│  <a href="https://sumitsute.com/bloq/...">Read more</a>            │
│  Tags: typescript, backend, nextjs                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Create API Endpoint

**File:** `src/app/api/telegram/broadcast/route.ts`

```typescript
import { NextResponse } from "next/server";
import { initBot } from "@/lib/telegram-bot";
import { replies } from "@/lib/telegram-replies";

const noStoreHeaders = { 'Cache-Control': 'no-store' };

function validateBroadcastSecret(authHeader: string | null): boolean {
  const secret = process.env.TELEGRAM_BOT_TOKEN;
  if (!secret || !authHeader) return false;
  return authHeader === secret;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("X-Broadcast-Secret");
  
  if (!validateBroadcastSecret(authHeader)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: noStoreHeaders }
    );
  }

  try {
    const body = await req.json();
    const { type, title, slug, tags } = body;

    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    if (!channelId) {
      return NextResponse.json(
        { error: "Channel not configured" },
        { status: 500, headers: noStoreHeaders }
      );
    }

    const bot = await initBot();
    
    const message = type === "bloq"
      ? `📝 <b>${title}</b>\n<a href="https://sumitsute.com/bloq/${slug}">Read more</a>\nTags: ${tags}`
      : replies.channelBlip(slug, `${title}`);

    await bot.api.sendMessage(channelId, message, { parse_mode: "HTML" });

    return NextResponse.json(
      { ok: true, broadcast: true },
      { status: 200, headers: noStoreHeaders }
    );
  } catch (error: unknown) {
    console.error("Broadcast error:", error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
```

### Step 2: Create GitHub Actions Workflow

**File:** `.github/workflows/notify-bloq.yml`

```yaml
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

      - name: Detect and notify new bloqs
        env:
          BROADCAST_SECRET: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          BROADCAST_URL: https://sumitsute.com/api/telegram/broadcast
        run: |
          # Get files ADDED (not modified) in this commit
          NEW_BLOQS=$(git diff --name-only --diff-filter=A HEAD^ HEAD -- 'src/content/bloqs/**/index.mdx')
          
          if [ -z "$NEW_BLOQS" ]; then
            echo "No new bloqs detected"
            exit 0
          fi
          
          for bloq in $NEW_BLOQS; do
            echo "Processing: $bloq"
            
            # Extract frontmatter
            TITLE=$(grep '^title:' "$bloq" | head -1 | sed 's/title: *["'"'"']\?//' | sed 's/["'"'"']$//')
            SLUG=$(grep '^slug:' "$bloq" | head -1 | sed 's/slug: *//')
            
            # Extract tags (multi-line)
            TAGS=$(sed -n '/^tags:/,/^[a-z]/p' "$bloq" | grep '  - ' | sed 's/  - //' | tr '\n' ',' | sed 's/,$//')
            
            echo "Title: $TITLE"
            echo "Slug: $SLUG"
            echo "Tags: $TAGS"
            
            # Send notification
            curl -X POST "$BROADCAST_URL" \
              -H "Content-Type: application/json" \
              -H "X-Broadcast-Secret: $BROADCAST_SECRET" \
              -d "{\"type\": \"bloq\", \"title\": \"$TITLE\", \"slug\": \"$SLUG\", \"tags\": \"$TAGS\"}" \
              --fail --silent --show-error
              
            echo "Notification sent for: $TITLE"
          done
```

### Step 3: Add GitHub Secret

In GitHub repository settings:
1. Go to Settings → Secrets and variables → Actions
2. Add `TELEGRAM_BOT_TOKEN` (same as your bot token)

## Security Model

| Component | Auth Method |
|-----------|-------------|
| GitHub Actions → API | `X-Broadcast-Secret` header with bot token |
| API → Telegram | Bot token (already configured) |

The broadcast endpoint uses the bot token as a shared secret between GitHub Actions and your server.

## Testing

**Local test:**
```bash
curl -X POST http://localhost:3000/api/telegram/broadcast \
  -H "Content-Type: application/json" \
  -H "X-Broadcast-Secret: YOUR_BOT_TOKEN" \
  -d '{"type": "bloq", "title": "Test Bloq", "slug": "test-bloq", "tags": "test"}'
```

**Workflow test:**
1. Create a new bloq in `src/content/bloqs/YYYY/YYYY-MM-DD-slug/index.mdx`
2. Push to main
3. Check GitHub Actions logs
4. Verify message appears in Telegram channel

## File Structure

```
.github/
└── workflows/
    └── notify-bloq.yml          # GitHub Actions workflow

src/
└── app/
    └── api/
        └── telegram/
            ├── webhook/
            │   └── route.ts     # Existing webhook endpoint
            └── broadcast/
                └── route.ts     # NEW: Broadcast endpoint
```

## Message Format

```
📝 The Bot That Talks to My Database
<a href="https://sumitsute.com/bloq/build-telegram-bot-interface-nextjs-database">Read more</a>
Tags: typescript, backend, nextjs, architecture
```

## Notes

- Only triggers on **new** bloqs (diff-filter=A), not updates
- Uses `fetch-depth: 2` to compare with previous commit
- Fails silently if channel not configured
- Logs all notifications for debugging

## Future Enhancements

1. **Draft detection**: Skip if `draft: true` in frontmatter
2. **Scheduled posts**: Support `publishedAt` in future
3. **Image support**: Include bloq image in notification
4. **Retry logic**: Handle transient API failures
