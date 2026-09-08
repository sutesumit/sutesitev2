# Plan: Telegram Bot & CLI - Support for Both Bytes and Blips

## Executive Summary

This document outlines the implementation plan to update the Telegram bot and CLI tool to support both **bytes** (short thoughts) and **blips** (blip terms). Additionally, all references to "blip" for short thoughts will be renamed to "byte" for consistency.

---

## Current State

### Terminology Confusion

| Concept | Old Name | New Name |
|---------|----------|----------|
| Short thoughts (280 chars) | blip | byte |
| Glossary terms (term:meaning) | (none) | blip |

### Existing Components

1. **Database Tables:**
   - `bytes` - stores short thoughts (was previously "blips")
   - `blips` - stores blip terms with term/meaning/tags

2. **Telegram Bot** (`src/lib/telegram/`):
   - `bot.ts` - Bot initialization with commands
   - `handlers.ts` - Command handlers (create, list, get, edit, delete)
   - `replies.ts` - Reply messages
   - `repository.ts` - Database operations (currently only bytes)
   - `formatters.ts` - Message formatters

3. **CLI Tool** (`blipincli/`):
   - `src/index.ts` - Main CLI entry point
   - `src/commands/new.ts` - Create command
   - `src/lib/api.ts` - API client (calls `/api/blip`)

4. **API Routes:**
   - `/api/byte` - GET/POST for bytes (exists)
   - `/api/blip` - Not yet implemented

5. **UI Pages:**
   - `/byte` - Bytes page (already exists)
   - `/blip` - Glossary page (just implemented with modal)

---

## Goals

1. **Rename**: Change all "blip" references for short thoughts to "byte"
2. **Dual Support**: Both Telegram bot and CLI support creating bytes AND blips
3. **Explicit Commands**: Users must specify type explicitly (byte or blip)
4. **Consistency**: Same syntax for both Telegram and CLI

---

## Design Decisions

### Explicit Command Syntax

#### Telegram Commands

| Command | Type | Example |
|---------|------|---------|
| `/byte <text>` | byte | `/byte Just had amazing coffee` |
| `/blip <text>` | blip | `/blip webhook: A mechanism for receiving...` |
| `/list byte` | list bytes | `/list byte` |
| `/list blip` | list blips | `/list blip` |
| `/get byte <serial>` | get byte | `/get byte a1b2` |
| `/get blip <serial>` | get blip | `/get blip c3d4` |
| `/edit byte <serial> <text>` | edit byte | `/edit byte a1b2 new content` |
| `/edit blip <serial> <text>` | edit blip | `/edit blip c3d4 new meaning` |
| `/del byte <serial>` | delete byte | `/del byte a1b2` |
| `/del blip <serial>` | delete blip | `/del blip c3d4` |

#### CLI Commands

| Command | Type | Example |
|---------|------|---------|
| `byte add "<text>"` | byte | `byte add "Just had amazing coffee"` |
| `blip add "<term: meaning>"` | blip | `blip add "webhook: A mechanism for receiving..."` |
| `ls byte` | list bytes | `ls byte` |
| `ls blip` | list blips | `ls blip` |
| `get byte <serial>` | get byte | `get byte a1b2` |
| `get blip <serial>` | get blip | `get blip c3d4` |
| `edit byte <serial> <text>` | edit byte | `edit byte a1b2 new content` |
| `edit blip <serial> <text>` | edit blip | `edit blip c3d4 new meaning` |
| `rm byte <serial>` | delete byte | `rm byte a1b2` |
| `rm blip <serial>` | delete blip | `rm blip c3d4` |

---

## Implementation Plan

### Phase 1: Create API Route for Blips

**File:** `src/app/api/blip/route.ts`

Create a new API route to handle blips (term/meaning format).

```
POST /api/blip
  Body: { term, meaning }
  Auth: API key (K header)
  Response: { blip: { id, blip_serial, term, meaning, created_at, updated_at } }

GET /api/blip
  Response: { blips: [...] }
```

