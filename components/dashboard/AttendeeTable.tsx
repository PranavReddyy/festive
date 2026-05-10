import { formatEventDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Ticket } from "@/types";

export function AttendeeTable({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-12 text-center text-[13px] text-muted-foreground">
        No attendees yet.
      </div>
    );
  }
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-[13px]">
        <thead className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <tr className="border-b border-border">
            <th className="text-left px-5 py-3 font-medium">Attendee</th>
            <th className="text-left px-5 py-3 font-medium hidden md:table-cell">
              Tier
            </th>
            <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">
              Purchased
            </th>
            <th className="text-left px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tickets.map((t) => (
            <tr key={t.id} className="hover:bg-muted/40 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {(t.attendee_name || t.attendee_email)
                        .slice(0, 1)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{t.attendee_name ?? "Unnamed"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {t.attendee_email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 hidden md:table-cell">{t.tier_name}</td>
              <td className="px-5 py-4 hidden lg:table-cell text-muted-foreground">
                {formatEventDate(t.purchased_at)}
              </td>
              <td className="px-5 py-4">
                {t.status === "used" ? (
                  <Badge variant="success">
                    Checked in
                    {t.checked_in_at
                      ? ` · ${new Date(t.checked_in_at).toLocaleTimeString()}`
                      : ""}
                  </Badge>
                ) : t.status === "active" ? (
                  <Badge variant="secondary">Active</Badge>
                ) : (
                  <Badge variant="destructive" className="capitalize">
                    {t.status}
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
