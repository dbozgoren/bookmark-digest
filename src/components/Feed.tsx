"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { SignalType } from "@/lib/types";
import { FeedBookmark, fetchFeed, sendSignal } from "@/lib/api";
import Card from "./Card";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

export default function Feed() {
  const [bookmarks, setBookmarks] = useState<FeedBookmark[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const load = useCallback(async (category?: string, search?: string, reset = true) => {
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentOffset = reset ? 0 : offset;
      const data = await fetchFeed(PAGE_SIZE, currentOffset, category, search || undefined);
      
      if (reset) {
        setBookmarks(data.bookmarks);
      } else {
        setBookmarks((prev) => [...prev, ...data.bookmarks]);
      }
      
      setCategories(data.categories);
      setHasMore(data.bookmarks.length === PAGE_SIZE);
      setOffset(currentOffset + data.bookmarks.length);
    } catch (e) {
      console.error("Failed to load feed:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [offset]);

  // Initial load and reload on filter/search change
  useEffect(() => {
    load(activeCategory, debouncedSearch, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, debouncedSearch]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          load(activeCategory, debouncedSearch, false);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, activeCategory, debouncedSearch, load]);

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      load(activeCategory, debouncedSearch, true);
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
        load(activeCategory, debouncedSearch, true);
      }
    }
  };

  const handleCategoryChange = (cat: string | undefined) => {
    setActiveCategory(cat);
  };

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Search bar */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search bookmarks... (press /)"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 pl-10 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

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
          {debouncedSearch ? (
            <>
              <p className="text-lg">No results found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </>
          ) : (
            <>
              <p className="text-lg">All caught up!</p>
              <p className="text-sm mt-1">No more bookmarks to review.</p>
            </>
          )}
        </div>
      ) : (
        <>
          {bookmarks.map((bm) => (
            <Card
              key={bm.id}
              bookmark={bm}
              signal={bm.signalType}
              onSignal={handleSignal}
              onClear={handleClear}
            />
          ))}
          
          {/* Infinite scroll trigger */}
          <div ref={loaderRef} className="py-4 text-center">
            {loadingMore && (
              <p className="text-sm text-zinc-500">Loading more...</p>
            )}
            {!hasMore && bookmarks.length > 0 && (
              <p className="text-sm text-zinc-600">You&apos;ve seen all {bookmarks.length} bookmarks</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