### Phase 2: Update Telegram Bot

#### 2.1 Update Repository (`src/lib/telegram/repository.ts`)

Add functions for blip blips:
- `createBlipGlossary(term, meaning)` - Create blip entry
- `getBlipsGlossary(limit)` - Get recent blip entries

#### 2.2 Update Bot Commands (`src/lib/telegram/bot.ts`)

Update command list:

```typescript
const BOT_COMMANDS = [
  { command: "start", description: "Show help" },
  { command: "byte", description: "Create a byte (short thought)" },
  { command: "blip", description: "Create a blip (term:meaning)" },
  { command: "list", description: "List bytes or blips" },
  { command: "get", description: "Get a byte or blip" },
  { command: "edit", description: "Edit a byte or blip" },
  { command: "del", description: "Delete a byte or blip" },
] as const;
```

#### 2.3 Update Handlers (`src/lib/telegram/commands/handlers.ts`)

Add new handlers for explicit type specification:

- `handleByte` - Create a byte: `/byte <text>`
- `handleBlip` - Create a blip: `/blip <term: meaning>`
- `handleList` - Updated to require type: `/list byte` or `/list blip`
- `handleGet` - Updated to require type: `/get byte <serial>` or `/get blip <serial>`
- `handleEdit` - Updated to require type: `/edit byte <serial> <text>` or `/edit blip <serial> <text>`
- `handleDel` - Updated to require type: `/del byte <serial>` or `/del blip <serial>`

```typescript
// Example handler signatures
export async function handleByte(ctx: Context): Promise<void> {
  // Parse: /byte <text>
  // Create byte
}

export async function handleBlip(ctx: Context): Promise<void> {
  // Parse: /blip <term: meaning>
  // Parse term and meaning from content after /blip
  // Create blip (blip)
}

export async function handleList(ctx: Context): Promise<void> {
  // Parse: /list bytes or /list blips
  // List appropriate type
}

export async function handleGet(ctx: Context): Promise<void> {
  // Parse: /get byte <serial> or /get blip <serial>
  // Get specific type
}

export async function handleEdit(ctx: Context): Promise<void> {
  // Parse: /edit byte <serial> <text> or /edit blip <serial> <text>
  // Edit appropriate type
}

export async function handleDel(ctx: Context): Promise<void> {
  // Parse: /del byte <serial> or /del blip <serial>
  // Delete appropriate type
}

#### 2.4 Update Replies (`src/lib/telegram/replies.ts`)

Add new reply messages:
- `byteCreated` - New message for byte creation
- `byteNotFound` - For byte lookups
- Update `blipCreated` to clarify it's a blip entry

Update help text in `startIntro`:
- Explain both `/byte` and `/blip` commands
- Show syntax examples for each
- Remove subscribe references

#### 2.5 Update Bot Commands (`src/lib/telegram/bot.ts`)

Register new commands:
- `/byte` - Create a byte
- `/blip` - Create a blip blip

Update existing commands to require type specification:
- `/list bytes` or `/list blips`
- `/get byte <serial>` or `/get blip <serial>`
- `/edit byte <serial> <text>` or `/edit blip <serial> <text>`
- `/del byte <serial>` or `/del blip <serial>`

#### 2.6 Update Formatters (`src/lib/telegram/formatters.ts`)

Add:
- `formatByteGlossary(blip)` - Format blip entry for display

### Phase 3: Update CLI Tool

#### 3.1 Update API Client (`blipincli/src/lib/api.ts`)

Add new API functions:
- `createByte(content)` - Create short thought → POST `/api/byte`
- `createBlipGlossary(term, meaning)` - Create blip entry → POST `/api/blip`
- `listBytes()` - List bytes → GET `/api/byte`
- `listBlipsGlossary()` - List blip → GET `/api/blip`
- `getByte(serial)` - Get byte → GET `/api/byte/{serial}`
- `getBlipGlossary(serial)` - Get blip → GET `/api/blip/{serial}`
- `updateByte(serial, content)` - Edit byte → PUT `/api/byte/{serial}`
- `updateBlipGlossary(serial, term, meaning)` - Edit blip → PUT `/api/blip/{serial}`
- `deleteByte(serial)` - Delete byte → DELETE `/api/byte/{serial}`
- `deleteBlipGlossary(serial)` - Delete blip → DELETE `/api/blip/{serial}`

#### 3.2 Update Main CLI (`blipincli/src/index.ts`)

Update command structure - "blip" is the main command, but subcommands don't repeat "blip":

```typescript
// Main command is 'blip'
// Subcommands:

