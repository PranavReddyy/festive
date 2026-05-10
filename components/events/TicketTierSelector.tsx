"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { TicketTier } from "@/types";
import { Lock } from "lucide-react";

interface Props {
  eventId: string;
  tiers: TicketTier[];
  isAuthenticated: boolean;
  hasExistingTicket: boolean;
}

export function TicketTierSelector({
  eventId,
  tiers,
  isAuthenticated,
  hasExistingTicket,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(tiers[0]?.id ?? null);
  const [loading, setLoading] = useState(false);

  async function purchase() {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event_id: eventId, tier_id: selected }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "DUPLICATE_TICKET") {
          toast.error("You already have a ticket for this event.", {
            action: {
              label: "View ticket",
              onClick: () => router.push("/my-tickets"),
            },
          });
          return;
        }
        if (json.code === "SOLD_OUT") {
          toast.error("This tier just sold out.");
          return;
        }
        throw new Error(json.error || "Failed");
      }
      toast.success("Booking confirmed! Check My Tickets.");
      router.push("/my-tickets");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not purchase ticket");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 border border-border rounded-md p-5 bg-card">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Tickets
        </h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {tiers.length} option{tiers.length !== 1 ? "s" : ""}
        </span>
      </div>

      {tiers.map((tier) => {
        const sold = tier.sold ?? 0;
        const cap = tier.capacity;
        const available = tier.available ?? Math.max(0, cap - sold);
        const pct = cap === 0 ? 0 : Math.round((sold / cap) * 100);
        const soldOut = available <= 0;
        const isSel = selected === tier.id;

        return (
          <button
            type="button"
            key={tier.id}
            disabled={soldOut}
            onClick={() => setSelected(tier.id)}
            className={cn(
              "w-full text-left rounded-md border p-4 transition-colors",
              soldOut
                ? "border-border opacity-60 cursor-not-allowed"
                : isSel
                  ? "border-foreground bg-muted/40"
                  : "border-border hover:border-foreground/40",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium">{tier.name}</span>
                  {soldOut && (
                    <Badge variant="destructive">Sold out</Badge>
                  )}
                </div>
                {tier.description && (
                  <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
                    {tier.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-display text-xl leading-none">
                  {tier.price === 0 ? "Free" : formatCurrency(tier.price)}
                </p>
                {!soldOut && (
                  <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {available} of {cap} left
                  </p>
                )}
              </div>
            </div>
            {!soldOut && <Progress value={pct} className="mt-4 h-[2px]" />}
          </button>
        );
      })}

      {hasExistingTicket ? (
        <div className="rounded-md border border-border bg-muted/30 p-4 flex items-center gap-3">
          <Lock className="h-4 w-4 text-foreground/70" />
          <div className="flex-1">
            <p className="text-[13px] font-medium">You&rsquo;re in</p>
            <p className="text-[12px] text-muted-foreground">
              You already have a ticket for this event.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <a href="/my-tickets">View</a>
          </Button>
        </div>
      ) : (
        <Button
          size="lg"
          className="w-full"
          disabled={!selected || loading}
          onClick={purchase}
        >
          {loading
            ? "Processing…"
            : isAuthenticated
              ? "Reserve a seat"
              : "Sign in to reserve"}
        </Button>
      )}
    </div>
  );
}
