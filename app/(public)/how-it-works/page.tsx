import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "How it works — Festive",
  description:
    "Festive is a quieter marketplace for live events. Here's how the platform works for attendees and organisers.",
};

export default function HowItWorksPage() {
  return (
    <article className="pb-32">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-20 lg:pt-28 lg:pb-28">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground mb-8">
            A short manual
          </p>
          <h1 className="font-display text-[clamp(2.5rem,8vw,7rem)] leading-[0.96] tracking-tighter text-balance max-w-[16ch]">
            How <em className="italic font-display">Festive</em> works.
          </h1>
          <p className="mt-10 text-base lg:text-lg text-muted-foreground max-w-xl leading-relaxed text-pretty">
            We&rsquo;re an events platform with one job: connect people who
            host evenings worth remembering with people who want to be there.
            No noise, no infinite feed, no bidding wars on tickets.
          </p>
        </div>
      </section>

      {/* For attendees */}
      <Section
        eyebrow="For attendees"
        title={
          <>
            Three steps from <em className="italic font-display">curious</em>{" "}
            to in the room.
          </>
        }
      >
        <Steps
          items={[
            {
              n: "01",
              h: "Browse honestly",
              p: "Every event is hand-listed by its organiser. We don't run ads or boost listings — what you see ranked by date is what's actually happening.",
            },
            {
              n: "02",
              h: "Reserve a seat",
              p: "Pick a tier, sign in, and we issue you a unique QR ticket. No middleman fees. Your ticket lives in My tickets and can be pulled up offline.",
            },
            {
              n: "03",
              h: "Show up",
              p: "At the door, the organiser scans your code. That's it. We don't sell your data, email you weekly digests, or surprise you with charges.",
            },
          ]}
        />
      </Section>

      {/* For organisers */}
      <Section
        eyebrow="For organisers"
        title={
          <>
            Tools that get out of your <em className="italic font-display">way</em>.
          </>
        }
      >
        <Steps
          items={[
            {
              n: "01",
              h: "List in minutes",
              p: "Title, venue, date, a couple of paragraphs. Set up tiered tickets with capacities and prices. Save as a draft, publish when you're ready.",
            },
            {
              n: "02",
              h: "Sell with clarity",
              p: "Live capacity, sold-out states, and low-stock signals show up automatically. Attendees see what's left; you see who's coming and who's paid.",
            },
            {
              n: "03",
              h: "Run the door",
              p: "Open the in-app scanner on your phone, point at QR codes, get a green tick. Manual entry exists too. No external hardware required.",
            },
            {
              n: "04",
              h: "Read the room",
              p: "A simple dashboard: revenue over time, tickets sold per tier, attendees by event, and a clean roster you can export and walk into the venue with.",
            },
          ]}
        />
      </Section>

      {/* Principles */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground mb-8">
            What we don&rsquo;t do
          </p>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight max-w-[18ch] text-balance">
            A few <em className="italic font-display">deliberate</em> absences.
          </h2>
          <dl className="mt-16 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {[
              {
                k: "No surge pricing",
                v: "Tickets cost what the organiser sets. Demand doesn't get to inflate the bill at checkout.",
              },
              {
                k: "No ad slots",
                v: "Nobody pays for placement. Every event is shown on its own merit.",
              },
              {
                k: "No data resale",
                v: "Your purchase history stays between you, your organiser, and the door.",
              },
              {
                k: "No infinite feed",
                v: "We list what's actually upcoming. When the calendar is light, the calendar looks light.",
              },
            ].map((p) => (
              <div
                key={p.k}
                className="border-t border-border pt-6"
              >
                <dt className="font-display text-2xl leading-snug">{p.k}</dt>
                <dd className="mt-2 text-[15px] text-muted-foreground leading-relaxed text-pretty">
                  {p.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Pricing & FAQ */}
      <Section eyebrow="Numbers" title="Plain-spoken pricing.">
        <dl className="grid gap-x-12 gap-y-10 md:grid-cols-3">
          <Stat k="Listing an event" v="Free" />
          <Stat k="Per ticket fee" v="2%" sub="capped at ₹40" />
          <Stat k="Refunds" v="Up to 24h" sub="before doors" />
        </dl>
      </Section>

      {/* CTA */}
      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-32">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-background/60 mb-6">
            Ready when you are
          </p>
          <h2 className="font-display text-[clamp(2.5rem,7vw,6rem)] leading-[0.98] tracking-tighter max-w-[16ch] text-balance">
            Pick a side of the <em className="italic font-display">door</em>.
          </h2>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-background text-foreground hover:bg-background/90"
            >
              <Link href="/">
                Browse events <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-background/40 text-background hover:bg-background/10 hover:text-background"
            >
              <Link href="/register?role=organiser">Host an event</Link>
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 lg:py-28">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground mb-6">
          {eyebrow}
        </p>
        <h2 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight max-w-[20ch] text-balance">
          {title}
        </h2>
        <div className="mt-16">{children}</div>
      </div>
    </section>
  );
}

function Steps({
  items,
}: {
  items: { n: string; h: string; p: string }[];
}) {
  return (
    <ol className="grid gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <li key={s.n} className="border-t border-border pt-6">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
            {s.n}
          </span>
          <h3 className="mt-3 font-display text-2xl leading-snug">{s.h}</h3>
          <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed text-pretty">
            {s.p}
          </p>
        </li>
      ))}
    </ol>
  );
}

function Stat({
  k,
  v,
  sub,
}: {
  k: string;
  v: string;
  sub?: string;
}) {
  return (
    <div className="border-t border-border pt-6">
      <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {k}
      </dt>
      <dd className="mt-3 font-display text-5xl leading-none">{v}</dd>
      {sub && (
        <p className="mt-2 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
}