// Byte commands (no 'blip' prefix needed)
program
  .command('byte')
  .description('Manage bytes (short thoughts)')

program
  .command('byte add <content...>')
  .description('Create a new byte')
  .action(async (contentParts: string[]) => {
    await createCommand(contentParts.join(' '), 'byte');
  });

// Blip commands (blip is the main entry point)
program
  .command('blip add <content...>')
  .description('Create a new blip')
  .action(async (contentParts: string[]) => {
    await createCommand(contentParts.join(' '), 'blip');
  });

// Generic commands with type
program
  .command('ls')
  .description('List bytes or blips')
  .argument('[type]', 'byte or blip')
  .action(async (type: string = 'byte') => {
    await listCommand(type);
  });

program
  .command('get')
  .description('Get a byte or blip')
  .argument('<type>', 'byte or blip')
  .argument('<serial>', 'serial number')
  .action(async (type: string, serial: string) => {
    await getCommand(serial, type as 'byte' | 'blip');
  });

program
  .command('edit')
  .description('Edit a byte or blip')
  .argument('<type>', 'byte or blip')
  .argument('<serial>', 'serial number')
  .argument('<content...>', 'new content')
  .action(async (type: string, serial: string, contentParts: string[]) => {
    await editCommand(serial, contentParts.join(' '), type as 'byte' | 'blip');
  });

program
  .command('rm')
  .description('Delete a byte or blip')
  .argument('<type>', 'byte or blip')
  .argument('<serial>', 'serial number')
  .action(async (type: string, serial: string) => {
    await deleteCommand(serial, type as 'byte' | 'blip');
  });
```

#### 3.3 Update Command Files

Update each command file to accept type parameter:
- `new.ts` - Add `type: 'byte' | 'blip'` parameter
- `list.ts` - Add `type: 'bytes' | 'blips'` parameter
- `get.ts` - Add `type: 'byte' | 'blip'` parameter
- `edit.ts` - Add `type: 'byte' | 'blip'` parameter
- `delete.ts` - Add `type: 'byte' | 'blip'` parameter

### Phase 4: Rename "blip" to "byte" Everywhere

#### 4.1 Telegram Bot Replies

Update all reply messages:
- "blip" → "byte" for short thoughts
- Keep "blip" for blip terms
- Add clarity in help text

#### 4.2 CLI Help Text

Update all CLI descriptions:
- "blip" → "byte" where referring to short thoughts
- "blip" or "blip" for blip terms

#### 4.3 UI Text (if needed)

Check `/byte` page already uses "bytes" - verified ✓

### Phase 5: Create First Blip

Insert webhook definition into database:

```sql
INSERT INTO blips (term, meaning)
VALUES (
  'webhook',
  'A mechanism for receiving real-time HTTP notifications from a server, typically used in integrations and APIs to push data to applications without polling.'
);
```

Or via API once implemented.

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/app/api/blip/route.ts` | API route for blip blips |
| `src/lib/telegram/formatters.ts` | Add blip formatter (if needed) |

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/telegram/bot.ts` | Update command list with explicit types |
| `src/lib/telegram/repository.ts` | Add blip/blip functions |
| `src/lib/telegram/commands/handlers.ts` | Add type-specific handlers |
| `src/lib/telegram/replies.ts` | Add byte/blip specific messages |
| `src/app/api/blip/route.ts` (new) | API route for blip blips |
| `blipincli/src/lib/api.ts` | Add byte and blip API functions |
| `blipincli/src/commands/new.ts` | Add type parameter |
| `blipincli/src/commands/list.ts` | Add type parameter |
| `blipincli/src/commands/get.ts` | Add type parameter |
| `blipincli/src/commands/edit.ts` | Add type parameter |
| `blipincli/src/commands/delete.ts` | Add type parameter |
| `blipincli/src/index.ts` | Update command structure |

### Database

| Action | SQL |
|--------|-----|
| Insert webhook | `INSERT INTO blips ...` |

---

## User Experience

### Telegram

**Creating bytes:**
```
User: /byte Just had amazing coffee
Bot: Byte a1b2 is born!
```

**Creating blips (blip):**
```
User: /blip webhook: A mechanism for receiving real-time HTTP notifications
Bot: Blip c3d4 is born! (blip entry)
```

**Listing:**
```
User: /list byte
Bot: [Shows recent bytes]

