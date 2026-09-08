# Metadata Image QA

Use this checklist after metadata image changes.

## 1. Inspect Live HTML

For each test URL, fetch and inspect:

- canonical
- description
- `og:title`
- `og:description`
- `og:image`
- `twitter:title`
- `twitter:description`
- `twitter:image`

Suggested URLs:

- `/`
- `/about`
- `/work`
- `/work/dev-diary`
- `/bloq`
- one bloq post with a native image
- one bloq post without a native image
- `/byte`
- one byte detail page
- `/blip`
- one blip detail page

## 2. Inspect Image URLs Directly

Open or fetch each emitted `og:image` URL and confirm:

- non-404 response
- image content type
- expected host and path
- expected visual output

For dynamic detail pages, the generated route pattern is:

- `/og/work/[slug]`
- `/og/bloq/[slug]`
- `/og/byte/[serial]`
- `/og/blip/[serial]`

## 3. Policy Checks

Confirm:

- `/` keeps the intentional homepage image
- `/about`, `/work`, `/bloq`, `/byte`, `/blip` ship no image by default
- bloq posts with a native image use that native image
- bloq posts without a native image use the generated fallback
- work detail pages use generated cards, not GIF screenshots

## 4. Share Preview Checks

Re-scrape and inspect in:

- X
- LinkedIn Post Inspector
- Facebook Sharing Debugger
- Slack
- Discord
- Telegram

## 5. Title Checks

Confirm dynamic detail pages use branded card titles:

- bloq: `Post Title | Sumit Sute`
- work: `Project Title | Sumit Sute`
- byte: `byte #N | Sumit Sute`
- blip: `Term | blip | Sumit Sute`
