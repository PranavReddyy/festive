import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  IndianRupee,
  ScanLine,
  TicketIcon,
  Plus,
  Users,
  TrendingUp,
  Percent,
  RefreshCcw,
  Receipt,
  Activity,
} from "lucide-react";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { EventsTable } from "@/components/dashboard/EventsTable";
import { formatCurrency } from "@/lib/utils";
import type { Event } from "@/types";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  price_paid: number;
  status: "active" | "used" | "cancelled" | "refunded";
  purchased_at: string;
  event_id: string;
  tier_name: string;
  checked_in_at: string | null;
};

export default async function DashboardPage() {
  const supabase = await createSupabaseRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const { data: events } = await supabase
    .from("events_with_availability")
    .select("*")
    .eq("organiser_id", user.id)
    .order("event_date", { ascending: false });

  const eventList = (events ?? []) as Event[];
  const eventIds = eventList.map((e) => e.id);

  const { data: ticketsRaw } = eventIds.length
    ? await supabase
        .from("tickets")
        .select(
          "id, price_paid, status, purchased_at, event_id, tier_name, checked_in_at",
        )
        .in("event_id", eventIds)
    : { data: [] as Row[] };
  const tickets = (ticketsRaw ?? []) as Row[];

  const live = tickets.filter(
    (t) => t.status === "active" || t.status === "used",
  );
  const refunded = tickets.filter(
    (t) => t.status === "refunded" || t.status === "cancelled",
  );
  const checkedIn = tickets.filter((t) => t.status === "used");

  const totalSold = live.length;
  const totalRevenue = live.reduce((s, t) => s + (t.price_paid ?? 0), 0);
  const refundedAmount = refunded.reduce(
    (s, t) => s + (t.price_paid ?? 0),
    0,
  );
  const avgTicket =
    totalSold > 0 ? Math.round(totalRevenue / totalSold) : 0;

  const totalCapacity = eventList.reduce(
    (s, e) => s + (e.total_capacity ?? 0),
    0,
  );
  const sellThrough =
    totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;

  const checkInRate =
    totalSold > 0 ? Math.round((checkedIn.length / totalSold) * 100) : 0;

  const refundRate =
    tickets.length > 0
      ? Math.round((refunded.length / tickets.length) * 100)
      : 0;

  const now = new Date();
  const upcoming = eventList.filter(
    (e) => new Date(e.event_date) > now && e.status === "Published",
  );
  const published = eventList.filter((e) => e.status === "Published").length;
  const drafts = eventList.filter((e) => e.status === "Draft").length;

  // last 30 days revenue
  const buckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  live.forEach((t) => {
    const k = t.purchased_at.slice(0, 10);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + t.price_paid);
  });
  const chartData = Array.from(buckets.entries()).map(([date, revenue]) => ({
    date: new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    revenue,
  }));

  // 7-day vs previous 7-day delta
  const since7 = new Date(now);
  since7.setDate(since7.getDate() - 7);
  const since14 = new Date(now);
  since14.setDate(since14.getDate() - 14);
  const last7 = live.filter((t) => new Date(t.purchased_at) >= since7);
  const prev7 = live.filter((t) => {
    const d = new Date(t.purchased_at);
    return d >= since14 && d < since7;
  });
  const last7Revenue = last7.reduce((s, t) => s + t.price_paid, 0);
  const prev7Revenue = prev7.reduce((s, t) => s + t.price_paid, 0);
  const weekDelta =
    prev7Revenue === 0
      ? last7Revenue > 0
        ? 100
        : 0
      : Math.round(((last7Revenue - prev7Revenue) / prev7Revenue) * 100);

  // top events by revenue
  const revenueByEvent = new Map<string, number>();
  const soldByEvent = new Map<string, number>();
  live.forEach((t) => {
    revenueByEvent.set(
      t.event_id,
      (revenueByEvent.get(t.event_id) ?? 0) + t.price_paid,
    );
    soldByEvent.set(t.event_id, (soldByEvent.get(t.event_id) ?? 0) + 1);
  });
  const topEvents = [...eventList]
    .map((e) => ({
      ...e,
      revenue: revenueByEvent.get(e.id) ?? 0,
      sold: soldByEvent.get(e.id) ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // tier breakdown
  const tierMap = new Map<string, { count: number; revenue: number }>();
  live.forEach((t) => {
    const cur = tierMap.get(t.tier_name) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += t.price_paid;
    tierMap.set(t.tier_name, cur);
  });
  const tierBreakdown = [...tierMap.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // recent sales (latest 5 active/used)
  const recent = [...live]
    .sort(
      (a, b) =>
        new Date(b.purchased_at).getTime() -
        new Date(a.purchased_at).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-border">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground mb-3">
            Organiser
          </p>
          <h1 className="font-display text-5xl leading-[0.95]">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/scanner">
              <ScanLine className="h-4 w-4" /> Scanner
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/events/new">
              <Plus className="h-4 w-4" /> New event
            </Link>
          </Button>
        </div>
      </header>

      {/* Primary KPIs */}
      <section>
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground mb-4">
          Headline
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label="Lifetime revenue"
            value={formatCurrency(totalRevenue)}
            delta={`${weekDelta >= 0 ? "+" : ""}${weekDelta}% vs prev. 7 days`}
            icon={<IndianRupee className="h-4 w-4" strokeWidth={1.5} />}
          />
          <StatsCard
            label="Tickets sold"
            value={String(totalSold)}
            delta={`${checkedIn.length} checked in`}
            icon={<TicketIcon className="h-4 w-4" strokeWidth={1.5} />}
          />
          <StatsCard
            label="Sell-through"
            value={`${sellThrough}%`}
            delta={`${totalSold} of ${totalCapacity || 0} seats`}
            icon={<Percent className="h-4 w-4" strokeWidth={1.5} />}
          />
          <StatsCard
            label="Avg. ticket"
            value={formatCurrency(avgTicket)}
            delta="Across live tiers"
            icon={<Receipt className="h-4 w-4" strokeWidth={1.5} />}
          />
        </div>
      </section>

      {/* Secondary KPIs */}
      <section>
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground mb-4">
          Operations
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label="Events"
            value={String(eventList.length)}
            delta={`${published} live · ${drafts} draft`}
            icon={<Calendar className="h-4 w-4" strokeWidth={1.5} />}
          />
          <StatsCard
            label="Upcoming"
            value={String(upcoming.length)}
            delta={
              upcoming[0]
                ? new Date(
                    upcoming[upcoming.length - 1].event_date,
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : "Nothing scheduled"
            }
            icon={<Activity className="h-4 w-4" strokeWidth={1.5} />}
          />
          <StatsCard
            label="Check-in rate"
            value={`${checkInRate}%`}
            delta={`${checkedIn.length} of ${totalSold} attended`}
            icon={<Users className="h-4 w-4" strokeWidth={1.5} />}
          />
          <StatsCard
            label="Refund rate"
            value={`${refundRate}%`}
            delta={`${formatCurrency(refundedAmount)} returned`}
            icon={<RefreshCcw className="h-4 w-4" strokeWidth={1.5} />}
          />
        </div>
      </section>

      {/* Revenue chart */}
      <section className="rounded-md border border-border p-8">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl">Revenue</h2>
            <p className="text-[12px] text-muted-foreground mt-1">
              {formatCurrency(last7Revenue)} in the last 7 days
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Last 30 days
          </span>
        </div>
        <RevenueChart data={chartData} />
      </section>

      {/* Top events + tier breakdown */}
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-md border border-border">
          <div className="flex items-baseline justify-between p-6 border-b border-border">
            <h2 className="font-display text-xl">Top performing events</h2>
            <TrendingUp
              className="h-4 w-4 text-muted-foreground"
              strokeWidth={1.5}
            />
          </div>
          {topEvents.length === 0 ? (
            <p className="p-6 text-[13px] text-muted-foreground">
              No sales recorded yet.
            </p>
          ) : (
            <ol>
              {topEvents.map((e, i) => {
                const cap = e.total_capacity ?? 0;
                const pct = cap > 0 ? Math.round((e.sold / cap) * 100) : 0;
                return (
                  <li
                    key={e.id}
                    className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0 border-border"
                  >
                    <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground w-6">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/events/${e.id}/attendees`}
                        className="font-medium text-[14px] truncate block hover:underline underline-offset-4"
                      >
                        {e.title}
                      </Link>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {e.sold} sold · {pct}% full
                      </p>
                    </div>
                    <span className="font-display text-lg leading-none">
                      {formatCurrency(e.revenue)}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="rounded-md border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="font-display text-xl">Tier breakdown</h2>
            <p className="text-[12px] text-muted-foreground mt-1">
              Across all events
            </p>
          </div>
          {tierBreakdown.length === 0 ? (
            <p className="p-6 text-[13px] text-muted-foreground">
              No tiers sold yet.
            </p>
          ) : (
            <ul>
              {tierBreakdown.map((t) => {
                const pct =
                  totalSold > 0
                    ? Math.round((t.count / totalSold) * 100)
                    : 0;
                return (
                  <li
                    key={t.name}
                    className="px-6 py-4 border-b last:border-b-0 border-border"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium text-[14px]">{t.name}</span>
                      <span className="font-display text-lg leading-none">
                        {formatCurrency(t.revenue)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-[2px] bg-border overflow-hidden">
                        <div
                          className="h-full bg-foreground"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                        {t.count} · {pct}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Recent activity */}
      <section className="rounded-md border border-border">
        <div className="p-6 border-b border-border flex items-baseline justify-between">
          <h2 className="font-display text-xl">Recent sales</h2>
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Last 5
          </span>
        </div>
        {recent.length === 0 ? (
          <p className="p-6 text-[13px] text-muted-foreground">
            No sales yet.
          </p>
        ) : (
          <ul>
            {recent.map((t) => {
              const e = eventList.find((x) => x.id === t.event_id);
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0 border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] truncate">
                      <span className="font-medium">{t.tier_name}</span>{" "}
                      <span className="text-muted-foreground">·</span>{" "}
                      <span className="text-muted-foreground">
                        {e?.title ?? "Event"}
                      </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(t.purchased_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="font-display text-base leading-none">
                    {formatCurrency(t.price_paid)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl">Your events</h2>
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {eventList.length} total
          </span>
        </div>
        <EventsTable events={eventList} />
      </section>
    </div>
  );
}
