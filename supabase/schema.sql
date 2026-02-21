-- Bookmark Digest v2 Schema
-- Run this in your Supabase SQL editor

-- Bookmarks table
create table if not exists bookmarks (
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

-- Signals table
create table if not exists signals (
  id uuid primary key default gen_random_uuid(),
  bookmark_id text references bookmarks(id) on delete cascade,
  signal_type text not null check (signal_type in ('derate', 'like', 'action', 'action_done')),
  created_at timestamptz default now(),
  unique(bookmark_id, signal_type)
);

-- Indexes
create index if not exists idx_bookmarks_bookmarked_at on bookmarks(bookmarked_at desc);
create index if not exists idx_bookmarks_category on bookmarks(category);
create index if not exists idx_signals_bookmark_id on signals(bookmark_id);
create index if not exists idx_signals_type on signals(signal_type);

-- Feed view: non-derated bookmarks with their primary signal
create or replace view feed_view as
select
  b.*,
  (
    select s.signal_type
    from signals s
    where s.bookmark_id = b.id
      and s.signal_type in ('like', 'action')
    limit 1
  ) as signal_type
from bookmarks b
where not exists (
  select 1 from signals s
  where s.bookmark_id = b.id
    and s.signal_type = 'derate'
);

-- Action queue: bookmarks marked for action, not yet done
create or replace view action_queue as
select b.*
from bookmarks b
join signals s on b.id = s.bookmark_id
where s.signal_type = 'action'
  and not exists (
    select 1 from signals s2
    where s2.bookmark_id = b.id
      and s2.signal_type = 'action_done'
  )
order by s.created_at desc;
