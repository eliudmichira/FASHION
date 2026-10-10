import Link from "next/link";
import { site } from "@/data/site";
import { wordmarkSize } from "@/lib/wordmark";

// Cached at build time; the year only needs to be as fresh as the last deploy.
async function copyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await copyrightYear();
  return (
    <footer className="overflow-hidden border-t-2 border-chalk bg-void text-chalk">
      <div className="flex flex-col gap-8 px-4 pb-6 pt-14 md:flex-row md:items-end md:justify-between md:px-6">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-1">
          <Link href="/shop" className="flex min-h-11 min-w-11 items-center font-semibold hover:underline">
            Shop
          </Link>
          <Link href="/#drop" className="flex min-h-11 min-w-11 items-center font-semibold hover:underline">
            {site.nextDrop.name}
          </Link>
          <Link href="/#lookbook" className="flex min-h-11 min-w-11 items-center font-semibold hover:underline">
            Lookbook
          </Link>
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 min-w-11 items-center font-semibold hover:underline"
          >
            Instagram<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </nav>
        <div className="flex flex-col gap-1 md:items-end">
          <p className="script text-3xl">{site.tagline}</p>
          <p className="text-sm text-dim">
          © {year} {site.name} / {site.domain}
          </p>
        </div>
      </div>
      <p
        aria-hidden
        style={{ fontSize: wordmarkSize(88, 22.5) }}
        className="display -mb-[0.08em] select-none whitespace-nowrap text-center leading-[0.8]"
      >
        {site.name}
      </p>
    </footer>
  );
}
