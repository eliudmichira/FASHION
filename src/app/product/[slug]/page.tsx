import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductShot } from "@/components/ProductShot";
import { ProductView } from "@/components/ProductView";
import { getProduct, products } from "@/data/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return { title: product?.name ?? "Not found" };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 4);

  return (
    <>
      <div className="wrap grid gap-8 px-4 pt-6 md:px-6 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
        {/* Phones swipe through the photos so size and price stay near the top; wide screens lay them out two across. */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 md:-mx-6 md:px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0">
          {Array.from({ length: Math.max(2, product.photos?.length ?? 0) }, (_, shot) => (
            <ProductShot
              key={shot}
              product={product}
              shot={shot}
              priority={shot === 0}
              sizes="(min-width: 1600px) 470px, (min-width: 1024px) 29vw, 82vw"
              className="aspect-[3/4] w-[82%] shrink-0 snap-center lg:w-auto"
            />
          ))}
        </div>
        <ProductView product={product} />
      </div>

      <section aria-labelledby="related-title" className="wrap px-4 py-20 md:px-6">
        <h2 id="related-title" className="display border-b-2 border-chalk pb-3 text-[clamp(3rem,8vw,6rem)] md:t-d2">
          Wear it with
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-4">
          {related.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