User: /list blip
Bot: [Shows recent blips]
```

**Getting:**
```
User: /get byte a1b2
Bot: [Shows byte a1b2 content]

User: /get blip c3d4
Bot: [Shows blip c3d4 term and meaning]
```

**Editing:**
```
User: /edit byte a1b2 Actually it was great coffee
Bot: Byte a1b2 updated!

User: /edit blip c3d4 A mechanism for receiving HTTP callbacks in real-time
Bot: Blip c3d4 updated!
```

**Deleting:**
```
User: /del byte a1b2
Bot: Byte a1b2 deleted!

User: /del blip c3d4
Bot: Blip c3d4 deleted!
```

### CLI

**Creating bytes:**
```
$ byte add "Just had amazing coffee"
Created byte a1b2

$ byte "Just had amazing coffee"
Created byte a1b2
```

**Creating blips (blip):**
```
$ blip add "webhook: A mechanism for receiving..."
Created blip c3d4 (blip)

$ blip "webhook: A mechanism..."
Created blip c3d4 (blip)
```

**Listing:**
```
$ ls byte
[Shows recent bytes]

$ ls blip
[Shows recent blips]
```

**Getting:**
```
$ get byte a1b2
[Shows byte a1b2 content]

$ get blip c3d4
[Shows blip c3d4 term and meaning]
```

---

## Backwards Compatibility

- Existing serial numbers for bytes remain unchanged
- Old API endpoints continue to work
- Users can still use explicit commands if needed

---

## Testing Checklist

- [ ] Create byte via Telegram (`/byte some thought`)
- [ ] Create blip via Telegram (`/blip term: meaning`)
- [ ] List bytes via Telegram (`/list byte`)
- [ ] List blips via Telegram (`/list blip`)
- [ ] Get specific byte via Telegram (`/get byte serial`)
- [ ] Get specific blip via Telegram (`/get blip serial`)
- [ ] Edit byte via Telegram (`/edit byte serial new content`)
- [ ] Edit blip via Telegram (`/edit blip serial new meaning`)
- [ ] Delete byte via Telegram (`/del byte serial`)
- [ ] Delete blip via Telegram (`/del blip serial`)
- [ ] Create byte via CLI (`byte add "text"`)
- [ ] Create blip via CLI (`blip add "term: meaning"`)
- [ ] List bytes via CLI (`ls byte`)
- [ ] List blips via CLI (`ls blip`)
- [ ] Get byte via CLI (`get byte serial`)
- [ ] Get blip via CLI (`get blip serial`)
- [ ] Edit byte via CLI (`edit byte serial new content`)
- [ ] Edit blip via CLI (`edit blip serial new meaning`)
- [ ] Delete byte via CLI (`rm byte serial`)
- [ ] Delete blip via CLI (`rm blip serial`)
- [ ] Verify webhook blip exists in database

---

## User Documentation (To Be Created)

### Telegram Bot Usage

Create and manage **bytes** (short thoughts) and **blips** (term:meaning entries) directly from Telegram.

#### Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Show help and usage guide | `/start` |
| `/byte <text>` | Create a new byte (short thought) | `/byte Just had amazing coffee` |
| `/blip <term: meaning>` | Create a new blip | `/blip webhook: A mechanism for receiving HTTP callbacks` |
| `/list byte` | List recent bytes | `/list byte` |
| `/list blip` | List recent blips | `/list blip` |
| `/get byte <serial>` | Get a specific byte | `/get byte a1b2` |
| `/get blip <serial>` | Get a specific blip | `/get blip c3d4` |
| `/edit byte <serial> <text>` | Edit a byte | `/edit byte a1b2 new content` |
| `/edit blip <serial> <text>` | Edit a blip | `/edit blip c3d4 new meaning` |
| `/del byte <serial>` | Delete a byte | `/del byte a1b2` |
| `/del blip <serial>` | Delete a blip | `/del blip c3d4` |

#### Creating Content

**Bytes** are short thoughts (max 280 characters):
```
User: /byte Just had the best coffee today
Bot: Byte a1b2 is born!
```

**Blips** are term:meaning pairs:
```
User: /blip webhook: A mechanism for receiving real-time HTTP notifications from a server
Bot: Blip c3d4 is born!
```

#### Getting Content

```
User: /list byte
Bot: a1b2. Just had the best coffee today
     a1b1. Working on a new project

