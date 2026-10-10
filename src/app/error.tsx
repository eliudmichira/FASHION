"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="px-4 py-24 md:px-6">
      <h1 className="display text-[clamp(4.5rem,16vw,12rem)]">That didn&apos;t load.</h1>
      <p className="mt-4 max-w-md text-dim">Something broke on our side while loading this page. Your bag is safe.</p>
      <button type="button" onClick={reset} className="mt-8 min-h-12 px-5 font-semibold border-2 border-chalk bg-chalk text-void hover:bg-void hover:text-chalk">
        Try again
      </button>
    </div>
  );
}
