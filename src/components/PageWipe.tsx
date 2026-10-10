"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { PixelGrid } from "@/components/PixelGrid";

let firstLoad = true;

// On a page change the new page appears through a grid of dissolving black
// pixels. Skipped on the first load (the intro covers that) so content is never
// hidden behind cells waiting for JS, and skipped for reduced motion.
export function PageWipe() {
  const reduce = useReducedMotion();
  const [play] = useState(() => !firstLoad);
  const [done, setDone] = useState(false);
  useEffect(() => {
    firstLoad = false;
  }, []);
  if (!play || reduce || done) return null;
  return <PixelGrid className="z-[45]" spread={0.4} onDone={() => setDone(true)} />;
}
