"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

// Words switch on as they cross the screen, so the line reads at scroll pace.
// The closing line is set in the blackletter face.
export function Statement({ text, closer }: { text: string; closer: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  const steps = words.length + 1;
  return (
    <section aria-label="What we make" className="wrap px-4 py-24 md:px-6 md:py-36">
      <p ref={ref}>
        <span className="sr-only">
          {text} {closer}
        </span>
        <span aria-hidden className="display block max-w-[11ch] text-[clamp(3rem,10vw,9rem)] md:t-d2">
          {words.map((word, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / steps, (i + 1) / steps]}>
              {word}
            </Word>
          ))}
        </span>
        <span aria-hidden className="script mt-4 block text-[clamp(2.5rem,8vw,7rem)] md:t-script-l">
          <Word progress={scrollYProgress} range={[(steps - 1) / steps, 1]}>
            {closer}
          </Word>
        </span>
      </p>
    </section>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.22em] inline-block">
      {children}
    </motion.span>
  );
}
