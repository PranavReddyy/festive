import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(
      "*, event:events(id, slug, title, banner_url, venue, city, event_date, status)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!ticket)
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  if (ticket.user_id !== user.id) {
    // Check if user is the organiser
    const { data: ev } = await supabase
      .from("events")
      .select("organiser_id")
      .eq("id", ticket.event_id)
      .maybeSingle();
    if (!ev || ev.organiser_id !== user.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ data: ticket });
}

// Organiser-only: restrict (cancel) or restore (re-activate) a single ticket.
// Body: { action: "restrict" | "restore" }
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action;
  if (action !== "restrict" && action !== "restore")
    return NextResponse.json({ error: "Invalid action" }, { status: 422 });

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, status, event_id, checked_in_at")
    .eq("id", id)
    .maybeSingle();
  if (!ticket)
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const { data: ev } = await supabase
    .from("events")
    .select("organiser_id")
    .eq("id", ticket.event_id)
    .maybeSingle();
  if (!ev || ev.organiser_id !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (action === "restrict") {
    if (ticket.status === "cancelled" || ticket.status === "refunded")
      return NextResponse.json(
        { error: "Ticket is already revoked" },
        { status: 409 },
      );
    const { data: updated, error } = await supabase
      .from("tickets")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select("id, status")
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: updated });
  }

  // restore
  if (ticket.status !== "cancelled")
    return NextResponse.json(
      { error: "Only cancelled tickets can be restored" },
      { status: 409 },
    );
  const nextStatus = ticket.checked_in_at ? "used" : "active";
  const { data: updated, error } = await supabase
    .from("tickets")
    .update({ status: nextStatus })
    .eq("id", id)
    .select("id, status")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: updated });
}
