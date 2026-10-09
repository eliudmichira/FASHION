"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { registerLenis } from "@/lib/scroll-lock";

// Weighted scroll that the pinned lookbook and velocity marquee read from.
// Off for anyone who asks the OS for reduced motion.
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.12 });
    registerLenis(lenis);
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    // Same-page hash links (e.g. "/#drop" while on "/") glide with Lenis.
    // preventDefault tells Next's Link to skip its own scroll, so only one runs.
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href*='#']");
      if (!link) return;
      const url = new URL(link.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const target = document.querySelector<HTMLElement>(url.hash);
      if (!target) return;
      e.preventDefault();
      history.pushState(null, "", url.hash);
      // A link inside the mobile menu fires while the menu still holds the
      // scroll lock, so wait for the lock to lift before gliding.
      const go = () => {
        if (lenis.isStopped) return void requestAnimationFrame(go);
        const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
        // Absolute position from the real scrollY: Lenis's own idea of the
        // current scroll can lag after the browser restores a position on reload.
        lenis.scrollTo(target.getBoundingClientRect().top + window.scrollY - header);
      };
      go();
    }
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      cancelAnimationFrame(frame);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);
  return null;
}
