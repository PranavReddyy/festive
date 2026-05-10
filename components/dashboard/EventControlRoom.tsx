"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Search,
  TicketIcon,
  CheckCircle2,
  CircleDot,
  Ban,
  RotateCcw,
  IndianRupee,
  Activity,
  Percent,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, relativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Event, Ticket, TicketTier } from "@/types";

type Props = {
  event: Event;
  tiers: TicketTier[];
  initialTickets: Ticket[];
};

type Filter = "all" | "active" | "inside" | "pending" | "restricted";

export function EventControlRoom({ event, tiers, initialTickets }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [, startTransition] = useTransition();

  // Refresh "now" every 30s so the "last hour" counter stays live.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const live = tickets.filter(
    (t) => t.status === "active" || t.status === "used",
  );
  const inside = tickets.filter((t) => t.status === "used");
  const pending = tickets.filter((t) => t.status === "active");
  const restricted = tickets.filter(
    (t) => t.status === "cancelled" || t.status === "refunded",
  );
  const revenue = live.reduce((s, t) => s + (t.price_paid ?? 0), 0);
  const refunded = restricted.reduce((s, t) => s + (t.price_paid ?? 0), 0);
  const capacity = event.total_capacity ?? 0;
  const sellThrough =
    capacity > 0 ? Math.round((live.length / capacity) * 100) : 0;
  const checkInRate =
    live.length > 0 ? Math.round((inside.length / live.length) * 100) : 0;

  // Tier sales breakdown
  const tierStats = useMemo(() => {
    const liveOnly = tickets.filter(
      (t) => t.status === "active" || t.status === "used",
    );
    return tiers.map((tier) => {
      const sold = liveOnly.filter((t) => t.tier_id === tier.id).length;
      const tierRevenue = liveOnly
        .filter((t) => t.tier_id === tier.id)
        .reduce((s, t) => s + t.price_paid, 0);
      return {
        tier,
        sold,
        revenue: tierRevenue,
        pct:
          tier.capacity > 0 ? Math.min(100, (sold / tier.capacity) * 100) : 0,
      };
    });
  }, [tiers, tickets]);

  // Last hour entries — proxy for live "door" activity.
  const recentEntries = useMemo(() => {
    const cutoff = now - 60 * 60 * 1000;
    return tickets.filter(
      (t) =>
        t.status === "used" &&
        t.checked_in_at &&
        new Date(t.checked_in_at).getTime() >= cutoff,
    ).length;
  }, [tickets, now]);

  // Filtered + searched roster
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      if (filter === "active" && t.status !== "active" && t.status !== "used")
        return false;
      if (filter === "inside" && t.status !== "used") return false;
      if (filter === "pending" && t.status !== "active") return false;
      if (
        filter === "restricted" &&
        t.status !== "cancelled" &&
        t.status !== "refunded"
      )
        return false;
      if (!q) return true;
      const hay = [
        t.attendee_name,
        t.attendee_email,
        t.ticket_number,
        t.tier_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [tickets, filter, query]);

  async function mutate(ticketId: string, action: "restrict" | "restore") {
    setPendingId(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        data?: { status: Ticket["status"] };
        error?: string;
      };
      if (!res.ok) throw new Error(body.error ?? "Request failed");
      const newStatus = body.data?.status;
      if (!newStatus) throw new Error("Empty response");
      startTransition(() => {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)),
        );
      });
      toast.success(
        action === "restrict"
          ? "Ticket revoked. Holder cannot enter."
          : "Ticket restored.",
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-12">
      {/* Headline KPIs */}
      <section className="space-y-4">
        <SectionLabel>Live numbers</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border-y border-border">
          <Stat
            icon={<TicketIcon className="h-3.5 w-3.5" strokeWidth={1.25} />}
            label="Tickets sold"
            value={live.length.toLocaleString("en-IN")}
            sub={`of ${capacity.toLocaleString("en-IN")} cap`}
          />
          <Stat
            icon={<IndianRupee className="h-3.5 w-3.5" strokeWidth={1.25} />}
            label="Revenue"
            value={formatCurrency(revenue)}
            sub={
              refunded > 0
                ? `−${formatCurrency(refunded)} refunded`
                : "no refunds"
            }
          />
          <Stat
            icon={<Percent className="h-3.5 w-3.5" strokeWidth={1.25} />}
            label="Sell-through"
            value={`${sellThrough}%`}
            sub={
              capacity - live.length > 0
                ? `${(capacity - live.length).toLocaleString("en-IN")} left`
                : "Sold out"
            }
          />
          <Stat
            icon={<TrendingUp className="h-3.5 w-3.5" strokeWidth={1.25} />}
            label="Avg ticket"
            value={
              live.length > 0
                ? formatCurrency(Math.round(revenue / live.length))
                : "—"
            }
            sub={`${tiers.length} tier${tiers.length === 1 ? "" : "s"}`}
          />
        </div>
      </section>

      {/* Door operations */}
      <section className="space-y-4">
        <SectionLabel>Door</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border-y border-border">
          <Stat
            icon={<CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.25} />}
            label="Inside"
            value={inside.length.toLocaleString("en-IN")}
            sub="checked in"
          />
          <Stat
            icon={<CircleDot className="h-3.5 w-3.5" strokeWidth={1.25} />}
            label="Pending entry"
            value={pending.length.toLocaleString("en-IN")}
            sub="not yet scanned"
          />
          <Stat
            icon={<Activity className="h-3.5 w-3.5" strokeWidth={1.25} />}
            label="Last hour"
            value={recentEntries.toLocaleString("en-IN")}
            sub="entries"
          />
          <Stat
            icon={<Ban className="h-3.5 w-3.5" strokeWidth={1.25} />}
            label="Restricted"
            value={restricted.length.toLocaleString("en-IN")}
            sub={checkInRate ? `${checkInRate}% check-in` : "—"}
          />
        </div>
      </section>

      {/* Tier breakdown */}
      {tierStats.length > 0 && (
        <section className="space-y-4">
          <SectionLabel>Tiers</SectionLabel>
          <ul className="border-y border-border divide-y divide-border">
            {tierStats.map(({ tier, sold, revenue: rev, pct }) => (
              <li
                key={tier.id}
                className="grid grid-cols-[1fr_auto] gap-6 py-5 px-1"
              >
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-medium">{tier.name}</span>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {sold} / {tier.capacity}
                    </span>
                  </div>
                  <div className="h-px w-full bg-border overflow-hidden relative">
                    <span
                      className="absolute inset-y-0 left-0 bg-foreground"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Revenue
                  </p>
                  <p className="font-display text-lg leading-none mt-1">
                    {formatCurrency(rev)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Roster: search + filters + table */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel>Participants</SectionLabel>
            <h2 className="font-display text-2xl mt-2">
              {tickets.length.toLocaleString("en-IN")} on the list
            </h2>
          </div>
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
              strokeWidth={1.25}
            />
            <Input
              placeholder="Search name, email, ticket #"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1 text-[11px] uppercase tracking-[0.18em]">
          {(
            [
              ["all", `All (${tickets.length})`],
              ["active", `Live (${live.length})`],
              ["inside", `Inside (${inside.length})`],
              ["pending", `Pending (${pending.length})`],
              ["restricted", `Restricted (${restricted.length})`],
            ] as Array<[Filter, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "px-3 py-1.5 border border-border rounded-full transition-colors",
                filter === key
                  ? "border-foreground bg-foreground text-background"
                  : "hover:border-foreground/40",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="border-y border-border">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-[13px] text-muted-foreground">
              No participants match.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((t) => {
                const revoked =
                  t.status === "cancelled" || t.status === "refunded";
                const inside = t.status === "used";
                const initial = (t.attendee_name || t.attendee_email)
                  .slice(0, 1)
                  .toUpperCase();
                return (
                  <li
                    key={t.id}
                    className={cn(
                      "grid grid-cols-[auto_1fr_auto] items-center gap-5 py-5 px-1",
                      revoked && "opacity-60",
                    )}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{initial}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <p className="font-medium truncate">
                          {t.attendee_name ?? "Unnamed"}
                        </p>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          № {t.ticket_number}
                        </span>
                      </div>
                      <p className="text-[12px] text-muted-foreground truncate">
                        {t.attendee_email}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {t.tier_name} · {formatCurrency(t.price_paid)}
                        {" · "}
                        purchased {relativeTime(t.purchased_at)}
                        {t.checked_in_at &&
                          ` · entered ${relativeTime(t.checked_in_at)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill
                        status={t.status}
                        inside={inside}
                        revoked={revoked}
                      />
                      {revoked ? (
                        t.status === "cancelled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pendingId === t.id}
                            onClick={() => mutate(t.id, "restore")}
                          >
                            <RotateCcw className="h-3 w-3" /> Restore
                          </Button>
                        )
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={pendingId === t.id}
                          onClick={() => mutate(t.id, "restrict")}
                        >
                          <Ban className="h-3 w-3" /> Restrict
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </p>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-background p-6 lg:p-7">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
          {label}
        </span>
      </div>
      <p className="mt-4 font-display text-3xl lg:text-4xl leading-none">
        {value}
      </p>
      {sub && (
        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
}

function StatusPill({
  status,
  inside,
  revoked,
}: {
  status: Ticket["status"];
  inside: boolean;
  revoked: boolean;
}) {
  const label = revoked
    ? status === "refunded"
      ? "Refunded"
      : "Restricted"
    : inside
      ? "Inside"
      : "Reserved";
  return (
    <span
      className={cn(
        "hidden sm:inline-block text-[10px] font-medium uppercase tracking-[0.18em] px-2.5 py-1 border rounded-full",
        revoked
          ? "border-border text-muted-foreground"
          : inside
            ? "border-foreground bg-foreground text-background"
            : "border-foreground/20 text-foreground",
      )}
    >
      {label}
    </span>
  );
}

