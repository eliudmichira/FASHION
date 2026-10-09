"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

let firstLoad = true;

// Ink panel lifting off the new page. Skipped on the first load (the intro
// covers that) so content is never hidden behind a panel waiting for JS.
export function PageWipe() {
  const [play] = useState(() => !firstLoad);
  useEffect(() => {
    firstLoad = false;
  }, []);
  if (!play) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[45] origin-top bg-ink"
      initial={{ scaleY: 1 }}
      animate={{ scaleY: 0 }}
      transition={{ duration: 0.55, ease: [0.7, 0, 0.2, 1] }}
    />
  );
}
