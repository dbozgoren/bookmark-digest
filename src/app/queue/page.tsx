"use client";

import { useEffect, useState, useCallback } from "react";
import { Bookmark } from "@/lib/types";
import { fetchQueue, sendSignal } from "@/lib/api";

export default function QueuePage() {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchQueue();
      setItems(data);
    } catch (e) {
      console.error("Failed to load queue:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkDone = async (bookmarkId: string) => {
    // Optimistic: remove from list
    setItems((prev) => prev.filter((item) => item.id !== bookmarkId));

    try {
      await sendSignal(bookmarkId, "action_done");
    } catch (e) {
      console.error("Failed to mark done:", e);
      load();
    }
  };

  const handleRemove = async (bookmarkId: string) => {
    // Optimistic: remove from list
    setItems((prev) => prev.filter((item) => item.id !== bookmarkId));

    try {
      await sendSignal(bookmarkId, "action", true);
    } catch (e) {
      console.error("Failed to remove:", e);
      load();
    }
  };

  if (loading) {
    return (
      <div className="text-center text-zinc-500 py-20">
        <p className="text-sm">Loading action items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-24">
      <p className="text-sm text-zinc-500">
        {items.length} item{items.length !== 1 ? "s" : ""} to act on
      </p>

      {items.length === 0 ? (
        <div className="text-center text-zinc-500 py-20">
          <p className="text-lg">No action items yet</p>
          <p className="text-sm mt-1">Tap the Action button on bookmarks to add them here.</p>
        </div>
      ) : (
        items.map((bm) => (
          <div
            key={bm.id}
            className="border border-zinc-800 rounded-xl p-4 space-y-2 bg-zinc-900/50"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-400 font-medium">#{bm.category}</span>
              <span className="text-zinc-500">{bm.author}</span>
            </div>

            <p className="text-sm leading-relaxed text-zinc-300">
              {bm.text.length > 120 ? bm.text.slice(0, 120) + "..." : bm.text}
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleMarkDone(bm.id)}
                className="flex-1 py-2 px-3 rounded-lg border border-zinc-700 text-zinc-400 hover:border-green-500/50 hover:text-green-400 text-sm font-medium transition-all active:scale-95 min-h-[44px]"
              >
                Mark Done
              </button>
              <button
                onClick={() => handleRemove(bm.id)}
                className="py-2 px-3 rounded-lg border border-zinc-700 text-zinc-500 hover:text-red-400 hover:border-red-500/50 text-sm transition-all active:scale-95 min-h-[44px]"
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
