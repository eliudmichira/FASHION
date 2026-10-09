import type { Tone } from "@/data/products";

const toneClass: Record<Tone, string> = {
  concrete: "bg-concrete text-ink",
  stone: "bg-stone text-ink",
  soot: "bg-soot text-bone",
};

// Stand-in for a product or campaign photo. Swap for <Image> when the shoot is in.
export function Placeholder({
  tone,
  code,
  label,
  overlay = false,
  compact = false,
  className = "",
}: {
  tone: Tone;
  code: string;
  label: string;
  // Stacks on top of a sibling (hover swap) instead of taking up its own space.
  overlay?: boolean;
  // Thumbnail size: code tag only.
  compact?: boolean;
  className?: string;
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
            className="display pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center text-[clamp(4rem,14vw,11rem)] opacity-15"
          >
            {code.replace("DZ/", "")}
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
