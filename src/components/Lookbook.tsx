"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Photo, Placeholder } from "@/components/Placeholder";
import { getProduct, looks } from "@/data/products";
import { site } from "@/data/site";
import { formatKsh } from "@/lib/format";

const PIN_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

// Wide screens: the section pins and vertical scroll drives the strip sideways.
// Phones and reduced motion: a plain swipeable row with snap points.
export function Lookbook() {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY);
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section id="lookbook" aria-labelledby="lookbook-title" className="scroll-mt-0 border-b-2 border-chalk bg-void text-chalk">
      {pinned ? <PinnedTrack /> : <SwipeTrack />}
    </section>
  );
}

function Intro() {
  return (
    <div className="flex w-[min(85vw,26rem)] shrink-0 flex-col justify-end lg:w-[32rem]">
      <p className="text-sm font-semibold text-dim">{site.currentDrop} / Lookbook</p>
      <h2 id="lookbook-title" className="display mt-2 text-[clamp(4rem,9vw,8rem)] md:t-d2">
        Complete the look.
      </h2>
      <p className="mt-4 max-w-xs text-dim">
        Styled on Mona (5&apos;7, wearing size Small). Tap to shop the Night Dweller Baby Tee straight off the outfit.
      </p>
    </div>
  );
}

function LookCard({ index }: { index: number }) {
  const look = looks[index];
  return (
    <figure className="flex w-[min(80vw,24rem)] shrink-0 snap-start flex-col lg:w-[34vh] xl:w-[40vh]">
      {look.photo ? (
        <Photo photo={look.photo} sizes="(min-width: 1024px) 40vh, 80vw" className="aspect-[3/4]" />
      ) : (
        <Placeholder tone={look.tone} code={`${site.codePrefix}L0${index + 1}`} label={look.title} className="aspect-[3/4]" />
      )}
      <figcaption className="pt-3">
        <p className="display text-3xl md:t-d5">{look.title}</p>
        <ul className="mt-1">
          {look.productSlugs.map((slug) => {
            const p = getProduct(slug);
            if (!p) return null;
            return (
              <li key={slug}>
                <Link
                  href={`/product/${slug}`}
                  className="flex min-h-11 items-center justify-between gap-3 border-b border-chalk/30 hover:underline"
                >
                  <span>{p.name}</span>
                  <span className="text-dim">{formatKsh(p.price)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </figcaption>
    </figure>
  );
}

function SwipeTrack() {
  return (
    <div className="py-14">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] md:gap-6 md:px-6">
        <Intro />
        {looks.map((look, i) => (
          <LookCard key={look.id} index={i} />
        ))}
      </div>
    </div>
  );
}

function PinnedTrack() {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const measure = () => setDistance(Math.max(0, node.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={outer} style={{ height: `calc(100dvh + ${distance}px)` }} className="relative">
      <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden pt-[var(--header-h)]">
        <motion.div ref={track} style={{ x }} className="gutter-x flex w-max min-w-full items-end gap-8">
          <Intro />
          {looks.map((look, i) => (
            <LookCard key={look.id} index={i} />
          ))}
        </motion.div>
        <div className="gutter-x mt-8">
          <div className="h-0.5 bg-chalk/20">
            <motion.div className="h-full bg-chalk" style={{ width: progress }} />
          </div>
        </div>
      </div>
    </div>
  );
}
