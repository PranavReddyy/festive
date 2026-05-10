import Link from "next/link";
import { Suspense } from "react";
import { EventList } from "@/components/events/EventList";
import { EventFilterSidebar } from "@/components/events/EventFilterSidebar";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Marquee />
      <section
        id="events"
        className="mx-auto max-w-5xl px-6 lg:px-10 pt-20 pb-24 overflow-hidden"
      >
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 border-b border-border pb-8">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground mb-3">
              Now showing
            </p>
            <h2 className="font-display text-4xl md:text-5xl leading-[1.02]">
              Upcoming, in your{" "}
              <em className="italic font-display">orbit</em>.
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm md:text-right">
            Hand-picked experiences from organisers we trust. Updated daily.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start overflow-hidden">
            <EventFilterSidebar />
          </aside>
          <div className="min-w-0">
            <Suspense fallback={null}>
              <EventList />
            </Suspense>
          </div>
        </div>
      </section>

      <CallToAction />
    </div>
  );
}

function Hero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-24 lg:pt-32 lg:pb-32">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground mb-8">
          Issue 01 — Spring &rsquo;26
        </p>

        <h1 className="font-display text-[clamp(3rem,9vw,8.5rem)] leading-[0.95] tracking-tighter text-balance max-w-[14ch]">
          Find the rooms{" "}
          <em className="italic font-display">worth</em> showing up for.
        </h1>

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:items-end">
          <p className="text-base lg:text-lg text-muted-foreground max-w-md leading-relaxed text-pretty">
            Festive is a quieter marketplace for live events — curated by people
            who care, ad-free, and built for the evenings worth remembering.
          </p>

          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button size="lg" asChild>
              <Link href="#events">
                Browse events
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register?role=organiser">Host an event</Link>
            </Button>
          </div>
        </div>

        {/* hairline metrics */}
        <dl className="mt-20 grid grid-cols-2 md:grid-cols-4 border-t border-border">
          {[
            { k: "Curated cities", v: "12" },
            { k: "Hosts on the platform", v: "240+" },
            { k: "Events this season", v: "85" },
            { k: "Average seats remaining", v: "32%" },
          ].map((m) => (
            <div
              key={m.k}
              className="border-r last:border-r-0 border-border py-6 first:pl-0 px-6 first:px-0"
            >
              <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {m.k}
              </dt>
              <dd className="font-display text-3xl mt-2">{m.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Festivals",
    "Concerts",
    "Conferences",
    "Workshops",
    "Listening rooms",
    "Exhibitions",
    "Talks",
    "Meetups",
  ];
  return (
    <section className="border-b border-border py-6 marquee-mask overflow-hidden">
      <div className="flex gap-12 whitespace-nowrap font-display text-2xl text-muted-foreground/80 animate-[marquee_40s_linear_infinite]">
        {[...items, ...items, ...items].map((it, i) => (
          <span key={i} className="inline-flex items-center gap-12">
            <span className="italic">{it}</span>
            <span aria-hidden className="text-muted-foreground/40 font-sans">
              +
            </span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }`}</style>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32 grid gap-10 md:grid-cols-2 md:items-end">
        <h2 className="font-display text-5xl lg:text-6xl leading-[1.02] tracking-tight max-w-[14ch] text-background">
          Hosting something{" "}
          <em className="italic font-display">remarkable</em>?
        </h2>
        <div className="space-y-6 max-w-md md:justify-self-end">
          <p className="text-[15px] leading-relaxed text-background/70 text-pretty">
            Festive is invite-and-application based. We work with organisers
            who treat their attendees the way we do — with intention.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-background text-foreground hover:bg-background/90"
          >
            <Link href="/register?role=organiser">
              Apply to host
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
