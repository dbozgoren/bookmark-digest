# Bookmark Digest — Product Spec

## Overview
A mobile-first PWA that helps digest Twitter bookmarks through a second-round curation process.

## The Problem
User has ~3,000 Twitter bookmarks. They're categorized but not actionable. Need a way to actually process and extract value from them.

## The Solution
A Twitter-like mobile web app where user scrolls through hydrated bookmark cards and takes action (derate / like / action).

## User Flow
```
Twitter Feed
    ↓ (user bookmarks interesting tweets)
Raw Bookmarks (~3000, synced via bird CLI)
    ↓ (system hydrates: expand links, summarize, cluster)
Hydrated Feed (this app)
    ↓ (user swipes/rates each card)
Curated Knowledge (derated items hidden, liked items boosted, action items queued)
```

## Core Features (v1)

### 1. Feed View (main screen)
- Vertical scrollable feed, Twitter-style
- Shows hydrated bookmark cards
- Open-ended scrolling (no pagination limit)
- Daily refresh from backlog

### 2. Card Anatomy
```
┌─────────────────────────────┐
│ #ai-agents         12d ago  │
│                             │
│ @username                   │
│ Tweet text preview here...  │
│                             │
│ 📄 AI summary (2-3 lines)   │
│                             │
│ [👎 Derate] [❤️ Like] [🎯 Action]│
└─────────────────────────────┘
```

Each card shows:
- Topic/cluster tag
- Days since bookmarked
- Author handle
- Tweet text (or preview)
- AI-generated summary (if article/thread)
- Three action buttons

### 3. Three Actions
| Button | Meaning | Effect |
|--------|---------|--------|
| 👎 **Derate** | Old news, tried it, not useful | Hidden from future feeds, marked in local DB |
| ❤️ **Like** | This is good stuff | Boosted in future, feeds "best of" |
| 🎯 **Action** | Circle back — tool to try, idea to explore | Added to Action Queue |

### 4. Action Queue View
- Simple list of all 🎯 items
- Can mark as done or remove
- Newest at top

### 5. Data Layer
- Read from existing bookmark data at `~/clawd/bookmarks/`
- Store user signals (derate/like/action) in local JSON or SQLite
- Never modify Twitter bookmarks — this is an overlay

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (user has account: dbozgoren)
- **Data:** JSON files or SQLite for local state
- **No heavy backend needed** — reads from synced bookmark files

## File Structure (suggested)
```
bookmark-digest/
├── app/
│   ├── page.tsx          # Feed view
│   ├── queue/page.tsx    # Action queue
│   └── layout.tsx
├── components/
│   ├── Card.tsx          # Bookmark card
│   ├── ActionButtons.tsx
│   └── Feed.tsx
├── lib/
│   ├── bookmarks.ts      # Read bookmark data
│   └── signals.ts        # Store user actions
├── data/
│   └── signals.json      # User's derate/like/action signals
└── public/
```

## Existing Data
Bookmarks are synced to `~/clawd/bookmarks/` with:
- `_index.md` — master index
- `_meta.md` — categorization logic
- `_sync.py` — sync script (uses bird CLI)
- `_categorize.py` — categorization script
- Individual bookmark JSON files

Categories already exist:
- ai-tools (1,652)
- ai-thoughts (749)
- design (422)
- business (64)
- to-try (62)
- dev-tools (51)

## Design Guidelines
- Mobile-first (375px width primary target)
- Dark mode preferred (easier on eyes, matches Twitter)
- Minimal chrome — content is king
- Smooth scrolling, snappy interactions
- Touch-friendly button targets (min 44px)

## Phase 1 Scope
1. ✅ Feed view with scrollable cards
2. ✅ Three action buttons working
3. ✅ Persist signals to local storage/JSON
4. ✅ Action Queue view
5. ✅ Read from bookmark data (can use mock data initially)
6. ✅ Deploy to Vercel

## Out of Scope (for now)
- Hydration/summarization pipeline (exists separately)
- Topic clustering AI
- Smart sorting algorithms
- User auth (single user app)

## Getting Started
1. `npx create-next-app@latest . --typescript --tailwind --eslint --app --use-pnpm`
2. Build the feed UI with mock data first
3. Wire up to real bookmark data
4. Add signal persistence
5. Deploy

## Notes
- This is Deniz's personal tool — no need for multi-user support
- Keep it simple, ship fast, iterate
- GitHub account: dbozgoren (for Vercel auto-deploy)
