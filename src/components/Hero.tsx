"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Logo } from "@/components/Logo";
import { ProductShot } from "@/components/ProductShot";
import { products } from "@/data/products";
import { site } from "@/data/site";

const lead = products[0];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // The mark steps back as you scroll, handing the screen to the photo.
  const markScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.85]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* On wide screens the hero is exactly one screen tall: the mark, name and
          the way into the shop on the left, the back hit filling the right. */}
      <div className="wrap grid gap-8 px-4 pb-4 pt-4 md:px-6 lg:h-[calc(100svh-var(--header-h)-var(--strip-h,0px))] lg:min-h-[640px] lg:grid-cols-[5fr_6fr] lg:gap-10 lg:pb-6">
        <div className="flex flex-col items-center text-center lg:items-start lg:justify-between lg:text-left">
          <div className="flex w-full justify-between gap-4 text-sm font-semibold">
            <span>Unisex streetwear, all sizes</span>
            <span>{site.currentDrop} / out now</span>
          </div>

          <div className="mt-8 flex flex-col items-center lg:mt-0 lg:items-start">
            <motion.div style={{ scale: markScale }} className="origin-bottom lg:origin-bottom-left">
              <Logo
                title={site.name}
                className="h-auto w-[min(48vw,18rem)] lg:h-[clamp(160px,34svh,340px)] lg:w-auto"
              />
            </motion.div>
            <h1 id="hero-title" className="display mt-6 text-[clamp(1.6rem,6.5vw,3.5rem)] md:t-d5 lg:mt-8">
              {site.name}
            </h1>
            <p className="script mt-3 text-[clamp(1.75rem,6vw,3rem)] md:t-script">{site.tagline}</p>
          </div>

          <div className="mt-8 w-full border-t-2 border-chalk pt-6 lg:mt-0">
            <p className="display text-4xl md:t-d4">{site.currentDrop} is out.</p>
            <p className="mt-2 text-dim">{products.length} pieces. Unisex, all sizes.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              <Link
                href="/shop"
                className="inline-flex min-h-12 items-center border-2 border-chalk bg-chalk px-5 font-semibold text-void hover:bg-void hover:text-chalk"
              >
                Shop {site.currentDrop}
              </Link>
              <Link
                href="/#lookbook"
                className="inline-flex min-h-12 items-center border-2 border-chalk px-5 font-semibold hover:bg-chalk hover:text-void"
              >
                See the lookbook
              </Link>
            </div>
          </div>
        </div>

        <Link
          href={`/product/${lead.slug}`}
          data-cursor="View"
          aria-label={`${lead.name}, ${lead.code}`}
          className="relative block overflow-hidden lg:h-full"
        >
          <motion.div style={{ y: photoY }} className="h-full scale-[1.08]">
            <ProductShot
              product={lead}
              shot={1}
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="aspect-[3/4] lg:aspect-auto lg:h-full"
            />
          </motion.div>
          <span className="absolute bottom-0 left-0 bg-void px-3 py-2 text-sm font-semibold">
            {lead.code} {lead.name}
          </span>
        </Link>
      </div>
    </section>
  );
}
