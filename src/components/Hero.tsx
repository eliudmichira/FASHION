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
  const markScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.8]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="flex justify-between gap-4 px-4 pt-4 text-sm font-semibold md:px-6">
        <span>Unisex streetwear, all sizes</span>
        <span>{site.currentDrop} / out now</span>
      </div>

      <div className="grid gap-8 px-4 pb-4 pt-8 md:px-6 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-12 lg:pt-10">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.div style={{ scale: markScale }} className="origin-bottom lg:origin-bottom-left">
            <Logo title={site.name} className="h-auto w-[min(48vw,18rem)] lg:w-[min(24vw,19rem)]" />
          </motion.div>
          <h1 id="hero-title" className="display mt-6 text-[clamp(1.6rem,6.5vw,3.5rem)] lg:text-[clamp(2rem,3.6vw,3.5rem)]">
            {site.name}
          </h1>
          <p className="script mt-3 text-[clamp(1.75rem,6vw,3rem)]">{site.tagline}</p>

          <div className="mt-8 w-full border-t-2 border-chalk pt-6">
            <p className="display text-4xl md:text-5xl">{site.currentDrop} is out.</p>
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
          className="relative block overflow-hidden"
        >
          <motion.div style={{ y: photoY }} className="scale-[1.1]">
            <ProductShot product={lead} shot={0} priority sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[3/4]" />
          </motion.div>
          <span className="absolute bottom-0 left-0 bg-void px-3 py-2 text-sm font-semibold">
            {lead.code} {lead.name}
          </span>
        </Link>
      </div>
    </section>
  );
}
