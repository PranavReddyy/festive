import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { purchaseTicketSchema } from "@/lib/validations/ticket.schema";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to purchase tickets" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const parsed = purchaseTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }
  const { event_id, tier_id } = parsed.data;

  // Duplicate check
  const { data: existing } = await supabase
    .from("tickets")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_id", event_id)
    .in("status", ["active", "used"])
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      {
        error: "You already have a ticket for this event",
        code: "DUPLICATE_TICKET",
      },
      { status: 409 },
    );
  }

  // Tier + event status
  const { data: tier } = await supabase
    .from("ticket_tiers")
    .select("*, events(title, status, event_date, venue)")
    .eq("id", tier_id)
    .maybeSingle();

  if (!tier)
    return NextResponse.json({ error: "Tier not found" }, { status: 404 });
  const ev = tier.events as { status: string; title: string } | null;
  if (!ev || ev.status !== "Published") {
    return NextResponse.json(
      { error: "Event is not available" },
      { status: 400 },
    );
  }

  // Capacity (DB function)
  const { data: available } = await supabase.rpc("get_tier_availability", {
    p_tier_id: tier_id,
  });
  if (!available || available <= 0) {
    return NextResponse.json(
      { error: "This ticket tier is sold out", code: "SOLD_OUT" },
      { status: 409 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const qr_token =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const { data: ticket, error: ticketErr } = await supabase
    .from("tickets")
    .insert({
      event_id,
      user_id: user.id,
      tier_id,
      tier_name: tier.name,
      price_paid: tier.price,
      qr_token,
      attendee_name: profile?.full_name ?? null,
      attendee_email: user.email!,
    })
    .select()
    .single();

  if (ticketErr) {
    if (ticketErr.code === "23505") {
      return NextResponse.json(
        {
          error: "You already have a ticket for this event",
          code: "DUPLICATE_TICKET",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create ticket", details: ticketErr.message },
      { status: 500 },
    );
  }

  // Email is intentionally not sent (Resend disabled per project decision).

  return NextResponse.json({ data: ticket }, { status: 201 });
}
