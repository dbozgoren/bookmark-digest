# Bookmark Digest

Digest your Twitter bookmarks through second-round curation. A mobile-first PWA backed by Supabase.

## How it works

1. **Bird sync** exports Twitter bookmarks to `~/clawd/bookmarks/` as categorized markdown
2. **Sync script** parses the markdown and upserts to Supabase
3. **PWA** serves the feed for triage — derate, like, or mark for action

## Setup

### 1. Supabase

Create a project (or reuse existing) and run `supabase/schema.sql` in the SQL editor.

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` — project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
- `SUPABASE_SERVICE_KEY` — service role key (for API routes + sync)
- `BOOKMARKS_PATH` — path to bookmark markdown files (default: `~/clawd/bookmarks`)

### 3. Install and sync

```bash
pnpm install
pnpm run sync    # import bookmarks to Supabase
pnpm dev         # start dev server
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm sync` | Sync bookmarks from local files to Supabase |

## Architecture

```
Twitter → bird sync → ~/clawd/bookmarks/ (markdown)
                              ↓
                     sync-to-supabase.ts
                              ↓
                          Supabase
                              ↓
                      Next.js PWA (API routes)
```

## Signals

| Signal | Effect |
|--------|--------|
| Derate | Hide from feed |
| Like | Boost in feed |
| Action | Add to action queue |

## Tech

- Next.js 16 (App Router)
- Supabase (Postgres)
- Tailwind v4
- PWA (installable)
