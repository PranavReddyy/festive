import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateEventSchema } from "@/lib/validations/event.schema";
import { rupeesToPaise } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

// GET by id OR slug
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServerClient();

  // try id first
  const isUuid = /^[0-9a-f-]{36}$/i.test(id);
  const filter = isUuid ? "id" : "slug";

  const { data, error } = await supabase
    .from("events_with_availability")
    .select("*, ticket_tiers(*)")
    .eq(filter, id)
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // sort tiers + compute available
  type Tier = { id: string; capacity: number; sort_order: number; available?: number; sold?: number };
  const tiers = ((data.ticket_tiers ?? []) as Tier[]).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const tierIds = tiers.map((t) => t.id);
  let availability: Record<string, number> = {};
  if (tierIds.length) {
    const { data: counts } = await supabase
      .from("tickets")
      .select("tier_id, status")
      .in("tier_id", tierIds)
      .in("status", ["active", "used"]);
    const sold: Record<string, number> = {};
    ((counts ?? []) as { tier_id: string }[]).forEach((r) => {
      sold[r.tier_id] = (sold[r.tier_id] ?? 0) + 1;
    });
    availability = tiers.reduce((acc: Record<string, number>, t: Tier) => {
      acc[t.id] = Math.max(0, t.capacity - (sold[t.id] ?? 0));
      return acc;
    }, {});
    tiers.forEach((t: Tier) => {
      t.available = availability[t.id];
      t.sold = sold[t.id] ?? 0;
    });
  }

  return NextResponse.json({ data: { ...data, ticket_tiers: tiers } });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("events")
    .select("id, organiser_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (existing.organiser_id !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { ticket_tiers, ...rest } = parsed.data;
  const cleaned = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== "" && v !== undefined),
  );

  const { data: updated, error: updErr } = await supabase
    .from("events")
    .update(cleaned)
    .eq("id", id)
    .select()
    .single();

  if (updErr)
    return NextResponse.json({ error: updErr.message }, { status: 500 });

  if (ticket_tiers && ticket_tiers.length) {
    // Replace tiers (simple strategy — full refresh)
    await supabase.from("ticket_tiers").delete().eq("event_id", id);
    const newTiers = ticket_tiers.map((t, i) => ({
      event_id: id,
      name: t.name,
      description: t.description || null,
      price: rupeesToPaise(t.price),
      capacity: t.capacity,
      sort_order: t.sort_order ?? i,
    }));
    const { error: tierErr } = await supabase
      .from("ticket_tiers")
      .insert(newTiers);
    if (tierErr)
      return NextResponse.json({ error: tierErr.message }, { status: 500 });
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("events")
    .select("organiser_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (existing.organiser_id !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: { success: true } });
}
