import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createEventSchema } from "@/lib/validations/event.schema";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { rupeesToPaise } from "@/lib/utils";
import { PAGE_SIZE } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const sp = req.nextUrl.searchParams;

  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(sp.get("limit") ?? PAGE_SIZE)));
  const offset = (page - 1) * limit;

  let query = supabase
    .from("events_with_availability")
    .select("*, ticket_tiers(*)", { count: "exact" })
    .eq("status", "Published")
    .order("event_date", { ascending: true })
    .range(offset, offset + limit - 1);

  const category = sp.get("category");
  if (category && category !== "All") query = query.eq("category", category);

  const city = sp.get("city");
  if (city) query = query.ilike("city", `%${city}%`);

  const search = sp.get("search");
  if (search) {
    const safe = search.replace(/[%,()]/g, " ");
    query = query.or(
      `title.ilike.%${safe}%,description.ilike.%${safe}%,venue.ilike.%${safe}%`,
    );
  }

  if (sp.get("onlyAvailable") === "true") {
    query = query.gt("seats_available", 0);
  }

  const dateRange = sp.get("dateRange");
  const now = new Date();
  if (dateRange === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    query = query.gte("event_date", start.toISOString()).lte("event_date", end.toISOString());
  } else if (dateRange === "week") {
    const end = new Date(now.getTime() + 7 * 86400_000);
    query = query.gte("event_date", now.toISOString()).lte("event_date", end.toISOString());
  } else if (dateRange === "month") {
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    query = query.gte("event_date", now.toISOString()).lte("event_date", end.toISOString());
  } else {
    query = query.gte("event_date", now.toISOString());
  }

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const priceMin = sp.get("priceMin") ? Number(sp.get("priceMin")) : undefined;
  const priceMax = sp.get("priceMax") ? Number(sp.get("priceMax")) : undefined;

  type EventRow = {
    min_price?: number | null;
    ticket_tiers?: { sort_order: number }[];
  } & Record<string, unknown>;

  let events = ((data ?? []) as EventRow[]).map((e) => ({
    ...e,
    ticket_tiers: (e.ticket_tiers ?? []).sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order,
    ),
  }));

  if (priceMin !== undefined || priceMax !== undefined) {
    events = events.filter((ev) => {
      const minRupees = (ev.min_price ?? 0) / 100;
      if (priceMin !== undefined && minRupees < priceMin) return false;
      if (priceMax !== undefined && minRupees > priceMax) return false;
      return true;
    });
  }

  return NextResponse.json({
    data: events,
    meta: {
      total: count ?? 0,
      page,
      limit,
      pages: Math.max(1, Math.ceil((count ?? 0) / limit)),
    },
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["organiser", "admin"].includes(profile.role)) {
    return NextResponse.json(
      { error: "Only organisers can create events" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const { ticket_tiers, end_date, banner_url, address, ...rest } = parsed.data;
  const slug = await generateUniqueSlug(supabase, rest.title);

  const { data: event, error: insErr } = await supabase
    .from("events")
    .insert({
      ...rest,
      slug,
      organiser_id: user.id,
      end_date: end_date || null,
      banner_url: banner_url || null,
      address: address || null,
      tags: rest.tags ?? [],
      status: "Draft",
    })
    .select()
    .single();

  if (insErr || !event) {
    return NextResponse.json(
      { error: insErr?.message ?? "Failed to create event" },
      { status: 500 },
    );
  }

  const tiers = ticket_tiers.map((t, i) => ({
    event_id: event.id,
    name: t.name,
    description: t.description || null,
    price: rupeesToPaise(t.price),
    capacity: t.capacity,
    sort_order: t.sort_order ?? i,
  }));

  const { error: tierErr } = await supabase.from("ticket_tiers").insert(tiers);
  if (tierErr) {
    await supabase.from("events").delete().eq("id", event.id);
    return NextResponse.json({ error: tierErr.message }, { status: 500 });
  }

  return NextResponse.json({ data: event }, { status: 201 });
}
