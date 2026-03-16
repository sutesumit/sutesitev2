# Migration Plan: Blip to Byte & New Blip Glossary (v3)

This document outlines the end-to-end migration to rename existing "blips" (micro-posts) to "bytes" and repurpose the "blip" namespace for a new dictionary feature.

---

## 1. Database Migration Strategy (Supabase)

### Phase 1: Rename Existing Entities (Blip -> Byte)
*   **Tables:** `blips` → `bytes`, `blip_views` → `byte_views`.
*   **Columns:** `blip_serial` → `byte_serial`.
*   **Logic:** Update `generate_byte_serial()` (formerly `generate_blip_serial`) and associated triggers.

### Phase 2: Create New Glossary Entities (The New Blip)
*   **Table: `public.blips`**
    - `id`: UUID (Primary Key).
    - `blip_serial`: TEXT (Unique, Base-62 human-readable ID).
    - `term`: TEXT (The word or phrase being defined).
    - `meaning`: TEXT (The definition/value).
    - `tags`: JSONB (A JSON array of strings, e.g., `["web3", "db"]`. Default: `[]`).
    - `created_at`, `updated_at`: TIMESTAMPTZ.
*   **Key Design:** 
    - We will use a **Base-62 Serial** (`blip_serial`) for CLI/URL identification.
    - Example: `blip get 5` (gets the dictionary entry with serial '5').

---

## 2. UI & Frontend Migration (Next.js)

### Phase 1: Global Renaming (The "Byte" Shift)
*   **Components:** Rename `BlipCard` → `ByteCard`, `BlipFeed` → `ByteFeed`, etc.
*   **Pages:** Move `src/app/blip/[serial]/` → `src/app/byte/[serial]/`.
*   **Styles:** Update any CSS classes or Tailwind patterns using `blip-` prefixes to `byte-`.
*   **Copywriting:** Update all public-facing text from "Blips" to "Bytes".

### Phase 2: New Glossary UI
*   **New Section:** Create `/blip` (the Glossary index) and `/blip/[serial]` (the detailed entry).
*   **Aesthetics:** A clean, typography-focused "Dictionary" layout.

---

## 3. API & Integration Update

### Phase 1: API Route Refactoring
*   **Bytes:** `/api/blip` → `/api/byte`.
*   **Blips:** New `/api/blip` endpoints for dictionary CRUD.

### Phase 2: CLI Tool (`blipincli`)
*   **Commands:**
    - `byte new`: Prompts for micro-post content.
    - `blip add`: Prompts for `Term` and `Meaning`. 
    - **Note:** `tags` will be automatically initialized as `[]` in the DB.

### Phase 3: Telegram Bot
*   **Command Logic:**
    - `/byte <content>`: Creates a new micro-post.
    - `/blip <term> | <meaning>`: Creates a dictionary entry using a pipe delimiter.
*   **Automation:** Future background process to generate tags based on `term` and `meaning`.

---

## 4. Execution Roadmap

1.  **SQL Migration:** Rename tables, update serial functions, create new `blips` table.
2.  **UI Renaming:** Run a batch refactor for `Blip` → `Byte` in components and routes.
3.  **API Implementation:** Set up the new dual-API structure.
4.  **Integration Update:** Update `blipincli` and the Telegram bot.
5.  **Verification:** Verify all "Byte" content is preserved and "blip" dictionary is functional.
