import { Photo, Placeholder } from "@/components/Placeholder";
import type { Product } from "@/data/products";

// Shot 0 is the main image, shot 1 the hover/second view, any later ones extra
// product-page views. Placeholder products only have the first two.
export function ProductShot({
  product,
  shot,
  sizes,
  priority,
  overlay,
  compact,
  className = "",
}: {
  product: Product;
  shot: number;
  sizes: string;
  priority?: boolean;
  overlay?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const photo = product.photos?.[shot];
  if (photo) {
    return <Photo photo={photo} sizes={sizes} priority={priority} overlay={overlay} className={className} />;
  }
  return (
    <Placeholder
      tone={product.tones[shot === 0 ? 0 : 1]}
      code={product.code}
      label={shot === 0 ? "Front" : "Back"}
      overlay={overlay}
      compact={compact}
      className={className}
    />
  );
}
