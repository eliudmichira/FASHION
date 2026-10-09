"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { site } from "@/data/site";
import { wordmarkLetters, wordmarkSize } from "@/lib/wordmark";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

const KEY = "dz-intro";

export function Intro() {
  const [show, setShow] = useState(true);
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
    const done = window.setTimeout(() => setShow(false), 1900);
    const skip = () => setShow(false);
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      window.clearTimeout(done);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      release();
    };
  }, []);

  useEffect(() => {
    if (show) return;
    release();
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          className="intro-overlay on-ink fixed inset-0 z-[70] grid place-items-center overflow-hidden bg-ink text-bone"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}
        >
          <div className="display flex" style={{ fontSize: `clamp(3rem, ${wordmarkSize(80, 20)}, 18rem)` }}>
            {wordmarkLetters.map((letter, i) => (
              <span key={i} className="overflow-hidden">
                <motion.span
                  className={`block ${i === wordmarkLetters.length - 1 ? "text-acid" : ""}`}
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.55, ease: [0.2, 0.9, 0.1, 1] }}
                >
                  {letter}
                </motion.span>
              </span>
            ))}
          </div>
          <motion.p
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-muted-on-ink"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {site.currentDrop} / out now
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
