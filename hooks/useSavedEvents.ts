"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

export function useSavedEvents() {
  const { user } = useAuth();
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    if (!user) {
      // Clear async to avoid cascading-render lint
      const t = setTimeout(() => setSaved(new Set()), 0);
      return () => clearTimeout(t);
    }
    supabase
      .from("saved_events")
      .select("event_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) setSaved(new Set(data.map((r: { event_id: string }) => r.event_id)));
      });
  }, [user, supabase]);

  async function toggle(eventId: string) {
    if (!user) return false;
    if (saved.has(eventId)) {
      await supabase
        .from("saved_events")
        .delete()
        .eq("user_id", user.id)
        .eq("event_id", eventId);
      setSaved((prev) => {
        const n = new Set(prev);
        n.delete(eventId);
        return n;
      });
      return false;
    }
    await supabase
      .from("saved_events")
      .insert({ user_id: user.id, event_id: eventId });
    setSaved((prev) => new Set(prev).add(eventId));
    return true;
  }

  return { saved, isSaved: (id: string) => saved.has(id), toggle };
}
