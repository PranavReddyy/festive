import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/events/EventForm";
import { paiseToRupees } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/dashboard/events/${id}/edit`);

  const { data: rawEvent } = await supabase
    .from("events")
    .select("*, ticket_tiers(*)")
    .eq("id", id)
    .maybeSingle();
  if (!rawEvent) notFound();
  type EventRow = {
    id: string;
    organiser_id: string;
    title: string;
    description: string;
    category: string;
    venue: string;
    city: string;
    address: string | null;
    event_date: string;
    end_date: string | null;
    banner_url: string | null;
    tags: string[] | null;
    ticket_tiers: { name: string; description: string | null; price: number; capacity: number; sort_order: number }[];
  };
  const event = rawEvent as unknown as EventRow;
  if (event.organiser_id !== user.id) redirect("/dashboard");

  const initial = {
    id: event.id,
    title: event.title,
    description: event.description,
    category: event.category as never,
    venue: event.venue,
    city: event.city,
    address: event.address ?? "",
    event_date: event.event_date.slice(0, 16),
    end_date: event.end_date ? event.end_date.slice(0, 16) : "",
    banner_url: event.banner_url ?? "",
    tags: event.tags ?? [],
    ticket_tiers: (event.ticket_tiers ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((t) => ({
        name: t.name,
        description: t.description ?? "",
        price: paiseToRupees(t.price),
        capacity: t.capacity,
        sort_order: t.sort_order,
      })),
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-3 w-3" /> Back to dashboard
      </Link>
      <div>
        <h1 className="font-display text-4xl">Edit event</h1>
      </div>
      <EventForm initial={initial} />
    </div>
  );
}
