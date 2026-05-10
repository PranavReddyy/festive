"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import { EVENT_CATEGORIES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function EventFilterSidebar() {
  const f = useFilterStore();
  const [open, setOpen] = useState(false);
  const active = f.activeCount();

  return (
    <>
      {/* Mobile trigger */}
      <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-background/80 backdrop-blur border-b border-border lg:hidden flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events…"
            className="pl-9"
            value={f.search ?? ""}
            onChange={(e) => f.setFilter("search", e.target.value || undefined)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          className="relative shrink-0"
          aria-label="Filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {active > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-foreground text-[10px] font-medium text-background grid place-items-center">
              {active}
            </span>
          )}
        </Button>
      </div>

      {/* Sidebar (desktop) + Drawer (mobile) */}
      <aside
        className={cn(
          "lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-auto",
          open
            ? "fixed inset-0 z-50 bg-background overflow-auto p-4"
            : "hidden lg:block",
        )}
      >
        <div className="flex items-center justify-between mb-6 lg:mb-4">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Filters
          </h2>
          <div className="flex items-center gap-2">
            {active > 0 && (
              <button
                onClick={f.reset}
                className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Clear all
              </button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="lg:hidden"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Search (desktop) */}
          <div className="hidden lg:block">
            <Label className="mb-2 block">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Title, venue…"
                className="pl-9"
                value={f.search ?? ""}
                onChange={(e) =>
                  f.setFilter("search", e.target.value || undefined)
                }
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="mb-3 block">Category</Label>
            <div className="flex flex-wrap gap-2">
              {(["All", ...EVENT_CATEGORIES] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => f.setFilter("category", cat)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
                    (f.category ?? "All") === cat
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-transparent hover:border-foreground/40 text-foreground",
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <Label className="mb-3 block">When</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["all", "All dates"],
                  ["today", "Today"],
                  ["week", "This week"],
                  ["month", "This month"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => f.setFilter("dateRange", val)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-[12px] font-medium transition-colors",
                    (f.dateRange ?? "all") === val
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/40",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <Label className="mb-3 block">Price (₹)</Label>
            <Slider
              value={[f.priceMin ?? 0, f.priceMax ?? 5000]}
              min={0}
              max={5000}
              step={100}
              onValueChange={(v) => {
                f.setFilter("priceMin", v[0] === 0 ? undefined : v[0]);
                f.setFilter(
                  "priceMax",
                  v[1] === 5000 ? undefined : v[1],
                );
              }}
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>₹{f.priceMin ?? 0}</span>
              <span>₹{f.priceMax ?? 5000}+</span>
            </div>
          </div>

          {/* City */}
          <div>
            <Label className="mb-2 block">City</Label>
            <Input
              placeholder="e.g. Hyderabad"
              value={f.city ?? ""}
              onChange={(e) => f.setFilter("city", e.target.value || undefined)}
            />
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <div>
              <Label htmlFor="only-available">Only available</Label>
              <p className="text-xs text-muted-foreground">Hide sold-out events</p>
            </div>
            <Switch
              id="only-available"
              checked={!!f.onlyAvailable}
              onCheckedChange={(v) => f.setFilter("onlyAvailable", v)}
            />
          </div>

          {active > 0 && (
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground text-center pt-2 border-t border-border">
              {active} filter{active > 1 ? "s" : ""} active
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