User: /get blip c3d4
Bot: c3d4. webhook
     A mechanism for receiving real-time HTTP notifications from a server
```

---

### CLI Usage

The CLI tool allows you to manage bytes and blips from your terminal.

#### Installation

```bash
# Build the CLI
cd blipincli
npm install
npm run build

# Link globally
npm link
```

#### Commands

| Command | Description | Example |
|---------|-------------|---------|
| `byte add "<text>"` | Create a new byte | `byte add "Just had amazing coffee"` |
| `blip add "<term: meaning>"` | Create a new blip | `blip add "webhook: A mechanism for HTTP callbacks"` |
| `ls byte` | List recent bytes | `ls byte` |
| `ls blip` | List recent blips | `ls blip` |
| `get byte <serial>` | Get a specific byte | `get byte a1b2` |
| `get blip <serial>` | Get a specific blip | `get blip c3d4` |
| `edit byte <serial> <text>` | Edit a byte | `edit byte a1b2 new content` |
| `edit blip <serial> <text>` | Edit a blip | `edit blip c3d4 new meaning` |
| `rm byte <serial>` | Delete a byte | `rm byte a1b2` |
| `rm blip <serial>` | Delete a blip | `rm blip c3d4` |

#### Configuration

Set your API key:
```bash
blip config set key <your-api-key>
```

View configuration:
```bash
blip config list
```

#### Examples

**Create a byte:**
```bash
$ byte add "Just shipped a new feature"
Created byte a1b2
```

**Create a blip:**
```bash
$ blip add "webhook: A mechanism for receiving real-time HTTP notifications"
Created blip c3d4
```

**List content:**
```bash
$ ls byte
# Recent bytes...
$ ls blip
# Recent blips...
```

**Get specific entry:**
```bash
$ get byte a1b2
a1b2 │ Just shipped a new feature │ 2 hours ago

$ get blip c3d4
c3d4 │ webhook
      │ A mechanism for receiving real-time HTTP notifications
      │ 1 day ago
```

---

## Estimated Effort

| Phase | Files | Complexity |
|-------|-------|------------|
| Phase 1: API Route | 1 | Low |
| Phase 2: Telegram Bot | 4 | Medium |
| Phase 3: CLI | 3 | Medium |
| Phase 4: Rename | 2 | Low |
| Phase 5: Insert Data | 1 | Low |
| **Total** | **~11** | **Medium** |

---

## Open Questions

1. Should we add serial prefix to distinguish bytes from blips in the database (e.g., `b1a2` vs `g1a2`)? Currently they share the same serial namespace but are distinguished by the command used.

---

*Plan created: March 2026*
*For implementation, proceed with the above phases in order.*
