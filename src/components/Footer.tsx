import Link from "next/link";
import { site } from "@/data/site";

// Cached at build time; the year only needs to be as fresh as the last deploy.
async function copyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer() {
  const year = await copyrightYear();
  return (
    <footer className="on-ink overflow-hidden bg-ink text-bone">
      <div className="flex flex-col gap-8 px-4 pb-6 pt-14 md:flex-row md:items-end md:justify-between md:px-6">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-1">
          <Link href="/shop" className="flex min-h-11 min-w-11 items-center font-semibold hover:text-acid">
            Shop
          </Link>
          <Link href="/#drop" className="flex min-h-11 min-w-11 items-center font-semibold hover:text-acid">
            {site.nextDrop.name}
          </Link>
          <Link href="/#lookbook" className="flex min-h-11 min-w-11 items-center font-semibold hover:text-acid">
            Lookbook
          </Link>
        </nav>
        <p className="text-sm text-muted-on-ink">
          © {year} {site.name} / {site.domain}
        </p>
      </div>
      <p
        aria-hidden
        className="display -mb-[0.12em] select-none whitespace-nowrap text-center text-[22.5vw] leading-[0.8]"
      >
        {site.name}
      </p>
    </footer>
  );
}
