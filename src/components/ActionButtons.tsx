"use client";

import { SignalType } from "@/lib/types";

interface ActionButtonsProps {
  currentSignal?: SignalType;
  onSignal: (type: SignalType) => void;
  onClear: () => void;
}

const buttons: { type: SignalType; icon: string; label: string; activeClass: string }[] = [
  { type: "derate", icon: "\uD83D\uDC4E", label: "Derate", activeClass: "bg-red-500/20 text-red-400 border-red-500/50" },
  { type: "like", icon: "\u2764\uFE0F", label: "Like", activeClass: "bg-pink-500/20 text-pink-400 border-pink-500/50" },
  { type: "action", icon: "\uD83C\uDFAF", label: "Action", activeClass: "bg-blue-500/20 text-blue-400 border-blue-500/50" },
];

export default function ActionButtons({ currentSignal, onSignal, onClear }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      {buttons.map(({ type, icon, label, activeClass }) => {
        const isActive = currentSignal === type;
        return (
          <button
            key={type}
            onClick={() => (isActive ? onClear() : onSignal(type))}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all active:scale-95 min-h-[44px] ${
              isActive
                ? activeClass
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
