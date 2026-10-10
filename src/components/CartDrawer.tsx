"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CART_MAX_QTY, useCart } from "@/components/CartProvider";
import { MpesaCheckout, type PaidOrder } from "@/components/MpesaCheckout";
import { ProductShot } from "@/components/ProductShot";
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
  const [paid, setPaid] = useState<PaidOrder | null>(null);
  const onPaid = useCallback((order: PaidOrder) => setPaid(order), []);

  return (
    <div className="fixed inset-0 z-50">
      <motion.button
        type="button"
        aria-label="Close bag"
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-void/70"
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
        className="on-studio absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-studio text-void"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
      >
        <div className="flex items-center justify-between border-b-2 border-void px-4 py-3">
          <h2 id="bag-title" className="display text-4xl md:t-d4">
            Bag <span className="text-dim-studio">/ {count}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 px-3 font-semibold underline-offset-4 hover:underline"
          >
            Close
          </button>
        </div>

        {paid ? (
          <div role="status" className="flex-1 overflow-y-auto px-4 py-10">
            <p className="display text-6xl md:t-d3">{paid.review ? "Payment received." : "Paid. Thank you."}</p>
            {paid.review ? (
              <p className="mt-4">
                M-Pesa took {formatKsh(paid.amount)} and we&apos;re double-checking the order. We&apos;ll call {paid.phone}{" "}
                shortly.
              </p>
            ) : (
              <>
                <p className="mt-4">
                  {formatKsh(paid.amount)} paid with M-Pesa.{" "}
                  {paid.receipt ? (
                    <>
                      Receipt <strong>{paid.receipt}</strong>.
                    </>
                  ) : (
                    "Your M-Pesa SMS has the receipt number."
                  )}
                </p>
                <p className="mt-2">We&apos;ll call {paid.phone} to arrange delivery.</p>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-8 inline-flex min-h-12 items-center border-2 border-void bg-void px-5 font-semibold text-chalk hover:bg-studio hover:text-void"
            >
              Keep shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4" data-lenis-prevent>
              {status === "loading" && <p className="py-10 text-dim-studio">Loading your bag…</p>}

              {status !== "loading" && lines.length === 0 && (
                <div className="py-12">
                  <p className="display text-6xl md:t-d3">Nothing in here yet.</p>
                  <p className="mt-3 text-dim-studio">Pick a size on any piece and it lands here.</p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="mt-6 inline-flex min-h-11 items-center border-2 border-void bg-void px-5 font-semibold text-chalk hover:bg-studio hover:text-void"
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
                    <li key={`${line.slug}-${line.size}`} className="flex gap-4 border-b border-void/25 py-4">
                      <Link href={`/product/${product.slug}`} onClick={onClose} className="w-24 shrink-0">
                        <ProductShot product={product} shot={0} compact sizes="96px" className="aspect-[3/4]" />
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
                        <span className="text-sm text-dim-studio">Size {line.size}</span>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center border-2 border-void">
                            <button
                              type="button"
                              aria-label={`One less ${product.name}, size ${line.size}`}
                              onClick={() => setQty(line.slug, line.size, line.qty - 1)}
                              className="h-11 w-11 text-lg font-bold hover:bg-void hover:text-chalk"
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
                              className="h-11 w-11 text-lg font-bold hover:bg-void hover:text-chalk disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-void"
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

            <div
              className="max-h-[78dvh] overflow-y-auto overscroll-contain border-t-2 border-void px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4"
              data-lenis-prevent
            >
              {status === "unsaved" && (
                <p role="status" className="mb-3 border-2 border-void px-3 py-2 text-sm font-semibold">
                  This browser is blocking storage, so your bag clears when you close the tab.
                </p>
              )}
              {lines.length > 0 ? (
                <dl className="grid grid-cols-[1fr_auto] items-baseline gap-y-1">
                  <dt>Subtotal</dt>
                  <dd className="text-right tabular-nums">{formatKsh(subtotal)}</dd>
                  <dt>Delivery</dt>
                  <dd className="text-right tabular-nums">{formatKsh(site.deliveryFee)}</dd>
                  <dt className="font-semibold">Total</dt>
                  <dd className="text-right text-3xl font-bold tabular-nums">{formatKsh(subtotal + site.deliveryFee)}</dd>
                </dl>
              ) : (
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">Subtotal</span>
                  <span className="text-3xl font-bold tabular-nums">{formatKsh(0)}</span>
                </div>
              )}
              <MpesaCheckout onPaid={onPaid} />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
