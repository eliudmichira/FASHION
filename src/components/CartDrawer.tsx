"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CART_MAX_QTY, useCart } from "@/components/CartProvider";
import { Placeholder } from "@/components/Placeholder";
import { getProduct } from "@/data/products";
import { site } from "@/data/site";
import { formatKsh } from "@/lib/format";
import { useDialog } from "@/lib/use-dialog";

export function CartDrawer() {
  const { isOpen, close } = useCart();
  return (
    <AnimatePresence>
      {isOpen && <Drawer onClose={close} />}
    </AnimatePresence>
  );
}

function Drawer({ onClose }: { onClose: () => void }) {
  const { lines, status, subtotal, count, setQty, remove } = useCart();
  const ref = useDialog(true, onClose);

  return (
    <div className="fixed inset-0 z-50">
      <motion.button
        type="button"
        aria-label="Close bag"
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-ink/60 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bone"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
      >
        <div className="flex items-center justify-between border-b-2 border-ink px-4 py-3">
          <h2 id="bag-title" className="display text-4xl">
            Bag <span className="text-muted">/ {count}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 px-3 font-semibold underline-offset-4 hover:underline"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4" data-lenis-prevent>
          {status === "loading" && <p className="py-10 text-muted">Loading your bag…</p>}

          {status !== "loading" && lines.length === 0 && (
            <div className="py-12">
              <p className="display text-6xl">Nothing in here yet.</p>
              <p className="mt-3 text-muted">Pick a size on any piece and it lands here.</p>
              <Link
                href="/shop"
                onClick={onClose}
                className="mt-6 inline-flex min-h-11 items-center bg-ink px-5 font-semibold text-bone"
              >
                Shop {site.currentDrop}
              </Link>
            </div>
          )}

          <ul>
            {lines.map((line) => {
              const product = getProduct(line.slug);
              if (!product) return null;
              return (
                <li key={`${line.slug}-${line.size}`} className="flex gap-4 border-b border-ink/20 py-4">
                  <Link href={`/product/${product.slug}`} onClick={onClose} className="w-24 shrink-0">
                    <Placeholder tone={product.tones[0]} code={product.code} label="Front" compact className="aspect-[4/5]" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={onClose}
                        className="font-semibold leading-tight hover:underline"
                      >
                        {product.name}
                      </Link>
                      <span className="shrink-0 font-semibold">{formatKsh(product.price * line.qty)}</span>
                    </div>
                    <span className="text-sm text-muted">Size {line.size}</span>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border-2 border-ink">
                        <button
                          type="button"
                          aria-label={`One less ${product.name}, size ${line.size}`}
                          onClick={() => setQty(line.slug, line.size, line.qty - 1)}
                          className="h-11 w-11 text-lg font-bold hover:bg-ink hover:text-bone"
                        >
                          −
                        </button>
                        <span aria-live="polite" className="w-8 text-center font-semibold">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`One more ${product.name}, size ${line.size}`}
                          disabled={line.qty >= CART_MAX_QTY}
                          onClick={() => setQty(line.slug, line.size, line.qty + 1)}
                          className="h-11 w-11 text-lg font-bold hover:bg-ink hover:text-bone disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.slug, line.size)}
                        className="min-h-11 px-2 text-sm font-semibold underline underline-offset-4"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t-2 border-ink px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          {status === "unsaved" && (
            <p role="status" className="mb-3 text-sm text-error">
              This browser is blocking storage, so your bag clears when you close the tab.
            </p>
          )}
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Subtotal</span>
            <span className="display text-4xl">{formatKsh(subtotal)}</span>
          </div>
          <p className="mt-1 text-sm text-muted">Delivery is worked out at checkout.</p>
          {/* TODO: point this at Shopify checkout once the store is connected. */}
          <button
            type="button"
            disabled
            aria-describedby="checkout-note"
            className="mt-4 min-h-12 w-full bg-ink font-semibold text-bone opacity-50"
          >
            Checkout
          </button>
          <p id="checkout-note" className="mt-2 text-center text-sm text-muted">
            Coming soon: checkout opens when the store goes live.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
