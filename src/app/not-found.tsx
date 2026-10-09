import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-4 py-24 md:px-6">
      <p className="text-sm font-semibold">404</p>
      <h1 className="display mt-2 text-[clamp(4.5rem,16vw,12rem)]">Not on the rail.</h1>
      <p className="mt-4 max-w-md text-muted">This page doesn&apos;t exist, or the piece has been pulled from the shop.</p>
      <Link href="/shop" className="mt-8 inline-flex min-h-12 items-center bg-ink px-5 font-semibold text-bone">
        Back to the shop
      </Link>
    </div>
  );
}
