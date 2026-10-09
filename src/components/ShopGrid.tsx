"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { categories, products, type Category } from "@/data/products";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export function ShopGrid() {
  const [category, setCategory] = useState<Category | "All">("All");
  const [size, setSize] = useState<string | null>(null);

  const shown = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (!size || p.sizes.some((s) => s.label === size && s.inStock)),
  );

  return (
    <>
      <div className="flex flex-col gap-4 border-b-2 border-ink pb-4 lg:flex-row lg:items-center lg:justify-between">
        <Filter label="Category" options={["All", ...categories]} value={category} onChange={(v) => setCategory(v as Category | "All")} />
        <Filter
          label="In stock in"
          options={sizes}
          value={size}
          onChange={(v) => setSize((cur) => (cur === v ? null : v))}
        />
      </div>

      <p aria-live="polite" className="mt-4 text-sm text-muted">
        {shown.length} {shown.length === 1 ? "piece" : "pieces"}
        {size ? `, size ${size} in stock` : ""}
      </p>

      {shown.length === 0 ? (
        <div className="py-20">
          <p className="display text-6xl md:text-8xl">Nothing here in {size}.</p>
          <p className="mt-3 text-muted">
            {category === "All" ? "Every piece" : `Every ${category.toLowerCase()} piece`} is out in that size right now.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory("All");
              setSize(null);
            }}
            className="mt-6 min-h-12 bg-ink px-5 font-semibold text-bone"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-4 xl:grid-cols-4">
          {shown.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Filter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className="min-h-11 min-w-11 border-2 border-ink px-3 font-semibold hover:bg-ink/10 aria-pressed:bg-ink aria-pressed:text-bone"
        >
          {o}
        </button>
      ))}
    </div>
  );
}
