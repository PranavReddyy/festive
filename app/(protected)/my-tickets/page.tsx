import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import { TicketCard } from "@/components/tickets/TicketCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Ticket as TicketIcon } from "lucide-react";
import type { Ticket } from "@/types";

export const dynamic = "force-dynamic";

export default async function MyTicketsPage() {
  const supabase = await createSupabaseRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/my-tickets");

  const { data: tickets } = await supabase
    .from("tickets")
    .select(
      "*, event:events(id, slug, title, banner_url, venue, city, event_date, status)",
    )
    .eq("user_id", user.id)
    .order("purchased_at", { ascending: false });

  const list = (tickets ?? []) as Ticket[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl">My tickets</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          All your bookings, present and past.
        </p>
      </div>
      {list.length === 0 ? (
        <EmptyState
          icon={<TicketIcon className="h-12 w-12" />}
          title="No tickets yet"
          description="Discover an event and book your first ticket."
          action={
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-5 text-[13px] font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              Browse events
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {list.map((t) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
      )}
    </div>
  );
}
