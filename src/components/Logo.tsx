// The brand mark, redrawn from the artwork on its own grid: a stepped "#"
// outline over two rings, all on a 31-unit line. Shared by the static mark
// and the intro, which animates the same paths.
export const LOGO_VIEWBOX = "-16 -16 553 642";
export const LOGO_STROKE = 31;
export const LOGO_OUTLINE =
  "M73 0H204V72H317V0H448V72H521V174H448V246H521V348H448V420H317V348H204V420H73V348H0V246H73V174H0V72H73Z";
export const LOGO_HOLE = "M204 174H317V246H204Z";
export const LOGO_RINGS = [
  { cx: 140, cy: 552 },
  { cx: 381, cy: 552 },
];
export const LOGO_RING_R = 58;

export function Logo({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={LOGO_STROKE}
      strokeLinejoin="miter"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d={LOGO_OUTLINE} />
      <path d={LOGO_HOLE} />
      {LOGO_RINGS.map((r) => (
        <circle key={r.cx} cx={r.cx} cy={r.cy} r={LOGO_RING_R} />
      ))}
    </svg>
  );
}
