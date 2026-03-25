# Plan: jotbot CLI - Require Explicit Type + Updated Docs

## Overview

Make `jot` commands require explicit `byte` or `blip` type specification, improve usage help, and update documentation.

## Changes Summary

| Change | File | Description |
|--------|------|-------------|
| 1. Require explicit type for ls | `jotbot/src/index.ts` | Remove default to byte for `jot ls` |
| 2. Add `bytes` / `blips` aliases | `jotbot/src/index.ts` | Shorthand for listing |
| 3. Improve usage help | `jotbot/src/index.ts` | Better help text on `jot` |
| 4. Update docs/jot-cli.md | `docs/jot-cli.md` | Complete rewrite with all commands |

---

## Step 1: Require Explicit Type for `ls` Command

### Current Behavior
```bash
jot ls           # Lists BYTES (default)
jot ls -t blip   # Lists BLIPS
```

### New Behavior
```bash
jot ls              # ERROR: specify type
jot byte ls        # List BYTES
jot blip ls        # List BLIPS
jot bytes          # Alias for jot byte ls
jot blips          # Alias for jot blip ls
```

In `jotbot/src/index.ts`, modify the `ls` command to require explicit type and add `bytes`/`blips` aliases.

---

## Step 2: Improve Usage Help

### New Output for `jot` (no args)
```
  Usage:
    jot "your thought"           # Create a byte
    jot <serial>                 # Get a byte
    jot byte ls                  # List all bytes
    jot byte get <serial>        # Get a byte
    jot byte edit <serial> "new" # Edit a byte
    jot byte rm <serial>         # Delete a byte

    jot blip add "term:meaning"  # Create a blip
    jot blip ls                  # List all blips
    jot blip get <serial>        # Get a blip
    jot blip edit <serial> "term:meaning" # Edit a blip
    jot blip rm <serial>         # Delete a blip

    jot i                        # Interactive mode
    jot config                   # View/set config
    jot -h, jot --help           # Full help
    jot -v, jot --version        # Version
```

Update `handleDefaultCommand` in `jotbot/src/index.ts` to show this improved help.

---

## Step 3: Update Documentation

Update `docs/jot-cli.md` with complete command reference:

```
BYTE COMMANDS
jot "thought"              Create byte (shorthand)
jot byte add <content>     Create byte
jot byte ls                List all bytes
jot byte get <serial>      Get byte by serial
jot byte edit <serial> <content>  Edit byte
jot byte rm <serial>       Delete byte (prompts)
jot byte rm -f <serial>    Delete byte (force)

BLIP COMMANDS
jot blip add "term:meaning"  Create blip
jot blip ls                  List all blips
jot blip get <serial>        Get blip by serial
jot blip edit <serial> "term:meaning"  Edit blip
jot blip rm <serial>         Delete blip (prompts)
jot blip rm -f <serial>      Delete blip (force)

ALIASES
jot bytes                    Alias for jot byte ls
jot blips                    Alias for jot blip ls
jot i                        Alias for jot interactive

CONFIG
jot config                   Show config
jot config set key <value>  Set API key
jot config set url <value>   Set API URL

FLAGS
--json    Output as JSON
-h, --help Show help
-V, --version  Show version
-f, --force  Skip confirmation (delete)
```

---

## Implementation Order

1. Update `jotbot/src/index.ts` - Modify ls command to require type
2. Add `bytes` and `blips` alias commands
3. Update usage help text
4. Rebuild: `cd jotbot && npm run build`
5. Test all commands
6. Update `docs/jot-cli.md`

---

## Testing Checklist

```bash
# Help
jot
jot --help

# Bytes
jot "test byte"
jot byte ls
jot bytes
jot byte get a3
jot byte edit a3 "new content"
jot byte rm a3
jot byte rm -f a3

# Blips
jot blip add "test:definition"
jot blip ls
jot blips
jot blip get 1
jot blip edit 1 "test:new def"
jot blip rm 1
jot blip rm -f 1

# Config
jot config
jot config set key <value>

# Other
jot i
jot --version
```