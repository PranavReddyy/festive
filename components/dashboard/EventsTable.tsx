import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatEventDate } from "@/lib/utils";
import { Pencil, Users } from "lucide-react";
import type { Event, EventStatus } from "@/types";

const STATUS_VARIANT: Record<EventStatus, "success" | "secondary" | "warning" | "destructive"> = {
  Draft: "secondary",
  Published: "success",
  Cancelled: "destructive",
  Completed: "warning",
};

export function EventsTable({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-12 text-center text-[13px] text-muted-foreground">
        You haven&apos;t created any events yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-[13px]">
        <thead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <tr>
            <th className="text-left px-4 py-3">Event</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">Date</th>
            <th className="text-left px-4 py-3 hidden lg:table-cell">Sold</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-right px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {events.map((e) => (
            <tr key={e.id} className="hover:bg-muted/30 transition">
              <td className="px-4 py-3">
                <Link href={`/events/${e.slug ?? e.id}`} className="font-medium hover:underline underline-offset-4">
                  {e.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {e.venue} · {e.city}
                </p>
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                {formatEventDate(e.event_date)}
              </td>
              <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                {e.tickets_sold ?? 0} / {e.total_capacity ?? 0}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[e.status]}>{e.status}</Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center gap-1">
                  <Link
                    href={`/dashboard/events/${e.id}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] uppercase tracking-[0.18em] hover:bg-muted"
                    aria-label="Manage event"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Manage</span>
                  </Link>
                  <Link
                    href={`/dashboard/events/${e.id}/edit`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
