"use client";

import { useEffect, useState, useCallback } from "react";
import { SignalType } from "@/lib/types";
import { FeedBookmark, fetchFeed, sendSignal } from "@/lib/api";
import Card from "./Card";

export default function Feed() {
  const [bookmarks, setBookmarks] = useState<FeedBookmark[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (category?: string) => {
    setLoading(true);
    try {
      const data = await fetchFeed(20, 0, category);
      setBookmarks(data.bookmarks);
      setCategories(data.categories);
    } catch (e) {
      console.error("Failed to load feed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(activeCategory);
  }, [load, activeCategory]);

  const handleSignal = async (bookmarkId: string, type: SignalType) => {
    if (type === "derate") {
      setBookmarks((prev) => prev.filter((bm) => bm.id !== bookmarkId));
    } else {
      setBookmarks((prev) =>
        prev.map((bm) => (bm.id === bookmarkId ? { ...bm, signalType: type } : bm))
      );
    }

    try {
      await sendSignal(bookmarkId, type);
    } catch (e) {
      console.error("Failed to send signal:", e);
      load(activeCategory);
    }
  };

  const handleClear = async (bookmarkId: string) => {
    const prev = bookmarks.find((bm) => bm.id === bookmarkId);
    const prevSignal = prev?.signalType;

    setBookmarks((bms) =>
      bms.map((bm) => (bm.id === bookmarkId ? { ...bm, signalType: undefined } : bm))
    );

    if (prevSignal) {
      try {
        await sendSignal(bookmarkId, prevSignal, true);
      } catch (e) {
        console.error("Failed to clear signal:", e);
        load(activeCategory);
      }
    }
  };

  const handleCategoryChange = (cat: string | undefined) => {
    setActiveCategory(cat);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 no-scrollbar">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !activeCategory
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                : "border border-zinc-700 text-zinc-400 hover:text-zinc-300 hover:border-zinc-500"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
                  : "border border-zinc-700 text-zinc-400 hover:text-zinc-300 hover:border-zinc-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center text-zinc-500 py-20">
          <p className="text-sm">Loading bookmarks...</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center text-zinc-500 py-20">
          <p className="text-lg">All caught up!</p>
          <p className="text-sm mt-1">No more bookmarks to review.</p>
        </div>
      ) : (
        bookmarks.map((bm) => (
          <Card
            key={bm.id}
            bookmark={bm}
            signal={bm.signalType}
            onSignal={handleSignal}
            onClear={handleClear}
          />
        ))
      )}
    </div>
  );
}
