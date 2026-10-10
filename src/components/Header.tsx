"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/components/CartProvider";
import { Logo } from "@/components/Logo";
import { site } from "@/data/site";
import { useDialog } from "@/lib/use-dialog";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/#drop", label: site.nextDrop.name },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-[var(--header-h)] border-b-2 border-chalk bg-void">
      <div className="wrap flex h-full items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex min-h-11 min-w-11 items-center gap-3" aria-label={`${site.name}, home`}>
          {/* At this size the mark's line is about 2px, the same as the header rule. */}
          <Logo className="h-8 w-auto" />
          <span className="display hidden text-[16px] sm:inline">{site.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className="flex min-h-11 min-w-11 items-center px-3 font-semibold underline-offset-[6px] hover:underline aria-[current=page]:underline"
            >
              {l.label}
            </Link>
          ))}
          <BagButton />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <BagButton />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
            className="min-h-11 px-3 font-semibold"
          >
            Menu
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && <MobileMenu pathname={pathname} onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}

function BagButton() {
  const { count, open, bump } = useCart();
  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
      className="flex min-h-11 items-center gap-2 px-3 font-semibold"
    >
      Bag
      {/* One of the logo's rings; it fills in (inverts) once something is in the bag. */}
      <motion.span
        key={bump}
        aria-hidden
        initial={bump ? { scale: 1.5 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className={`grid h-6 min-w-6 place-items-center rounded-full border-2 border-chalk px-1 text-xs font-bold ${
          count ? "bg-chalk text-void" : ""
        }`}
      >
        {count}
      </motion.span>
    </button>
  );
}

function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const ref = useDialog(true, onClose);
  return (
    <motion.div
      ref={ref}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="on-studio fixed inset-0 z-50 flex flex-col bg-studio text-void md:hidden"
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
    >
      <div className="flex h-[var(--header-h)] items-center justify-between border-b-2 border-void px-4">
        <Logo className="h-8 w-auto" />
        <button type="button" onClick={onClose} className="min-h-11 px-3 font-semibold">
          Close
        </button>
      </div>
      <nav aria-label="Main" className="flex flex-1 flex-col justify-center gap-3 px-4">
        {[{ href: "/", label: "Home" }, ...links].map((l, i) => (
          <motion.div
            key={l.href}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.2, ease: "linear" }}
          >
            <Link
              href={l.href}
              onClick={onClose}
              aria-current={pathname === l.href ? "page" : undefined}
              className="display block py-1 text-[clamp(3rem,16vw,5.5rem)] aria-[current=page]:underline aria-[current=page]:decoration-4 aria-[current=page]:underline-offset-8"
            >
              {l.label}
            </Link>
          </motion.div>
        ))}
      </nav>
      <p className="script px-4 pb-8 text-3xl">{site.tagline}</p>
    </motion.div>
  );
}
