"use client";

import { useEffect } from "react";
import { useEvents } from "@/hooks/useEvents";
import { EventCard } from "./EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/store/filterStore";

export function EventList() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useEvents();
  const reset = useFilterStore((s) => s.reset);

  // refetch when any filter changes
  const filterStateKey = useFilterStore((s) => JSON.stringify(s));
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStateKey]);

  if (isLoading) {
    return (
      <ul className="border-b border-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="border-t border-border py-7 px-1 flex items-center gap-6">
            <Skeleton className="h-14 w-14 shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-2.5 w-40" />
            </div>
            <Skeleton className="h-8 w-20 shrink-0" />
          </li>
        ))}
      </ul>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Could not load events"
        description="Something went wrong fetching events. Please try again."
        action={<Button onClick={() => refetch()}>Retry</Button>}
      />
    );
  }

  const events = data?.pages.flatMap((p) => p.data) ?? [];

  if (events.length === 0) {
    return (
      <EmptyState
        title="No events match your filters"
        description="Try clearing filters or expanding your date range."
        action={<Button onClick={reset}>Clear filters</Button>}
      />
    );
  }

  return (
    <>
      <ul className="border-b border-border">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </ul>
      {hasNextPage && (
        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading…" : "Load more events"}
          </Button>
        </div>
      )}
    </>
  );
}
