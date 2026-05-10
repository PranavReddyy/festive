import type { SupabaseClient } from "@supabase/supabase-js";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function generateUniqueSlug(
  supabase: SupabaseClient,
  title: string,
): Promise<string> {
  const base = slugify(title) || "event";
  let candidate = base;
  let n = 0;
  // safety bound
  while (n < 50) {
    const { data } = await supabase
      .from("events")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    n += 1;
    candidate = `${base}-${n + 1}`;
  }
  return `${base}-${Date.now()}`;
}
