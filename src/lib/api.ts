import { Bookmark, SignalType } from "./types";

export interface FeedBookmark extends Bookmark {
  signalType?: SignalType;
}

export async function fetchFeed(limit = 20, offset = 0): Promise<FeedBookmark[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const res = await fetch(`/api/feed?${params}`);
  if (!res.ok) throw new Error("Failed to fetch feed");
  const { bookmarks } = await res.json();
  return bookmarks;
}

export async function fetchQueue(): Promise<Bookmark[]> {
  const res = await fetch("/api/queue");
  if (!res.ok) throw new Error("Failed to fetch queue");
  const { items } = await res.json();
  return items;
}

export async function sendSignal(
  bookmarkId: string,
  signalType: SignalType | "action_done",
  remove = false
): Promise<void> {
  const res = await fetch("/api/signal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookmarkId, signalType, remove }),
  });
  if (!res.ok) throw new Error("Failed to send signal");
}

export interface DigestStats {
  total: number;
  derated: number;
  liked: number;
  actioned: number;
}

export async function fetchStats(): Promise<DigestStats> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
