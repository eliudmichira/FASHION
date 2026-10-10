import Image from "next/image";
import type { Photo as PhotoData, Tone } from "@/data/products";

const toneClass: Record<Tone, string> = {
  studio: "bg-studio text-void",
  fog: "bg-fog text-void",
  graphite: "bg-graphite text-chalk",
};

type FrameProps = {
  // Stacks on top of a sibling (hover swap) instead of taking up its own space.
  overlay?: boolean;
  className?: string;
};

// Stand-in for a product or campaign photo, until the shoot is in.
export function Placeholder({
  tone,
  code,
  label,
  overlay = false,
  compact = false,
  className = "",
}: FrameProps & {
  tone: Tone;
  code: string;
  label: string;
  // Thumbnail size: code tag only.
  compact?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={`Placeholder photo: ${code} ${label}`}
      className={`${overlay ? "absolute inset-0" : "relative"} flex overflow-hidden ${toneClass[tone]} ${className}`}
    >
      {compact ? (
        <span aria-hidden className="mt-auto p-1.5 text-[10px] font-semibold">
          <span className="border border-current px-1 py-0.5">{code}</span>
        </span>
      ) : (
        <>
          <span
            aria-hidden
            className="display pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center text-[clamp(3rem,10vw,8rem)] opacity-15"
          >
            {code}
          </span>
          <span aria-hidden className="mt-auto flex w-full items-end justify-between gap-2 p-3 text-xs font-semibold">
            <span className="border border-current px-1.5 py-0.5">{code}</span>
            <span>Photo / {label}</span>
          </span>
        </>
      )}
    </div>
  );
}

// A real product shot on the studio grey it was taken against, so the photo's
// edge disappears into the tile.
export function Photo({
  photo,
  sizes,
  priority = false,
  overlay = false,
  className = "",
}: FrameProps & { photo: PhotoData; sizes: string; priority?: boolean }) {
  return (
    <div className={`${overlay ? "absolute inset-0" : "relative"} overflow-hidden bg-studio ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={photo.focus ? { objectPosition: photo.focus } : undefined}
      />
    </div>
  );
}
