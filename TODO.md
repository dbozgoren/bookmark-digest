# Bookmark Digest — TODO

## Pending Setup (for Deniz in morning)

### 1. Supabase Setup
Either reuse your Pantry Supabase project or create new one.

Run the schema in `supabase/schema.sql`:
```sql
-- Copy/paste into Supabase SQL editor
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx  # for sync script
```

### 3. Run Initial Sync
```bash
cd ~/GitRepos/bookmark-digest
pnpm run sync
```

### 4. Redeploy to Vercel
```bash
vercel --prod
```
Or push to GitHub for auto-deploy.

---

## Feature Requests (from Deniz)

### v2.1 — Quick Wins
- [ ] **Click to open in Twitter** — card tap/click opens original tweet URL
- [ ] **Show attached photos** — if tweet has media, show thumbnail in card
- [ ] **Category filter** — dropdown/tabs at top to filter feed by tag (ai-tools, design, etc.)

### v2.2 — Future Ideas
- [ ] **Search within saved** — text search across all bookmarks
- [ ] **Bulk actions** — select multiple, derate all / like all
- [ ] **Stats dashboard** — how many processed, liked, derated over time
- [ ] **Smart surfacing** — boost categories you engage with, sink ones you derate
- [ ] **Hydration pipeline** — AI summaries for articles (separate cron job)
- [ ] **Keyboard shortcuts** — j/k to navigate, d/l/a for actions

---

## Completed

### v1 (deployed)
- [x] Next.js + Tailwind + PWA
- [x] Feed view with mock data
- [x] Three action buttons (derate/like/action)
- [x] Action Queue view
- [x] Dark mode, mobile-first
- [x] Deployed to Vercel

### v2 (built, needs Supabase)
- [x] Supabase schema
- [x] API routes (feed, queue, signal, stats)
- [x] Supabase client integration
- [x] Sync script for ~/clawd/bookmarks/
- [x] Updated components to use API
