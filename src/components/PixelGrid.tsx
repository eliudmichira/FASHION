"use client";

import { useState } from "react";
import { motion } from "motion/react";

// Same pseudo-random order on every run, without calling Math.random in render.
const scatter = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// A screen of square black cells that blink out one by one, like pixels
// switching off. Square cells keep the logo's grid; about 12 across the long edge.
export function PixelGrid({
  spread = 0.45,
  onDone,
  className = "",
}: {
  spread?: number;
  onDone?: () => void;
  className?: string;
}) {
  const [grid] = useState(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cell = Math.max(w, h) / 12;
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const total = cols * rows;
    // The cell with the longest delay is the last to go out; it reports done.
    let last = 0;
    for (let i = 1; i < total; i++) if (scatter(i) > scatter(last)) last = i;
    return { cols, rows, total, last };
  });

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
        gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
      }}
    >
      {Array.from({ length: grid.total }, (_, i) => (
        <motion.div
          key={i}
          className="-m-px bg-void"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: scatter(i) * spread, duration: 0.05, ease: "linear" }}
          onAnimationComplete={i === grid.last ? onDone : undefined}
        />
      ))}
    </div>
  );
}
