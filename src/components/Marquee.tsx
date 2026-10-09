"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";

// Ticker whose speed follows scroll velocity and flips with scroll direction.
export function Marquee({ items, baseSpeed = 3 }: { items: string[]; baseSpeed?: number }) {
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 5], { clamp: false });
  const direction = useRef(1);
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    let move = direction.current * baseSpeed * (delta / 1000);
    move += direction.current * move * Math.abs(f);
    baseX.set(baseX.get() - move);
  });

  return (
    <div className="on-ink overflow-hidden border-y-2 border-ink bg-ink py-3 text-bone">
      <p className="sr-only">{items.join(". ")}</p>
      <motion.div aria-hidden className="display flex whitespace-nowrap text-[clamp(2.5rem,7vw,5.5rem)]" style={{ x }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="pr-[0.25em]">
            {items.map((word) => (
              <span key={word}>
                {word}
                <span className="px-[0.25em] text-acid">/</span>
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
