"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Placeholder } from "@/components/Placeholder";
import { products } from "@/data/products";
import { site } from "@/data/site";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Wordmark shrinks and sinks as the campaign shot takes over the screen.
  const markScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.82]);
  const markY = useTransform(scrollYProgress, [0, 0.6], ["0%", "18%"]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="flex justify-between gap-4 px-4 pt-4 text-sm font-semibold md:px-6">
        <span>Unisex streetwear</span>
        <span>{site.currentDrop} / out now</span>
      </div>

      <motion.h1
        id="hero-title"
        style={{ scale: markScale, y: markY }}
        className="display origin-top whitespace-nowrap px-2 pt-2 text-center text-[21.5vw]"
      >
        <span className="sr-only">{site.name}: unisex streetwear, released in drops</span>
        <span aria-hidden className="flex justify-center">
          {site.name.split("").map((letter, i) => (
            <span key={i} className="overflow-hidden pb-[0.04em]">
              <motion.span
                className="block"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.6, ease: [0.2, 0.9, 0.1, 1] }}
              >
                {letter}
              </motion.span>
            </span>
          ))}
        </span>
      </motion.h1>

      <div className="relative mx-2 overflow-hidden md:mx-6">
        <motion.div style={{ y: photoY }} className="scale-[1.14]">
          <Placeholder
            tone="soot"
            code="DZ/C01"
            label="Campaign"
            className="aspect-[4/5] p-[7%] sm:aspect-[3/2] lg:aspect-[16/8]"
          />
        </motion.div>
        <div className="relative bg-bone pt-4 sm:absolute sm:left-0 sm:top-0 sm:max-w-md sm:p-6 sm:pt-6">
          <p className="display text-5xl md:text-7xl">{site.currentDrop} is out.</p>
          <p className="mt-2 text-muted">{products.length} pieces, cut for everyone, sized XS to XXL.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/shop" className="inline-flex min-h-12 items-center bg-ink px-5 font-semibold text-bone hover:bg-soot">
              Shop {site.currentDrop}
            </Link>
            <Link
              href="/#lookbook"
              className="inline-flex min-h-12 items-center border-2 border-ink px-5 font-semibold hover:bg-ink hover:text-bone"
            >
              See the lookbook
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
