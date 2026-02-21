"use client";

import { useEffect, useState } from "react";
import { Bookmark, SignalMap, SignalType } from "@/lib/types";
import { getSignals, setSignal, removeSignal } from "@/lib/signals";
import { mockBookmarks } from "@/lib/mock-data";
import Card from "./Card";

export default function Feed() {
  const [signals, setSignals] = useState<SignalMap>({});

  useEffect(() => {
    setSignals(getSignals());
  }, []);

  const handleSignal = (bookmarkId: string, type: SignalType) => {
    const signal = setSignal(bookmarkId, type);
    setSignals((prev) => ({ ...prev, [bookmarkId]: signal }));
  };

  const handleClear = (bookmarkId: string) => {
    removeSignal(bookmarkId);
    setSignals((prev) => {
      const next = { ...prev };
      delete next[bookmarkId];
      return next;
    });
  };

  const visibleBookmarks: Bookmark[] = mockBookmarks.filter(
    (bm) => signals[bm.id]?.type !== "derate"
  );

  return (
    <div className="space-y-4 pb-24">
      {visibleBookmarks.length === 0 ? (
        <div className="text-center text-zinc-500 py-20">
          <p className="text-lg">All caught up!</p>
          <p className="text-sm mt-1">No more bookmarks to review.</p>
        </div>
      ) : (
        visibleBookmarks.map((bm) => (
          <Card
            key={bm.id}
            bookmark={bm}
            signal={signals[bm.id]?.type}
            onSignal={handleSignal}
            onClear={handleClear}
          />
        ))
      )}
    </div>
  );
}
