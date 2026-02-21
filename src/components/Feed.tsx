"use client";

import { useEffect, useState, useCallback } from "react";
import { SignalType } from "@/lib/types";
import { FeedBookmark, fetchFeed, sendSignal } from "@/lib/api";
import Card from "./Card";

export default function Feed() {
  const [bookmarks, setBookmarks] = useState<FeedBookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchFeed();
      setBookmarks(data);
    } catch (e) {
      console.error("Failed to load feed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSignal = async (bookmarkId: string, type: SignalType) => {
    // Optimistic update
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
      load(); // reload on error
    }
  };

  const handleClear = async (bookmarkId: string) => {
    const prev = bookmarks.find((bm) => bm.id === bookmarkId);
    const prevSignal = prev?.signalType;

    // Optimistic update
    setBookmarks((bms) =>
      bms.map((bm) => (bm.id === bookmarkId ? { ...bm, signalType: undefined } : bm))
    );

    if (prevSignal) {
      try {
        await sendSignal(bookmarkId, prevSignal, true);
      } catch (e) {
        console.error("Failed to clear signal:", e);
        load();
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center text-zinc-500 py-20">
        <p className="text-sm">Loading bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {bookmarks.length === 0 ? (
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
