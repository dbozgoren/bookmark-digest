"use client";

import { useEffect, useState } from "react";
import { Signal, SignalMap } from "@/lib/types";
import { getSignals, getActionItems, toggleActionDone, removeSignal } from "@/lib/signals";
import { mockBookmarks } from "@/lib/mock-data";

export default function QueuePage() {
  const [actions, setActions] = useState<Signal[]>([]);

  useEffect(() => {
    setActions(getActionItems());
  }, []);

  const refresh = () => setActions(getActionItems());

  const bookmarkMap = Object.fromEntries(mockBookmarks.map((bm) => [bm.id, bm]));

  const handleToggleDone = (bookmarkId: string) => {
    toggleActionDone(bookmarkId);
    refresh();
  };

  const handleRemove = (bookmarkId: string) => {
    removeSignal(bookmarkId);
    refresh();
  };

  return (
    <div className="space-y-3 pb-24">
      <p className="text-sm text-zinc-500">
        {actions.length} item{actions.length !== 1 ? "s" : ""} to act on
      </p>

      {actions.length === 0 ? (
        <div className="text-center text-zinc-500 py-20">
          <p className="text-lg">No action items yet</p>
          <p className="text-sm mt-1">Tap the Action button on bookmarks to add them here.</p>
        </div>
      ) : (
        actions.map((action) => {
          const bm = bookmarkMap[action.bookmarkId];
          if (!bm) return null;
          return (
            <div
              key={action.bookmarkId}
              className={`border rounded-xl p-4 space-y-2 transition-opacity ${
                action.done
                  ? "border-zinc-800/50 opacity-50"
                  : "border-zinc-800 bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-400 font-medium">#{bm.category}</span>
                <span className="text-zinc-500">{bm.author}</span>
              </div>

              <p className={`text-sm leading-relaxed ${action.done ? "line-through text-zinc-600" : "text-zinc-300"}`}>
                {bm.text.length > 120 ? bm.text.slice(0, 120) + "..." : bm.text}
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleToggleDone(action.bookmarkId)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all active:scale-95 min-h-[44px] ${
                    action.done
                      ? "border-green-500/50 bg-green-500/20 text-green-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {action.done ? "Done" : "Mark Done"}
                </button>
                <button
                  onClick={() => handleRemove(action.bookmarkId)}
                  className="py-2 px-3 rounded-lg border border-zinc-700 text-zinc-500 hover:text-red-400 hover:border-red-500/50 text-sm transition-all active:scale-95 min-h-[44px]"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
