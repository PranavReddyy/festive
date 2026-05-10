"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useFilterStore } from "@/store/filterStore";
import type { Event } from "@/types";
import { PAGE_SIZE } from "@/lib/constants";

interface PaginatedEvents {
  data: Event[];
  meta: { total: number; page: number; limit: number; pages: number };
}

function buildQuery(
  filters: ReturnType<typeof useFilterStore.getState>,
  page: number,
) {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== "All")
    params.set("category", filters.category);
  if (filters.dateRange && filters.dateRange !== "all")
    params.set("dateRange", filters.dateRange);
  if (filters.priceMin !== undefined)
    params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== undefined)
    params.set("priceMax", String(filters.priceMax));
  if (filters.city) params.set("city", filters.city);
  if (filters.search) params.set("search", filters.search);
  if (filters.onlyAvailable) params.set("onlyAvailable", "true");
  params.set("page", String(page));
  params.set("limit", String(PAGE_SIZE));
  return params.toString();
}

export function useEvents() {
  const filters = useFilterStore();
  const qs = buildQuery(filters, 1);

  return useInfiniteQuery({
    queryKey: ["events", qs.replace(/&?page=\d+/, "")],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<PaginatedEvents> => {
      const q = buildQuery(filters, pageParam as number);
      const res = await fetch(`/api/events?${q}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
    getNextPageParam: (last) =>
      last.meta.page < last.meta.pages ? last.meta.page + 1 : undefined,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async (): Promise<Event> => {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error("Failed to fetch event");
      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}
