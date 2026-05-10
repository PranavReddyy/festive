import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateTicketSchema } from "@/lib/validations/ticket.schema";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = validateTicketSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });

  const { qr_token, event_id } = parsed.data;

  const { data: event } = await supabase
    .from("events")
    .select("organiser_id")
    .eq("id", event_id)
    .maybeSingle();
  if (!event)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (event.organiser_id !== user.id)
    return NextResponse.json(
      { error: "You do not have access to this event" },
      { status: 403 },
    );

  const { data: ticket } = await supabase
    .from("tickets")
    .select("*")
    .eq("qr_token", qr_token)
    .eq("event_id", event_id)
    .maybeSingle();

  if (!ticket)
    return NextResponse.json(
      { error: "Invalid QR — not recognised", code: "INVALID_QR" },
      { status: 404 },
    );

  if (ticket.status === "used") {
    return NextResponse.json(
      {
        error: "Already checked in",
        code: "ALREADY_USED",
        checked_in_at: ticket.checked_in_at,
      },
      { status: 409 },
    );
  }

  if (ticket.status === "cancelled" || ticket.status === "refunded") {
    return NextResponse.json(
      { error: `Ticket is ${ticket.status}`, code: "CANCELLED" },
      { status: 400 },
    );
  }

  const { data: updated, error: upErr } = await supabase
    .from("tickets")
    .update({
      status: "used",
      checked_in_at: new Date().toISOString(),
      checked_in_by: user.id,
    })
    .eq("id", ticket.id)
    .select()
    .single();

  if (upErr)
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });

  return NextResponse.json({
    data: {
      success: true,
      ticket_number: updated.ticket_number,
      attendee_name: updated.attendee_name,
      tier_name: updated.tier_name,
      checked_in_at: updated.checked_in_at,
    },
  });
}
