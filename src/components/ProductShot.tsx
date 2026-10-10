import { Photo, Placeholder } from "@/components/Placeholder";
import type { Product } from "@/data/products";

// Shot 0 is the main image, shot 1 the hover/second view.
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
  shot: 0 | 1;
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
      tone={product.tones[shot]}
      code={product.code}
      label={shot === 0 ? "Front" : "Back"}
      overlay={overlay}
      compact={compact}
      className={className}
    />
  );
}
