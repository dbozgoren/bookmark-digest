# Bookmark Digest v2 — Closed-Loop Brain System

## Overview
Upgrade from localStorage mock to a real persistent system using Supabase, connected to actual Twitter bookmark data.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BOOKMARK DIGEST SYSTEM                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Twitter ──bird sync──► ~/clawd/bookmarks/ (local JSON)     │
│                              │                              │
│                              ▼                              │
│                    sync-to-supabase.ts                      │
│                    (cron or manual run)                     │
│                              │                              │
│                              ▼                              │
│  ┌─────────────────── SUPABASE ───────────────────────┐    │
│  │                                                     │    │
│  │  bookmarks table          signals table             │    │
│  │  ─────────────────        ──────────────            │    │
│  │  id (tweet_id)            id                        │    │
│  │  author                   bookmark_id (FK)          │    │
│  │  text                     signal_type (enum)        │    │
│  │  url                      created_at                │    │
│  │  category                                           │    │
│  │  summary                  signal_type:              │    │
│  │  bookmarked_at            - 'derate'                │    │
│  │  synced_at                - 'like'                  │    │
│  │  cluster_id               - 'action'                │    │
│  │  hydrated (bool)          - 'action_done'           │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                              │
│                              ▼                              │
│                         PWA (Next.js)                       │
│                    ─────────────────────                    │
│                    - Reads bookmarks from Supabase          │
│                    - Writes signals to Supabase             │
│                    - Smart feed ordering                    │
│                    - Action Queue from DB                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema (Supabase)

### bookmarks table
```sql
create table bookmarks (
  id text primary key,              -- tweet ID
  author text not null,
  text text not null,
  url text,
  category text,                    -- ai-tools, design, etc.
  summary text,                     -- AI-generated summary
  bookmarked_at timestamptz,
  synced_at timestamptz default now(),
  cluster_id text,                  -- for topic clustering (future)
  hydrated boolean default false,
  raw_json jsonb                    -- original bookmark data
);
```

### signals table
```sql
create table signals (
  id uuid primary key default gen_random_uuid(),
  bookmark_id text references bookmarks(id) on delete cascade,
  signal_type text not null check (signal_type in ('derate', 'like', 'action', 'action_done')),
  created_at timestamptz default now(),
  unique(bookmark_id, signal_type)  -- one signal type per bookmark
);
```

### Views for convenience
```sql
-- Feed view: bookmarks not derated, ordered by smart ranking
create view feed_view as
select b.*, 
       s.signal_type,
       case 
         when s.signal_type = 'like' then 1
         when s.signal_type = 'action' then 2
         else 3
       end as priority
from bookmarks b
left join signals s on b.id = s.bookmark_id
where s.signal_type is null or s.signal_type != 'derate'
order by b.bookmarked_at desc;

-- Action queue: bookmarks marked for action, not done
create view action_queue as
select b.*
from bookmarks b
join signals s on b.id = s.bookmark_id
where s.signal_type = 'action'
and not exists (
  select 1 from signals s2 
  where s2.bookmark_id = b.id and s2.signal_type = 'action_done'
)
order by s.created_at desc;
```

## Sync Script (sync-to-supabase.ts)

Located at: `scripts/sync-to-supabase.ts`

Responsibilities:
1. Read bookmark JSON files from `~/clawd/bookmarks/`
2. Parse and normalize the data
3. Upsert to Supabase bookmarks table
4. Track what's been synced (avoid duplicates)

```bash
# Run manually
pnpm run sync

# Or via cron (daily)
0 6 * * * cd ~/GitRepos/bookmark-digest && pnpm run sync
```

## API Routes (Next.js App Router)

### GET /api/feed
Returns bookmarks for the feed (excluding derated).
- Query params: `limit`, `offset`, `category`
- Orders by: recency, with liked items boosted

### GET /api/queue
Returns action queue items.

### POST /api/signal
Records a signal for a bookmark.
- Body: `{ bookmarkId, signalType }`
- signalType: 'derate' | 'like' | 'action' | 'action_done'

### GET /api/stats
Returns digest stats (total, derated, liked, actioned).

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx  # for sync script only

# For sync script
BOOKMARKS_PATH=~/clawd/bookmarks
```

## PWA Updates

### Feed Component
- Fetch from `/api/feed` instead of mock data
- Infinite scroll or "load more"
- Optimistic UI updates on signal

### Action Queue
- Fetch from `/api/queue`
- "Mark done" button calls signal with 'action_done'

### Signal Persistence
- Replace localStorage with API calls
- Debounce rapid signals
- Show loading states

## Smart Feed Logic (v2.1 future)

Once signals accumulate:
1. **Recency decay** — older unseen items sink
2. **Category affinity** — show more of categories you 'like'
3. **Derate learning** — surface less from authors you often derate
4. **Action follow-up** — resurface 'action' items after N days

## File Structure

```
bookmark-digest/
├── app/
│   ├── api/
│   │   ├── feed/route.ts
│   │   ├── queue/route.ts
│   │   ├── signal/route.ts
│   │   └── stats/route.ts
│   ├── page.tsx
│   ├── queue/page.tsx
│   └── layout.tsx
├── components/
│   ├── Card.tsx
│   ├── ActionButtons.tsx
│   ├── Feed.tsx
│   └── Nav.tsx
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── types.ts
│   └── api.ts              # API helpers
├── scripts/
│   └── sync-to-supabase.ts # Sync script
└── supabase/
    └── schema.sql          # DB schema
```

## Implementation Steps

1. **Set up Supabase project** (or reuse existing)
2. **Create tables** with schema above
3. **Add Supabase client** to Next.js
4. **Build API routes** (feed, queue, signal)
5. **Update components** to use API instead of localStorage
6. **Build sync script** to push bookmarks to DB
7. **Test end-to-end** flow
8. **Deploy** updated app

## Existing Supabase

Deniz already has Supabase set up for Pantry app. Can either:
- Reuse same project (add new tables)
- Create separate project for bookmark-digest

Recommend: **Same project** — simpler, one dashboard.

## Notes

- Single user app — no auth needed (use service key or anon with RLS disabled)
- Sync script runs locally (has access to ~/clawd/bookmarks)
- PWA is stateless — all data in Supabase
- Can add hydration (AI summaries) as separate pipeline later
