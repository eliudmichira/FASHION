"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/data/products";
import { formatKsh } from "@/lib/format";

export function ProductView({ product }: { product: Product }) {
  const id = useId();
  const { add } = useCart();
  const oneSize = product.sizes.length === 1;
  const [size, setSize] = useState<string | null>(oneSize ? product.sizes[0].label : null);
  const [error, setError] = useState(false);
  const soldOut = product.sizes.every((s) => !s.inStock);

  function onAdd() {
    if (!size) {
      setError(true);
      document.getElementById(`${id}-sizes`)?.focus();
      return;
    }
    add(product.slug, size);
  }

  return (
    <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
      <span className="inline-block border-2 border-chalk px-2 py-0.5 text-sm font-semibold">{product.code}</span>
      <h1 className="display mt-3 text-[clamp(3.5rem,8vw,7rem)]">{product.name}</h1>
      <p className="mt-3 text-3xl font-bold tabular-nums">{formatKsh(product.price)}</p>
      <p className="mt-4 max-w-md leading-relaxed">{product.description}</p>

      {!oneSize && (
        <fieldset className="mt-8">
          <legend className="font-semibold">Size</legend>
          {product.model && (
            <p className="text-sm text-dim">
              {product.model.name} is {product.model.height} and wears a size {product.model.size}.
            </p>
          )}
          <div
            id={`${id}-sizes`}
            tabIndex={-1}
            role="radiogroup"
            aria-describedby={error ? `${id}-error` : undefined}
            className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6"
          >
            {product.sizes.map((s) => (
              <button
                key={s.label}
                type="button"
                role="radio"
                aria-checked={size === s.label}
                aria-label={s.inStock ? s.label : `${s.label}, sold out`}
                disabled={!s.inStock}
                onClick={() => {
                  setSize(s.label);
                  setError(false);
                }}
                className="min-h-12 border-2 border-chalk font-semibold hover:bg-chalk/10 aria-checked:bg-chalk aria-checked:text-void disabled:border-chalk/30 disabled:text-dim disabled:line-through disabled:hover:bg-transparent"
              >
                {s.label}
              </button>
            ))}
          </div>
          {error && (
            <p id={`${id}-error`} role="alert" className="mt-2 border-2 border-chalk px-3 py-2 font-semibold">
              Pick a size first.
            </p>
          )}
        </fieldset>
      )}

      <motion.button
        type="button"
        onClick={onAdd}
        disabled={soldOut}
        whileTap={{ scale: 0.97 }}
        className="mt-6 min-h-14 w-full text-lg font-semibold border-2 border-chalk bg-chalk text-void hover:bg-void hover:text-chalk disabled:opacity-50"
      >
        {soldOut ? "Sold out" : size ? `Add ${size} to bag` : "Add to bag"}
      </motion.button>

      <div className="mt-8 border-t-2 border-chalk">
        {product.details.map((d) => (
          <details key={d.title} className="group border-b border-chalk/30">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-semibold [&::-webkit-details-marker]:hidden">
              {d.title}
              <span aria-hidden className="text-xl transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="pb-4 text-dim">{d.body}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
