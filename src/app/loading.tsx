export default function Loading() {
  return (
    <div role="status" className="px-4 py-24 md:px-6">
      <p className="display animate-pulse text-[clamp(4rem,14vw,10rem)] md:t-d2 motion-reduce:animate-none">Loading…</p>
      <span className="sr-only">Loading the page</span>
    </div>
  );
}
