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

  // Confirm organiser owns this event
  const { data: event } = await supabase
    .from("events")
    .select("organiser_id, title")
    .eq("id", id)
    .maybeSingle();
  if (!event)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (event.organiser_id !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", id)
    .order("purchased_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: tickets ?? [] });
}
