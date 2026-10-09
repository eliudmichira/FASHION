import Link from "next/link";
import { Placeholder } from "@/components/Placeholder";
import type { Product } from "@/data/products";
import { formatKsh } from "@/lib/format";

export function ProductCard({ product, large = false }: { product: Product; large?: boolean }) {
  const soldOut = product.sizes.every((s) => !s.inStock);
  return (
    <Link
      href={`/product/${product.slug}`}
      data-cursor="View"
      className={`group ${large ? "flex h-full flex-col" : "block"}`}
    >
      <div className={`relative overflow-hidden ${large ? "aspect-[4/5] sm:aspect-[3/2] lg:aspect-auto lg:flex-1" : ""}`}>
        <Placeholder
          tone={product.tones[0]}
          code={product.code}
          label="Front"
          className={large ? "h-full" : "aspect-[4/5]"}
        />
        {/* Second shot wipes up over the first on hover, like flipping a hanger. */}
        <Placeholder
          tone={product.tones[1]}
          code={product.code}
          label="On model"
          overlay
          className="[clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none"
        />
      </div>
      <div className="flex flex-col gap-0.5 pt-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className={`font-semibold leading-tight group-hover:underline ${large ? "text-xl" : ""}`}>{product.name}</p>
          <p className="text-sm text-muted">
            {product.category}
            {soldOut ? " / Sold out" : ""}
          </p>
        </div>
        <p className="shrink-0 font-semibold">{formatKsh(product.price)}</p>
      </div>
    </Link>
  );
}
