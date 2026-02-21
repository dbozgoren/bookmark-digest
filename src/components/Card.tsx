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
  const hasUrl = !!bookmark.url;

  const handleOpen = () => {
    if (hasUrl) window.open(bookmark.url, "_blank", "noopener");
  };

  return (
    <article className="border border-zinc-800 rounded-xl p-4 space-y-3 bg-zinc-900/50">
      <div
        onClick={handleOpen}
        className={hasUrl ? "cursor-pointer space-y-3 active:opacity-80 transition-opacity" : "space-y-3"}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-400 font-medium">#{bookmark.category}</span>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">{daysAgo(bookmark.bookmarkedAt)}</span>
            {hasUrl && (
              <svg className="w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-zinc-300 font-semibold text-sm">{bookmark.author}</p>
          <p className="text-zinc-200 text-[15px] leading-relaxed">{bookmark.text}</p>
        </div>

        {bookmark.media && bookmark.media.length > 0 && (
          <div className={`grid gap-1.5 ${bookmark.media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {bookmark.media.slice(0, 4).map((src, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="w-full h-32 object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {bookmark.summary && (
          <div className="bg-zinc-800/60 rounded-lg p-3 text-sm text-zinc-400 leading-relaxed">
            {bookmark.summary}
          </div>
        )}
      </div>

      <ActionButtons
        currentSignal={signal}
        onSignal={(type) => onSignal(bookmark.id, type)}
        onClear={() => onClear(bookmark.id)}
      />
    </article>
  );
}
