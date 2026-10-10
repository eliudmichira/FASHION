import Link from "next/link";
import { DropSection } from "@/components/DropSection";
import { Hero } from "@/components/Hero";
import { Lookbook } from "@/components/Lookbook";
import { Marquee } from "@/components/Marquee";
import { ProductCard } from "@/components/ProductCard";
import { Statement } from "@/components/Statement";
import { products } from "@/data/products";
import { site } from "@/data/site";

export default function Home() {
  // The hero shows #001 from the back; New in leads with its front.
  const [lead, ...rest] = products;
  return (
    <>
      <Hero />
      <div className="mt-10 md:mt-16">
        <Marquee
          items={[site.name, `${site.currentDrop} out now`, "Unisex", "All sizes", site.tagline, `${site.nextDrop.name} loading`]}
        />
      </div>
      <Lookbook />

      <section aria-labelledby="new-title" className="wrap px-4 py-16 md:px-6 md:py-24">
        <div className="flex items-end justify-between gap-4 border-b-2 border-chalk pb-3">
          <h2 id="new-title" className="display text-[clamp(3.5rem,10vw,8rem)] md:t-d2">
            New in
          </h2>
          <Link href="/shop" className="flex min-h-11 items-center font-semibold underline underline-offset-4">
            All {products.length} pieces
          </Link>
        </div>
        {/* Lead piece takes the left half on wide screens; the rest fill a tighter grid. */}
        <div className="mt-6 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:row-span-2">
            <ProductCard product={lead} large />
          </div>
          {rest.slice(0, 4).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <Statement text="Unisex. All sizes. Priced in shillings." closer={`${site.tagline}.`} />
      <DropSection />
    </>
  );
}
