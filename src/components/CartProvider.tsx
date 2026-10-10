"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { getProduct } from "@/data/products";

export type CartLine = { slug: string; size: string; qty: number };

// "loading" until the saved bag is read; "unsaved" when this browser blocks storage.
type CartStatus = "loading" | "ready" | "unsaved";

type CartContextValue = {
  lines: CartLine[];
  status: CartStatus;
  count: number;
  subtotal: number;
  isOpen: boolean;
  bump: number;
  open: () => void;
  close: () => void;
  add: (slug: string, size: string) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  remove: (slug: string, size: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ci-bag";
const MAX_QTY = 10;

// The saved bag lives in localStorage, read through useSyncExternalStore so the
// server render (no storage) shows "loading" and the browser fills it in.
type Saved = { lines: CartLine[]; status: CartStatus };
const SERVER: Saved = { lines: [], status: "loading" };
let saved: Saved | null = null;
const listeners = new Set<() => void>();

function readSaved(): Saved {
  if (saved) return saved;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const lines = Array.isArray(parsed) ? (parsed as CartLine[]).filter((l) => getProduct(l?.slug)) : [];
    saved = { lines, status: "ready" };
  } catch {
    saved = { lines: [], status: "unsaved" };
  }
  return saved;
}

function writeLines(update: (prev: CartLine[]) => CartLine[]) {
  const current = readSaved();
  let status = current.status;
  const lines = update(current.lines);
  if (status === "ready") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      status = "unsaved";
    }
  }
  saved = { lines, status };
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { lines, status } = useSyncExternalStore(subscribe, readSaved, () => SERVER);
  const [isOpen, setIsOpen] = useState(false);
  const [bump, setBump] = useState(0);

  const add = useCallback((slug: string, size: string) => {
    writeLines((prev) => {
      const hit = prev.find((l) => l.slug === slug && l.size === size);
      if (hit) {
        return prev.map((l) => (l === hit ? { ...l, qty: Math.min(l.qty + 1, MAX_QTY) } : l));
      }
      return [...prev, { slug, size, qty: 1 }];
    });
    setBump((b) => b + 1);
    setIsOpen(true);
  }, []);

  const setQty = useCallback((slug: string, size: string, qty: number) => {
    writeLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.slug === slug && l.size === size))
        : prev.map((l) =>
            l.slug === slug && l.size === size ? { ...l, qty: Math.min(qty, MAX_QTY) } : l,
          ),
    );
  }, []);

  const remove = useCallback((slug: string, size: string) => {
    writeLines((prev) => prev.filter((l) => !(l.slug === slug && l.size === size)));
  }, []);

  const clear = useCallback(() => writeLines(() => []), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((sum, l) => sum + (getProduct(l.slug)?.price ?? 0) * l.qty, 0);
    return {
      lines,
      status,
      count,
      subtotal,
      isOpen,
      bump,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQty,
      remove,
      clear,
    };
  }, [lines, status, isOpen, bump, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export const CART_MAX_QTY = MAX_QTY;
