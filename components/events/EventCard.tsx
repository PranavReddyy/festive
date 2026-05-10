"use client";

import Link from "next/link";
import { formatCurrency, isPast } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";

function day(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric" });
}
function mon(iso: string) {
  return new Date(iso)
    .toLocaleString("en-IN", { month: "short" })
    .toUpperCase();
}
function weekday(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { weekday: "short" });
}

export function EventCard({ event }: { event: Event }) {
  const seatsLeft = event.seats_available ?? 0;
  const totalCap = event.total_capacity ?? 0;
  const lowStock = totalCap > 0 && seatsLeft > 0 && seatsLeft / totalCap < 0.2;
  const soldOut = totalCap > 0 && seatsLeft === 0;
  const past = isPast(event.event_date);
  const minPrice = event.min_price ?? 0;

  const statusLabel = soldOut
    ? "Sold out"
    : past
      ? "Past"
      : lowStock
        ? `${seatsLeft} left`
        : null;

  return (
    <li className={cn("border-t border-border", soldOut && "opacity-55")}>
      <Link
        href={`/events/${event.slug ?? event.id}`}
        className="group flex items-start gap-6 py-7 px-1 transition-colors hover:bg-muted/30 sm:items-center"
      >
        {/* Date stamp */}
        <div className="w-14 shrink-0 text-center select-none">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground leading-none">
            {weekday(event.event_date)}
          </p>
          <p className="font-display text-[2rem] leading-none tracking-tighter mt-1">
            {day(event.event_date)}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground leading-none mt-1">
            {mon(event.event_date)}
          </p>
        </div>

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <p className="eyebrow mb-2">{event.category}</p>
          <h3 className="font-display text-[1.375rem] leading-[1.15] text-foreground line-clamp-2">
            {event.title}
          </h3>
          <p className="mt-1.5 text-[12px] text-muted-foreground truncate">
            {event.venue}
            <span className="mx-1.5 opacity-40">·</span>
            {event.city}
          </p>
        </div>

        {/* Right: price + actions */}
        <div className="shrink-0 flex flex-col items-end gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="text-right">
            <p className="eyebrow">From</p>
            <p className="font-display text-[1.25rem] leading-none mt-1">
              {minPrice === 0 ? "Free" : formatCurrency(minPrice)}
            </p>
          </div>

          {statusLabel && (
            <span
              className={cn(
                "hidden sm:block text-[10px] font-medium uppercase tracking-[0.18em] whitespace-nowrap",
                soldOut || past ? "text-muted-foreground" : "text-accent",
              )}
            >
              {statusLabel}
            </span>
          )}

          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-foreground whitespace-nowrap transition-transform group-hover:translate-x-0.5">
            View →
          </span>
        </div>
      </Link>
    </li>
  );
}
