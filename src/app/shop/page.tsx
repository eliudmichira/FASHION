import type { Metadata } from "next";
import { ShopGrid } from "@/components/ShopGrid";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "Shop" };

export default function ShopPage() {
  return (
    <div className="px-4 pb-24 pt-8 md:px-6">
      <h1 className="display text-[clamp(5rem,22vw,18rem)]">Shop</h1>
      <p className="mb-8 mt-2 max-w-md text-muted">
        Everything from {site.currentDrop}. Unisex sizing across the range.
      </p>
      <ShopGrid />
    </div>
  );
}
