"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

// A ring, like the two in the logo, with "View" inside. It follows the mouse
// over anything tagged data-cursor and blends in difference mode, so it inverts
// whatever is under it and stays visible on black tees and grey backdrops.
// Mouse devices only: touch users tap straight through to the product.
export function Cursor() {
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40 });
  const sy = useSpring(y, { stiffness: 600, damping: 40 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (hover: hover)");
    const update = () => setEnabled(fine.matches);
    update();
    fine.addEventListener("change", update);
    return () => fine.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    function move(e: PointerEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      setLabel(target?.dataset.cursor ?? null);
    }
    function leave() {
      setLabel(null);
    }
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[65] grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[6px] border-chalk text-sm font-bold text-chalk mix-blend-difference"
      style={{ x: sx, y: sy }}
      initial={false}
      animate={{ scale: label ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      {label}
    </motion.div>
  );
}
