# Blip CLI Commands

Set up aliases for quick blip operations from terminal.

## Setup

Add to your shell config (`~/.zshrc` or `~/.bashrc`):

```bash
export BLIP_KEY="your-secret-key"
export BLIP_URL="https://sumitsute.com/api/blip"

# Aliases
alias blip='curl -s -H "K: $BLIP_KEY" -d'
alias blips='curl -s $BLIP_URL'
alias blip-get='curl -s $BLIP_URL'
alias blip-edit='curl -s -X PUT -H "K: $BLIP_KEY" -d'
alias blip-del='curl -s -X DELETE -H "K: $BLIP_KEY" $BLIP_URL'
```

Reload: `source ~/.zshrc`

---

## Commands

### Create a blip

```bash
blip "content=Your thought here"
```

Response:
```json
{"blip":{"id":"uuid","content":"Your thought here","blip_serial":"a3","created_at":"2026-03-08T12:00:00Z"}}
```

### List all blips

```bash
blips
```

Response:
```json
{"blips":[{"blip_serial":"a3","content":"Your thought here","created_at":"2026-03-08T12:00:00Z"},...]}
```

### Get a specific blip

```bash
blip-get/a3
```

Response:
```json
{"blip":{"blip_serial":"a3","content":"Your thought here","created_at":"2026-03-08T12:00:00Z"}}
```

### Edit a blip

```bash
blip-edit "content=Updated content" $BLIP_URL/a3
```

Response:
```json
{"blip":{"blip_serial":"a3","content":"Updated content","created_at":"2026-03-08T12:00:00Z"}}
```

### Delete a blip

```bash
blip-del/a3
```

Response:
```json
{"success":true}
```

---

## Raw curl (no aliases)

### Create
```bash
curl -X POST https://sumitsute.com/api/blip \
  -H "K: your-secret-key" \
  -d "content=Your thought here"
```

### List
```bash
curl https://sumitsute.com/api/blip
```

### Get
```bash
curl https://sumitsute.com/api/blip/a3
```

### Edit
```bash
curl -X PUT https://sumitsute.com/api/blip/a3 \
  -H "K: your-secret-key" \
  -d "content=Updated content"
```

### Delete
```bash
curl -X DELETE https://sumitsute.com/api/blip/a3 \
  -H "K: your-secret-key"
```

---

## Notes

- Auth uses `K` header (short) or `X-Key` header (legacy)
- Max content length: 280 characters
- List and Get don't require auth
- Create, Edit, Delete require the key
