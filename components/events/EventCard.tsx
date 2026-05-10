"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatEventDate, isPast } from "@/lib/utils";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";

export function EventCard({ event }: { event: Event }) {
  const { isSaved, toggle } = useSavedEvents();
  const seatsLeft = event.seats_available ?? 0;
  const totalCap = event.total_capacity ?? 0;
  const lowStock = totalCap > 0 && seatsLeft > 0 && seatsLeft / totalCap < 0.2;
  const soldOut = totalCap > 0 && seatsLeft === 0;
  const past = isPast(event.event_date);
  const minPrice = event.min_price ?? 0;

  const status = soldOut
    ? "Sold out"
    : past
      ? "Past"
      : lowStock
        ? `${seatsLeft} left`
        : null;

  const date = new Date(event.event_date);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date
    .toLocaleString("en-IN", { month: "short" })
    .toUpperCase();

  return (
    <Link
      href={`/events/${event.slug ?? event.id}`}
      className={cn(
        "group relative flex h-full flex-col bg-background p-8 lg:p-10 transition-colors hover:bg-muted/40",
        soldOut && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {event.category}
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {formatEventDate(event.event_date)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(event.id);
            }}
            className="-mt-1 -mr-1 grid h-7 w-7 place-items-center rounded text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isSaved(event.id) ? "Remove bookmark" : "Save event"}
          >
            {isSaved(event.id) ? (
              <BookmarkCheck className="h-3.5 w-3.5" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" strokeWidth={1.25} />
            )}
          </button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-[auto_1fr] gap-x-6">
        <div className="flex flex-col items-start leading-none">
          <span className="font-display text-[3rem] tracking-tighter leading-none">
            {day}
          </span>
          <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {month}
          </span>
        </div>
        <h3 className="font-display text-[1.625rem] leading-[1.15] line-clamp-3 text-foreground self-start">
          {event.title}
        </h3>
      </div>

      <p className="mt-7 text-[13px] text-muted-foreground line-clamp-1">
        {event.venue} <span className="text-foreground/30">·</span> {event.city}
      </p>

      <div className="mt-auto flex items-end justify-between gap-4 border-t border-dashed border-border pt-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            From
          </p>
          <p className="mt-2 font-display text-2xl leading-none">
            {minPrice === 0 ? "Free" : formatCurrency(minPrice)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {status && (
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.18em]",
                soldOut || past
                  ? "text-muted-foreground"
                  : "text-[oklch(0.55_0.16_38)]",
              )}
            >
              {status}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-foreground transition-transform group-hover:translate-x-0.5">
            View
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}
