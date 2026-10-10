"use client";

import { useEffect, useRef, useState } from "react";
import { motion, steps } from "motion/react";
import { LOGO_HOLE, LOGO_OUTLINE, LOGO_RING_R, LOGO_RINGS, LOGO_STROKE, LOGO_VIEWBOX } from "@/components/Logo";
import { PixelGrid } from "@/components/PixelGrid";
import { site } from "@/data/site";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

const KEY = "dz-intro";
// Stepped easing so the outline draws in hard increments, like pixels lighting.
const draw = steps(14);

// "mark": the logo draws and blinks. "out": the screen dissolves into the page.
type Phase = "mark" | "out" | "done";

export function Intro() {
  const [phase, setPhase] = useState<Phase>("mark");
  const locked = useRef(false);

  function release() {
    if (!locked.current) return;
    locked.current = false;
    unlockScroll();
  }

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      // Storage blocked: play the intro every load rather than never.
    }
    // Already hidden by CSS in both cases (see globals.css), so nothing to run.
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    lockScroll();
    locked.current = true;
    const out = window.setTimeout(() => setPhase("out"), 1700);
    const skip = () => setPhase((p) => (p === "mark" ? "out" : p));
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      window.clearTimeout(out);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      release();
    };
  }, []);

  useEffect(() => {
    if (phase === "mark") return;
    release();
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
  }, [phase]);

  if (phase === "done") return null;

  if (phase === "out") {
    return <PixelGrid className="intro-overlay z-[70]" spread={0.5} onDone={() => setPhase("done")} />;
  }

  return (
    <div
      aria-hidden
      className="intro-overlay fixed inset-0 z-[70] flex flex-col items-center justify-center gap-6 bg-void px-6 text-chalk"
    >
      <svg
        viewBox={LOGO_VIEWBOX}
        className="w-[min(46vw,15rem)]"
        fill="none"
        stroke="currentColor"
        strokeWidth={LOGO_STROKE}
        strokeLinejoin="miter"
      >
        <motion.path
          d={LOGO_OUTLINE}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: draw }}
        />
        <motion.path
          d={LOGO_HOLE}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.75, duration: 0.25, ease: steps(4) }}
        />
        {LOGO_RINGS.map((r) => (
          // Rings switch on, then blink once like a pair of eyes.
          <motion.circle
            key={r.cx}
            cx={r.cx}
            cy={r.cy}
            r={LOGO_RING_R}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            initial={{ opacity: 0, scaleY: 1 }}
            animate={{ opacity: 1, scaleY: [1, 1, 0.12, 1] }}
            transition={{
              opacity: { delay: 1, duration: 0 },
              scaleY: { delay: 1.2, duration: 0.3, times: [0, 0.1, 0.5, 1], ease: "linear" },
            }}
          />
        ))}
      </svg>
      <motion.p
        className="display text-center text-[clamp(1.25rem,5vw,2.5rem)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0 }}
      >
        {site.name}
      </motion.p>
    </div>
  );
}
