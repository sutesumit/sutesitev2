# Plan: Rename CLI to `jot` + Fix Bugs

## Overview

Rename `blipincli` to `jot` while keeping content types as `byte` and `blip`.

---

## Nomenclature Summary

| Element | Old | New |
|---------|-----|-----|
| CLI tool | `blip` | `jot` |
| Package name | `@sutesite/blip-cli` | `@sutesite/jot` |
| Short thoughts | `byte` | `byte` (unchanged) |
| Definitions | `blip` | `blip` (unchanged) |
| Directory | `blipincli/` | `jot/` (or keep blipincli) |

---

## Command Reference

### Default Behavior
```bash
jot                          # List bytes
jot <serial>                 # Get byte by serial
jot "content"                # Create byte (shorthand)
```

### Byte Commands
```bash
jot byte add <content>       # Create byte
jot byte list                # List all bytes
jot byte get <serial>        # Get specific byte
jot byte edit <serial> <content>  # Update byte
jot byte delete <serial>     # Delete byte (prompts confirm)
jot byte delete <serial> -f  # Force delete (no confirm)

# Aliases
jot b add <content>          # = jot byte add
jot b                        # = jot byte list
jot b <serial>               # = jot byte get
jot b edit <serial> <content>
jot b rm <serial>
```

### Blip Commands
```bash
jot blip add "term:meaning"  # Create blip
jot blip list                # List all blips
jot blip get <serial>        # Get specific blip
jot blip edit <serial> "term:meaning"  # Update blip
jot blip delete <serial>     # Delete blip (prompts confirm)
jot blip delete <serial> -f  # Force delete (no confirm)

# Aliases
jot p add "term:meaning"     # = jot blip add (p = pair)
jot p                        # = jot blip list
jot p <serial>               # = jot blip get
jot p edit <serial> "term:meaning"
jot p rm <serial>
```

### Utility Commands
```bash
jot interactive              # Interactive mode
jot i                        # = jot interactive
jot config                   # Show config
jot config set key <value>   # Set API key
jot config set url <value>   # Set API URL
jot --json                   # JSON output (for list/get)
jot --help, -h               # Help
jot --version, -V            # Version
```

---

## Files to Modify

### 1. `blipincli/package.json`
```json
{
  "name": "@sutesite/jot",
  "version": "1.0.0",
  "description": "CLI for managing bytes and blips",
  "bin": {
    "jot": "./dist/index.js"
  }
}
```

### 2. `blipincli/src/lib/config.ts`
```typescript
// Fix line 12
url: {
  type: 'string',
  default: 'https://sumitsute.com/api'  // Was: /api/blip
}

// Fix line 4
const config = new Conf({
  projectName: 'jot',  // Was: 'blip-cli'
})
```

### 3. `blipincli/src/lib/api.ts`
Remove lines 72-101 (dead code):
- `listBlips`
- `getBlip`
- `createBlip`
- `updateBlip`
- `deleteBlip`

### 4. `blipincli/src/lib/ui.ts`
Remove lines 48-114 (dead code):
- `renderBlipBox`
- `renderBlipsTable`

Update ASCII logo (optional - new "JOT" logo):
```
 ██╗ ██████╗ ███████╗
 ██║██╔═══██╗██╔════╝
 ██║██║   ██║███████╗
 ╚═╝╚═╝   ╚═╝╚══════╝
```

### 5. `blipincli/src/index.ts`
Major refactor for new command structure:

```typescript
const program = new Command()
  .name('jot')
  .description('CLI for managing bytes (thoughts) and blips (definitions)')

// Byte commands
program.command('byte')
  .alias('b')
  .description('Manage bytes (short thoughts)')
  // ... subcommands

// Blip commands  
program.command('blip')
  .alias('p')
  .description('Manage blips (term:meaning definitions)')
  // ... subcommands

// Shorthand: jot "content" creates byte
program
  .argument('[args...]')
  .action(handleDefaultCommand)
```

### 6. `docs/blip-cli.md`
Replace entire file with jot documentation.

---

## Implementation Order

### Phase 1: Critical Bug Fix
1. Fix `config.ts` default URL
2. Test: `npm run build && node dist/index.js ls`

### Phase 2: Rename to jot
3. Update `package.json` (name, bin)
4. Update `config.ts` (projectName)
5. Update `index.ts` (program.name, descriptions)
6. Create new ASCII logo for "JOT"

### Phase 3: Command Refactor
7. Add `byte` command with `b` alias
8. Add `blip` command with `p` alias
9. Keep backward-compatible `ls`, `get`, `edit`, `rm` commands
10. Update interactive mode menu text

### Phase 4: Cleanup
11. Remove dead code from `api.ts`
12. Remove dead code from `ui.ts`
13. Update `docs/blip-cli.md`

### Phase 5: Test
14. Build and test all commands
15. Test interactive mode
16. Test config management

---

## Migration Notes

For existing users:
```bash
# Old config location
~/.config/blip-cli-nodejs/config.json

# New config location  
~/.config/jot-nodejs/config.json

# Migration: copy old config or re-run
jot config set key <your-key>
```

---

## Optional: Directory Rename

Consider renaming `blipincli/` to `jot/` for consistency:
- Update any references in root `tsconfig.json` excludes
- Update CI/CD if applicable
- Update internal documentation

---

## Summary of Changes

| File | Change |
|------|--------|
| `package.json` | name → @sutesite/jot, bin → jot |
| `config.ts` | URL fix, projectName → jot |
| `api.ts` | Remove 5 dead functions |
| `ui.ts` | Remove 2 dead functions, new ASCII logo |
| `index.ts` | New command structure with aliases |
| `docs/blip-cli.md` | Full rewrite for jot |
