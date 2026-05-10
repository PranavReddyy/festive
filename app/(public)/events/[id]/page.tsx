import { notFound } from "next/navigation";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import { TicketTierSelector } from "@/components/events/TicketTierSelector";
import {
  formatLongDate,
  formatTime,
} from "@/lib/utils/date";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

type LoadedEvent = {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  category: string;
  status: string;
  venue: string;
  city: string;
  address: string | null;
  event_date: string;
  ticket_tiers: { id: string; sort_order: number; capacity: number; name: string; description: string | null; price: number; sold?: number; available?: number }[];
};

async function loadEvent(idOrSlug: string): Promise<LoadedEvent | null> {
  const supabase = await createSupabaseRSCClient();
  const isUuid = /^[0-9a-f-]{36}$/i.test(idOrSlug);
  const { data: event } = await supabase
    .from("events_with_availability")
    .select("*, ticket_tiers(*)")
    .eq(isUuid ? "id" : "slug", idOrSlug)
    .maybeSingle();
  if (!event) return null;
  const ev = event as Record<string, unknown> & {
    ticket_tiers?: { id: string; sort_order: number; capacity: number; sold?: number; available?: number }[];
  };

  type Tier = { id: string; sort_order: number; capacity: number; sold?: number; available?: number };
  const tiers = ((ev.ticket_tiers ?? []) as Tier[]).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const tierIds = tiers.map((t) => t.id);
  if (tierIds.length) {
    const { data: ticketRows } = await supabase
      .from("tickets")
      .select("tier_id, status")
      .in("tier_id", tierIds)
      .in("status", ["active", "used"]);
    const sold: Record<string, number> = {};
    ((ticketRows ?? []) as { tier_id: string }[]).forEach((r) => {
      sold[r.tier_id] = (sold[r.tier_id] ?? 0) + 1;
    });
    tiers.forEach((t) => {
      t.sold = sold[t.id] ?? 0;
      t.available = Math.max(0, t.capacity - (sold[t.id] ?? 0));
    });
  }
  return { ...ev, ticket_tiers: tiers } as unknown as LoadedEvent;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.description?.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 200),
      images: event.banner_url ? [event.banner_url] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event) notFound();

  const supabase = await createSupabaseRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let hasExistingTicket = false;
  if (user) {
    const { data: existing } = await supabase
      .from("tickets")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", event.id)
      .in("status", ["active", "used"])
      .maybeSingle();
    hasExistingTicket = !!existing;
  }

  return (
    <article className="pb-24">
      {/* Editorial header: title first, image second */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16 lg:pt-24 pb-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-6">
            {event.category} <span className="mx-2 text-foreground/30">/</span>{" "}
            {event.city}
          </p>
          <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.02] tracking-tight max-w-[18ch] text-balance">
            {event.title}
          </h1>

          <dl className="mt-12 grid grid-cols-2 md:grid-cols-4 border-t border-border">
            <Meta label="Date" value={formatLongDate(event.event_date)} />
            <Meta label="Doors" value={formatTime(event.event_date)} />
            <Meta label="Venue" value={event.venue} />
            <Meta label="City" value={event.city} />
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-16">
        <div className="grid gap-16 lg:grid-cols-[1fr_380px]">
          <div className="max-w-2xl">
            <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-6">
              About
            </h2>
            <div className="font-display text-[1.5rem] leading-[1.4] text-foreground/90 first-letter:font-display first-letter:text-[3.5rem] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.9] first-letter:italic">
              {event.description.split("\n\n")[0]}
            </div>
            {event.description.split("\n\n").slice(1).map((p, i) => (
              <p
                key={i}
                className="mt-6 text-[15px] leading-relaxed text-muted-foreground whitespace-pre-line"
              >
                {p}
              </p>
            ))}

            {event.address && (
              <div className="mt-16 border-t border-border pt-10">
                <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Location
                </h2>
                <p className="font-display text-2xl leading-snug">
                  {event.venue}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {event.address}
                  <br />
                  {event.city}
                </p>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <TicketTierSelector
              eventId={event.id}
              tiers={event.ticket_tiers as unknown as import("@/types").TicketTier[]}
              isAuthenticated={!!user}
              hasExistingTicket={hasExistingTicket}
            />
          </aside>
        </div>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r last:border-r-0 border-border py-6 px-6 first:pl-0">
      <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 font-display text-lg leading-snug">{value}</dd>
    </div>
  );
}
