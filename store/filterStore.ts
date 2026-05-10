import { create } from "zustand";
import type { EventFilters } from "@/types";

interface FilterStore extends EventFilters {
  setFilter: <K extends keyof EventFilters>(key: K, value: EventFilters[K]) => void;
  reset: () => void;
  activeCount: () => number;
}

const initial: EventFilters = {
  category: "All",
  dateRange: "all",
  priceMin: undefined,
  priceMax: undefined,
  city: undefined,
  search: undefined,
  onlyAvailable: false,
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...initial,
  setFilter: (key, value) => set({ [key]: value } as Partial<FilterStore>),
  reset: () => set({ ...initial }),
  activeCount: () => {
    const s = get();
    let n = 0;
    if (s.category && s.category !== "All") n += 1;
    if (s.dateRange && s.dateRange !== "all") n += 1;
    if (s.priceMin !== undefined) n += 1;
    if (s.priceMax !== undefined) n += 1;
    if (s.city) n += 1;
    if (s.search) n += 1;
    if (s.onlyAvailable) n += 1;
    return n;
  },
}));
