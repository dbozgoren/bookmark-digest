"use client";

import { Bookmark, SignalType } from "@/lib/types";
import ActionButtons from "./ActionButtons";

interface CardProps {
  bookmark: Bookmark;
  signal?: SignalType;
  onSignal: (bookmarkId: string, type: SignalType) => void;
  onClear: (bookmarkId: string) => void;
}

function daysAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "1d ago";
  return `${diff}d ago`;
}

export default function Card({ bookmark, signal, onSignal, onClear }: CardProps) {
  return (
    <article className="border border-zinc-800 rounded-xl p-4 space-y-3 bg-zinc-900/50">
      <div className="flex items-center justify-between text-sm">
        <span className="text-blue-400 font-medium">#{bookmark.category}</span>
        <span className="text-zinc-500">{daysAgo(bookmark.bookmarkedAt)}</span>
      </div>

      <div className="space-y-2">
        <p className="text-zinc-300 font-semibold text-sm">{bookmark.author}</p>
        <p className="text-zinc-200 text-[15px] leading-relaxed">{bookmark.text}</p>
      </div>

      {bookmark.summary && (
        <div className="bg-zinc-800/60 rounded-lg p-3 text-sm text-zinc-400 leading-relaxed">
          {bookmark.summary}
        </div>
      )}

      <ActionButtons
        currentSignal={signal}
        onSignal={(type) => onSignal(bookmark.id, type)}
        onClear={() => onClear(bookmark.id)}
      />
    </article>
  );
}
