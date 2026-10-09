import { Countdown } from "@/components/Countdown";
import { WaitlistForm } from "@/components/WaitlistForm";
import { site } from "@/data/site";

const opens = new Intl.DateTimeFormat("en-KE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Africa/Nairobi",
}).format(new Date(site.nextDrop.opensAt));

export function DropSection() {
  return (
    <section id="drop" aria-labelledby="drop-title" className="on-acid bg-acid px-4 py-16 text-ink md:px-6 md:py-24">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 id="drop-title" className="display text-[clamp(5rem,20vw,16rem)]">
          {site.nextDrop.name}
        </h2>
        <p className="max-w-xs pb-2 font-semibold md:text-right">
          Opens {opens} EAT
          {site.preview && <span className="block text-sm">(placeholder date)</span>}
        </p>
      </div>
      <div className="mt-8">
        <Countdown opensAt={site.nextDrop.opensAt} />
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-end">
        <p className="display text-4xl md:text-6xl">Get the link to {site.nextDrop.name} before it goes public.</p>
        <WaitlistForm />
      </div>
    </section>
  );
}
