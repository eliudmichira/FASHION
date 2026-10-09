"use client";

import { useSyncExternalStore } from "react";

// One shared ticking clock, read through useSyncExternalStore so the server
// (which can't know the visitor's time) renders placeholders instead.
let now = 0;
const listeners = new Set<() => void>();
let timer: number | undefined;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) {
    timer = window.setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) window.clearInterval(timer);
  };
}

function getSnapshot() {
  if (!now) now = Date.now();
  return now;
}

function partsUntil(target: number, at: number) {
  const ms = Math.max(0, target - at);
  return {
    done: ms === 0,
    units: [
      { label: "Days", value: Math.floor(ms / 86_400_000) },
      { label: "Hrs", value: Math.floor(ms / 3_600_000) % 24 },
      { label: "Min", value: Math.floor(ms / 60_000) % 60 },
      { label: "Sec", value: Math.floor(ms / 1000) % 60 },
    ],
  };
}

export function Countdown({ opensAt }: { opensAt: string }) {
  const target = new Date(opensAt).getTime();
  const at = useSyncExternalStore<number | null>(subscribe, getSnapshot, () => null);
  const { done, units } = partsUntil(target, at ?? target);

  if (at !== null && done) {
    return <p className="display text-[clamp(4rem,14vw,9rem)]">It&apos;s live.</p>;
  }

  return (
    <div role="timer" aria-label="Time until the drop opens" className="grid grid-cols-4 gap-2 md:gap-4">
      {units.map((u) => (
        <div key={u.label} className="border-2 border-ink p-2 md:p-4">
          <span className="display block text-[clamp(3rem,10vw,8rem)] tabular-nums">
            {at === null ? "--" : String(u.value).padStart(2, "0")}
          </span>
          <span className="text-sm font-semibold">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
