# Fix Telegram Channel Notifications - Complete Plan

## Overview
Fix missing channel notifications for `/byte` and `/blip` Telegram bot commands, add automated tests, update documentation, and deploy.

---

## Phase 1: Git Setup

### 1.1 Create Feature Branch
```bash
git checkout -b fix/telegram-channel-notifications
```

---

## Phase 2: Code Changes

### 2.1 Update `src/lib/telegram/commands/handlers.ts`

#### A. `handleByte` function (lines 17-41)
**Change signature:**
```typescript
// Before
export async function handleByte(ctx: Context): Promise<void>

// After  
export async function handleByte(ctx: Context, bot: Bot<Context>): Promise<void>
```

**Add channel broadcast after line 37:**
```typescript
const channelId = process.env.TELEGRAM_CHANNEL_ID;
if (channelId) {
  try {
    await bot.api.sendMessage(
      channelId,
      replies.channelBlip(byte.byte_serial, byte.content),
      { parse_mode: "HTML" }
    );
  } catch (broadcastError) {
    console.error("Failed to broadcast to channel:", broadcastError);
  }
}
```

#### B. `handleBlip` function (lines 43-82)
**Change signature:**
```typescript
// Before
export async function handleBlip(ctx: Context): Promise<void>

// After
export async function handleBlip(ctx: Context, bot: Bot<Context>): Promise<void>
```

**Add channel broadcast after line 78:**
```typescript
const channelId = process.env.TELEGRAM_CHANNEL_ID;
if (channelId) {
  try {
    await bot.api.sendMessage(
      channelId,
      replies.channelBlip(blip.blip_serial, `${blip.term}: ${blip.meaning}`),
      { parse_mode: "HTML" }
    );
  } catch (broadcastError) {
    console.error("Failed to broadcast to channel:", broadcastError);
  }
}
```

### 2.2 Update `src/lib/telegram/bot.ts`

**Update command handler calls (lines 36-37):**
```typescript
// Before
botInstance.command("byte", handleByte);
botInstance.command("blip", handleBlip);

// After
botInstance.command("byte", (ctx) => handleByte(ctx, botInstance!));
botInstance.command("blip", (ctx) => handleBlip(ctx, botInstance!));
```

---

## Phase 3: Automated Tests

### 3.1 Create `src/lib/telegram/__tests__/handlers.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleByte, handleBlip } from '../commands/handlers';
import * as repository from '../repository';

vi.mock('../repository', () => ({
  createByte: vi.fn(),
  createBlip: vi.fn(),
}));

describe('handleByte', () => {
  let mockCtx: any;
  let mockBot: any;

  beforeEach(() => {
    vi.stubEnv('TELEGRAM_CHANNEL_ID', '@testchannel');
    
    mockCtx = {
      from: { id: 123 },
      match: 'test byte content',
      reply: vi.fn(),
    };
    
    mockBot = {
      api: {
        sendMessage: vi.fn(),
      },
    };
    
    vi.mocked(repository.createByte).mockResolvedValue({
      id: '1',
      byte_serial: '001',
      content: 'test byte content',
      created_at: '2026-03-18T00:00:00Z',
    });
  });

  it('should broadcast to channel when byte is created', async () => {
    await handleByte(mockCtx, mockBot);
    
    expect(mockBot.api.sendMessage).toHaveBeenCalledWith(
      '@testchannel',
      expect.stringContaining('001'),
      { parse_mode: 'HTML' }
    );
  });

  it('should not broadcast if TELEGRAM_CHANNEL_ID is not set', async () => {
    vi.stubEnv('TELEGRAM_CHANNEL_ID', '');
    
    await handleByte(mockCtx, mockBot);
    
    expect(mockBot.api.sendMessage).not.toHaveBeenCalled();
  });

  it('should handle broadcast errors gracefully', async () => {
    mockBot.api.sendMessage.mockRejectedValue(new Error('API Error'));
    
    await expect(handleByte(mockCtx, mockBot)).resolves.not.toThrow();
    expect(mockCtx.reply).toHaveBeenCalled();
  });
});

