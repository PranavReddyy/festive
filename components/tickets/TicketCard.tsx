"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  formatLongDate,
  formatTime,
} from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { QRDisplay } from "./QRDisplay";
import type { Ticket } from "@/types";

const STATUS_LABEL: Record<Ticket["status"], string> = {
  active: "Admit one",
  used: "Checked in",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const [open, setOpen] = useState(false);
  const event = ticket.event;
  const date = event ? new Date(event.event_date) : null;
  const day = date?.getDate().toString().padStart(2, "0") ?? "--";
  const month =
    date?.toLocaleString("en-IN", { month: "short" }).toUpperCase() ?? "---";
  const year = date?.getFullYear() ?? "----";
  const isVoid = ticket.status === "cancelled" || ticket.status === "refunded";

  return (
    <div
      className={cn(
        "group relative bg-[oklch(0.985_0.012_85)] border border-foreground/15",
        // shadow + retro feel
        "shadow-[2px_2px_0_oklch(0.18_0.012_50_/_0.06)]",
        isVoid && "opacity-60",
      )}
    >
      {/* Top serial bar */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-dashed border-foreground/25 bg-foreground/[0.03]">
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/70">
          № {ticket.ticket_number}
        </p>
        <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/70">
          {STATUS_LABEL[ticket.status]}
        </p>
      </div>

      {/* Body: stub layout */}
      <div className="grid grid-cols-[1fr_auto_140px]">
        {/* Main */}
        <div className="p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/60">
            Festive · Admission ticket
          </p>
          <h3 className="mt-3 font-display text-3xl sm:text-4xl leading-[1.05] tracking-tight">
            {event?.title ?? "Event"}
          </h3>

          <dl className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 border-t border-dashed border-foreground/25 pt-5">
            <Field label="Date">
              {event ? formatLongDate(event.event_date) : "—"}
            </Field>
            <Field label="Doors">
              {event ? formatTime(event.event_date) : "—"}
            </Field>
            <Field label="Venue">{event?.venue ?? "—"}</Field>
            <Field label="City">{event?.city ?? "—"}</Field>
            <Field label="Tier">{ticket.tier_name}</Field>
            <Field label="Price">{formatCurrency(ticket.price_paid)}</Field>
            <Field label="Holder">{ticket.attendee_name ?? "Unnamed"}</Field>
            <Field label="Issued">
              {new Date(ticket.purchased_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Field>
          </dl>

          <div className="mt-7 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/60">
              Present at door · No refunds within 24h
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              disabled={isVoid}
            >
              {open ? "Hide QR" : "Show QR"}
              <ChevronDown
                className={cn("h-3 w-3 transition", open && "rotate-180")}
              />
            </Button>
          </div>
        </div>

        {/* Perforation */}
        <div
          aria-hidden
          className="relative w-px bg-foreground/25"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, oklch(0.18 0.012 50 / 0.45) 0 4px, transparent 4px 10px)",
            backgroundSize: "1px 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          {/* perforation notches */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-background border border-foreground/15" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-background border border-foreground/15" />
        </div>

        {/* Stub */}
        <div className="hidden sm:flex flex-col items-center justify-between p-6 bg-foreground/[0.03]">
          <div className="text-center">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/55">
              Admit
            </p>
            <p className="mt-1 font-display text-5xl leading-none tracking-tighter">
              01
            </p>
          </div>
          <div className="text-center mt-4">
            <p className="font-display text-[2.75rem] leading-none tracking-tighter">
              {day}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/70">
              {month} {year}
            </p>
          </div>
          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/55">
            Stub · keep
          </p>
        </div>
      </div>

      {/* QR drawer */}
      {open && (
        <div className="border-t border-dashed border-foreground/25 p-6 sm:p-8 flex flex-col items-center bg-background">
          <QRDisplay token={ticket.qr_token} size={220} />
          <p className="mt-4 font-mono text-[10px] tracking-[0.3em] uppercase text-foreground/60">
            {ticket.ticket_number}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Hold steady at the entrance scanner.
          </p>
        </div>
      )}

      {isVoid && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <span className="rotate-[-8deg] border-2 border-destructive/60 px-6 py-1.5 font-mono text-xs uppercase tracking-[0.4em] text-destructive/80">
            {ticket.status === "refunded" ? "Refunded" : "Void"}
          </span>
        </span>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/55">
        {label}
      </dt>
      <dd className="mt-1 text-[13px] text-foreground leading-snug">
        {children}
      </dd>
    </div>
  );
}
