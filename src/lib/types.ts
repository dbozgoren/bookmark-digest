export interface Bookmark {
  id: string;
  author: string;
  text: string;
  summary?: string;
  category: string;
  bookmarkedAt: string; // ISO date
  url?: string;
}

export type SignalType = "derate" | "like" | "action";

export interface Signal {
  bookmarkId: string;
  type: SignalType;
  createdAt: string; // ISO date
  done?: boolean; // only for action items
}

export type SignalMap = Record<string, Signal>;

// DB row types (snake_case from Supabase)
export interface BookmarkRow {
  id: string;
  author: string;
  text: string;
  url: string | null;
  category: string | null;
  summary: string | null;
  bookmarked_at: string | null;
  synced_at: string;
  cluster_id: string | null;
  hydrated: boolean;
  raw_json: unknown;
  signal_type?: string | null; // from feed_view join
}

export function rowToBookmark(row: BookmarkRow): Bookmark {
  return {
    id: row.id,
    author: row.author,
    text: row.text,
    summary: row.summary ?? undefined,
    category: row.category ?? "uncategorized",
    bookmarkedAt: row.bookmarked_at ?? row.synced_at,
    url: row.url ?? undefined,
  };
}