describe('handleBlip', () => {
  let mockCtx: any;
  let mockBot: any;

  beforeEach(() => {
    vi.stubEnv('TELEGRAM_CHANNEL_ID', '@testchannel');
    
    mockCtx = {
      from: { id: 123 },
      match: 'term:meaning',
      reply: vi.fn(),
    };
    
    mockBot = {
      api: {
        sendMessage: vi.fn(),
      },
    };
    
    vi.mocked(repository.createBlip).mockResolvedValue({
      id: '1',
      blip_serial: '001',
      term: 'term',
      meaning: 'meaning',
      tags: [],
      created_at: '2026-03-18T00:00:00Z',
      updated_at: '2026-03-18T00:00:00Z',
    });
  });

  it('should broadcast to channel when blip is created', async () => {
    await handleBlip(mockCtx, mockBot);
    
    expect(mockBot.api.sendMessage).toHaveBeenCalledWith(
      '@testchannel',
      expect.stringContaining('001'),
      { parse_mode: 'HTML' }
    );
  });

  it('should include term and meaning in broadcast', async () => {
    await handleBlip(mockCtx, mockBot);
    
    expect(mockBot.api.sendMessage).toHaveBeenCalledWith(
      '@testchannel',
      expect.stringContaining('term: meaning'),
      { parse_mode: 'HTML' }
    );
  });

  it('should not broadcast if TELEGRAM_CHANNEL_ID is not set', async () => {
    vi.stubEnv('TELEGRAM_CHANNEL_ID', '');
    
    await handleBlip(mockCtx, mockBot);
    
    expect(mockBot.api.sendMessage).not.toHaveBeenCalled();
  });
});
```

### 3.2 Run Tests
```bash
npm test -- handlers
```

---

## Phase 4: Verification

### 4.1 Run Lint
```bash
npm run lint
```

### 4.2 Run All Tests
```bash
npm test
```

### 4.3 Manual Testing Checklist
- [ ] Send `/byte test content` in Telegram → Verify message in @BlipBotLive channel
- [ ] Send `/blip term:meaning` in Telegram → Verify message in channel
- [ ] Send plain message in Telegram → Verify still works (existing functionality)
- [ ] Create byte via API → Verify still works
- [ ] Create blip via API → Verify still works

---

## Phase 5: Documentation Update

### 5.1 Update `docs/TELEGRAM_NOTIFICATIONS_TECHNICAL_REPORT.md`

#### A. Update Notification Types section (after line 24)
Add new notification type:
```markdown
- **Byte Channel Broadcasts**: Notifies subscribers when a new byte (short thought) is created
```

#### B. Update Architecture diagram (lines 62-101)
- Add `/api/byte` to API LAYER
- Add byte route to file structure

#### C. Add new section before "Blip Creation Flow" (around line 440)
```markdown
### Byte Creation Flow

**Trigger**: When a byte is created via POST `/api/byte` or Telegram `/byte` command

**Flow**:
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

**Message Format**:
```
🤖: <a href="https://www.sumitsute.com/byte/001">Short thought content here</a>
```
```

#### D. Update "Related Environment Variables" table (line 774-779)
Add:
```markdown
| `BLIP_SECRET_KEY` | blip/byte routes | API key for blip/byte publishing |
```

#### E. Update "Database Tables" (line 781-787)
Add:
```markdown
| `bytes` | /api/byte | Byte storage |
```

#### F. Add changelog section before "Last Updated"
```markdown
---

## Changelog

### March 2026
- **Fixed**: Channel broadcast for `/byte` and `/blip` Telegram bot commands
- **Added**: Byte notification type documentation
- **Added**: Automated tests for handler channel broadcasts
- **Updated**: Architecture diagram to include byte route
```

#### G. Update "Last Updated" date

---

## Phase 6: Git Workflow

### 6.1 Commit Changes
```bash
git add src/lib/telegram/commands/handlers.ts src/lib/telegram/bot.ts src/lib/telegram/__tests__/handlers.test.ts docs/TELEGRAM_NOTIFICATIONS_TECHNICAL_REPORT.md
git commit -m "fix: add channel broadcast to /byte and /blip bot commands

- Pass bot instance to handleByte and handleBlip handlers
- Add channel notification logic matching handleMessage pattern
- Add automated tests for channel broadcast functionality
- Update documentation with byte notification flow and changelog

Fixes issue where bot commands created content but didn't broadcast to channel"
```

### 6.2 Merge to Main
```bash
git checkout main
git merge fix/telegram-channel-notifications --no-ff
```

### 6.3 Push to Live
```bash
git push origin main
```

### 6.4 Cleanup (optional)
```bash
git branch -d fix/telegram-channel-notifications
```

---

## Summary

| Phase | Action | Files |
|-------|--------|-------|
| 1 | Create branch | - |
| 2 | Code changes | `handlers.ts`, `bot.ts` |
| 3 | Write tests | `handlers.test.ts` (new) |
| 4 | Verify | Lint + Tests + Manual |
| 5 | Update docs | `TELEGRAM_NOTIFICATIONS_TECHNICAL_REPORT.md` |
| 6 | Merge & push | - |

---

## Test Coverage Added

| Handler | Tests |
|---------|-------|
| `handleByte` | Broadcast on success, skip if no channel ID, handle errors |
| `handleBlip` | Broadcast on success, include term:meaning, skip if no channel ID |
