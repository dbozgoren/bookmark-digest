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
