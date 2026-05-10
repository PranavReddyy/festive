import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "How it works — Festive",
  description:
    "Festive is a quieter marketplace for live events. Here is how the platform works for attendees and organisers.",
};

export default function HowItWorksPage() {
  return (
    <article className="pb-32">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <p className="eyebrow mb-8">A short manual</p>
          <h1 className="font-display text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.96] tracking-tighter text-balance">
            How Festive works.
          </h1>
          <p className="mt-10 text-[15px] lg:text-base text-muted-foreground max-w-lg leading-relaxed">
            One job: connect organisers hosting evenings worth remembering with
            people who want to be there. No noise, no infinite feed, no bidding
            wars.
          </p>
        </div>
      </section>

      {/* ── For attendees ─────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-24 lg:py-28">
          <p className="eyebrow mb-6">For attendees</p>
          <h2 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-tight max-w-[22ch]">
            Three steps from curious to in the room.
          </h2>
          <ol className="mt-16 grid gap-px bg-border border border-border md:grid-cols-3">
            {[
              {
                n: "01",
                h: "Browse honestly",
                p: "Every event is hand-listed by its organiser. No ads, no boosted placements. What you see is ranked by date.",
              },
              {
                n: "02",
                h: "Reserve a seat",
                p: "Pick a tier, confirm, and we issue a QR ticket instantly. No middleman fees. Works offline in My tickets.",
              },
              {
                n: "03",
                h: "Show up",
                p: "The organiser scans your code at the door. No email digests, no data sold, no surprise charges at checkout.",
              },
            ].map((s) => (
              <li key={s.n} className="bg-background p-8 lg:p-10 space-y-4">
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                  {s.n}
                </span>
                <h3 className="font-display text-[1.375rem] leading-snug">{s.h}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {s.p}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── For organisers ────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-24 lg:py-28">
          <p className="eyebrow mb-6">For organisers</p>
          <h2 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-tight max-w-[22ch]">
            Tools that get out of your way.
          </h2>
          <ol className="mt-16 grid gap-px bg-border border border-border sm:grid-cols-2">
            {[
              {
                n: "01",
                h: "List in minutes",
                p: "Title, venue, date, a few lines. Add tiered tickets with capacities and prices. Save as draft, publish when ready.",
              },
              {
                n: "02",
                h: "Sell with clarity",
                p: "Live capacity and low-stock signals appear automatically. Attendees see what's left; you see who's coming and who's paid.",
              },
              {
                n: "03",
                h: "Run the door",
                p: "Open the in-app QR scanner, point at codes, get a confirmation. Manual entry too. No external hardware needed.",
              },
              {
                n: "04",
                h: "Read the room",
                p: "Revenue over time, sold by tier, per-event check-in rates, and a live roster with search and restrict controls.",
              },
            ].map((s) => (
              <li key={s.n} className="bg-background p-8 lg:p-10 space-y-4">
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                  {s.n}
                </span>
                <h3 className="font-display text-[1.375rem] leading-snug">{s.h}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {s.p}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Principles ────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-24 lg:py-28">
          <p className="eyebrow mb-6">What we don&rsquo;t do</p>
          <h2 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-tight max-w-[18ch]">
            A few deliberate absences.
          </h2>
          <dl className="mt-16 grid gap-px bg-border border border-border md:grid-cols-2">
            {[
              {
                k: "No surge pricing",
                v: "Tickets cost what the organiser sets. Demand does not inflate the price at checkout.",
              },
              {
                k: "No ad slots",
                v: "Nobody pays for placement. Every listing is shown on its own merit.",
              },
              {
                k: "No data resale",
                v: "Your purchase history stays between you, your organiser, and the door.",
              },
              {
                k: "No infinite feed",
                v: "We list what is actually upcoming. When the calendar is light, it looks light.",
              },
            ].map((p) => (
              <div key={p.k} className="bg-background p-8 lg:p-10 space-y-3">
                <dt className="font-display text-xl leading-snug">{p.k}</dt>
                <dd className="text-[13px] text-muted-foreground leading-relaxed">
                  {p.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-24 lg:py-28">
          <p className="eyebrow mb-6">Numbers</p>
          <h2 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-tight">
            Plain-spoken pricing.
          </h2>
          <dl className="mt-16 grid gap-px bg-border border border-border md:grid-cols-3">
            {[
              { k: "Listing an event", v: "Free", sub: null },
              { k: "Per ticket fee", v: "2%", sub: "capped at ₹40" },
              { k: "Refunds", v: "Up to 24h", sub: "before doors" },
            ].map((s) => (
              <div key={s.k} className="bg-background p-8 lg:p-10">
                <dt className="eyebrow mb-5">{s.k}</dt>
                <dd className="font-display text-5xl leading-none">{s.v}</dd>
                {s.sub && (
                  <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {s.sub}
                  </p>
                )}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="bg-foreground">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-24 lg:py-32">
          <p
            className="mb-6"
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "oklch(0.985 0.004 80 / 0.55)",
            }}
          >
            Ready when you are
          </p>
          <h2 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.97] tracking-tighter text-background max-w-[18ch]">
            Pick a side of the door.
          </h2>
          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-md text-[13px] font-medium bg-background text-foreground hover:bg-background/90 transition-colors"
            >
              Browse events <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/register?role=organiser"
              className="inline-flex items-center h-11 px-6 rounded-md text-[13px] font-medium border text-background hover:bg-background/10 transition-colors"
              style={{ borderColor: "oklch(0.985 0.004 80 / 0.35)" }}
            >
              Host an event
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
