"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import type { Profile } from "@/types";

export function useAuth() {
  const router = useRouter();
  const { user, profile, loading, setUser, setProfile, setLoading, reset } =
    useAuthStore();

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      setUser(user);
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (active) setProfile(prof as Profile | null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
      else load();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [setUser, setProfile, setLoading]);

  async function signOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    reset();
    router.push("/");
    router.refresh();
  }

  return { user, profile, loading, signOut };
}
