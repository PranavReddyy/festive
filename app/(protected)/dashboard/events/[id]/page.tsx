import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ScanLine, Pencil } from "lucide-react";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { EventControlRoom } from "@/components/dashboard/EventControlRoom";
import { formatLongDate, formatTime } from "@/lib/utils";
import type { Event, Ticket, TicketTier } from "@/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EventDashboardPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/dashboard/events/${id}`);

  const { data: event } = await supabase
    .from("events_with_availability")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!event) notFound();
  if (event.organiser_id !== user.id) redirect("/dashboard");

  const { data: tiers } = await supabase
    .from("ticket_tiers")
    .select("*")
    .eq("event_id", id)
    .order("sort_order", { ascending: true });

  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", id)
    .order("purchased_at", { ascending: false });

  const ev = event as Event;
  const tierList = (tiers ?? []) as TicketTier[];
  const ticketList = (tickets ?? []) as Ticket[];

  return (
    <div className="space-y-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> All events
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-6 pb-8 border-b border-border">
        <div className="space-y-3 max-w-2xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {ev.category} · {ev.status}
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-[0.95]">
            {ev.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatLongDate(ev.event_date)} · {formatTime(ev.event_date)} ·{" "}
            {ev.venue}, {ev.city}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/scanner?event=${ev.id}`}>
              <ScanLine className="h-4 w-4" /> Door scanner
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/events/${ev.id}/edit`}>
              <Pencil className="h-4 w-4" /> Edit event
            </Link>
          </Button>
        </div>
      </header>

      <EventControlRoom
        event={ev}
        tiers={tierList}
        initialTickets={ticketList}
      />
    </div>
  );
}
