import { Signal, SignalMap, SignalType } from "./types";

const STORAGE_KEY = "bookmark-digest-signals";

export function getSignals(): SignalMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setSignal(bookmarkId: string, type: SignalType): Signal {
  const signals = getSignals();
  const signal: Signal = {
    bookmarkId,
    type,
    createdAt: new Date().toISOString(),
  };
  signals[bookmarkId] = signal;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));
  return signal;
}

export function removeSignal(bookmarkId: string): void {
  const signals = getSignals();
  delete signals[bookmarkId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));
}

export function toggleActionDone(bookmarkId: string): void {
  const signals = getSignals();
  const signal = signals[bookmarkId];
  if (signal && signal.type === "action") {
    signal.done = !signal.done;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));
  }
}

export function getActionItems(): Signal[] {
  const signals = getSignals();
  return Object.values(signals)
    .filter((s) => s.type === "action")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
