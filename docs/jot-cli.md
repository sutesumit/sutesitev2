# jot CLI - CLI for Bytes and Blips

A CLI tool for managing bytes (short thoughts) and blips (term:meaning definitions) on sumitsute.com.

## Installation

```bash
cd jotbot
npm install
npm run build
npm link  # Links 'jot' command globally
```

## Configuration

```bash
# Set your API key
jot config set key your-secret-key

# Set custom API URL (optional)
jot config set url https://sumitsute.com/api

# View current config
jot config
```

## Commands

### Quick Start

```bash
jot                          # Show banner + usage help
jot "my thought here"        # Create a new byte (shorthand)
jot a3                       # Get byte by serial
```

### Byte Commands

```bash
jot byte add "content"       # Create a new byte
jot byte ls                  # List all bytes
jot byte get <serial>        # Get a specific byte
jot byte edit <serial> "new content"  # Update a byte
jot byte delete <serial>     # Delete a byte (prompts for confirmation)
jot byte delete <serial> -f  # Force delete (no confirmation)
```

### Blip Commands

```bash
jot blip add "term:meaning"  # Create a new blip
jot blip list                # List all blips
jot blip ls                  # List all blips (alias)
jot blip get <serial>        # Get a specific blip
jot blip edit <serial> "term:new meaning"  # Update a blip
jot blip delete <serial>    # Delete a blip (prompts for confirmation)
jot blip delete <serial> -f  # Force delete (no confirmation)
```

### Aliases

```bash
jot bytes                    # Alias for jot byte ls
jot blips                    # Alias for jot blip ls
jot i                        # Alias for jot interactive
```

### Legacy Commands (still work)

```bash
jot ls --type byte          # List bytes (requires --type)
jot ls --type blip          # List blips (requires --type)
jot get byte <serial>       # Get byte
jot get blip <serial>       # Get blip
jot edit byte <serial> <content>    # Edit byte
jot edit blip <serial> <term:meaning> # Edit blip
jot rm byte <serial>        # Delete byte
jot rm blip <serial>        # Delete blip
```

### Other Commands

```bash
jot interactive              # Interactive mode
jot i                       # Interactive mode (shortcut)
jot --help                  # Show help
jot --version               # Show version
```

## Flags

| Flag | Description |
|------|-------------|
| `--json` | Output as JSON (for list/get commands) |
| `-f, --force` | Skip confirmation (for delete) |
| `-h, --help` | Show help |
| `-V, --version` | Show version |

## Examples

```bash
# Create a byte
jot "Just had a great coffee"

# Create a blip
jot blip add "CORS:Cross-Origin Resource Sharing - browser security feature"

# List all bytes
jot byte ls
jot bytes

# List all blips
jot blip ls
jot blips

# Get a specific byte
jot byte get a3

# Update a byte
jot byte edit a3 "Updated thought here"

# Delete a blip
jot blip delete b2

# Interactive mode
jot i
```

## Interactive Mode

Run `jot i` or `jot interactive` to enter interactive mode with a menu-driven interface for all operations.

## Notes

- Auth uses `K` header for API key
- Byte content max: 280 characters
- Blip format: "term:meaning"
- List and Get don't require auth
- Create, Edit, Delete require the API key
