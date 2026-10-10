import Link from "next/link";
import { ProductShot } from "@/components/ProductShot";
import type { Product } from "@/data/products";
import { formatKsh } from "@/lib/format";

export function ProductCard({
  product,
  large = false,
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw",
}: {
  product: Product;
  large?: boolean;
  sizes?: string;
}) {
  const soldOut = product.sizes.every((s) => !s.inStock);
  return (
    <Link
      href={`/product/${product.slug}`}
      data-cursor="View"
      className={`group ${large ? "flex h-full flex-col" : "block"}`}
    >
      <div className={`relative overflow-hidden ${large ? "aspect-[3/4] lg:aspect-auto lg:flex-1" : "aspect-[3/4]"}`}>
        <ProductShot product={product} shot={0} sizes={large ? "(min-width: 1024px) 50vw, 100vw" : sizes} className="h-full" />
        {/* The second view (back, or a close-up of the print) wipes up over the first on hover. */}
        <ProductShot
          product={product}
          shot={1}
          overlay
          sizes={large ? "(min-width: 1024px) 50vw, 100vw" : sizes}
          className="[clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none"
        />
        <span className="absolute left-2 top-2 bg-void px-1.5 py-0.5 text-xs font-semibold text-chalk">{product.code}</span>
      </div>
      <div className="flex flex-col gap-0.5 pt-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className={`font-semibold leading-tight group-hover:underline ${large ? "text-xl" : ""}`}>{product.name}</p>
          <p className="text-sm text-dim">
            {product.category}
            {soldOut ? " / Sold out" : ""}
          </p>
        </div>
        <p className="shrink-0 font-semibold">{formatKsh(product.price)}</p>
      </div>
    </Link>
  );
}
