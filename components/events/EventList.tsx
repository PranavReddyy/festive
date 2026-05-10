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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-y border-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-background p-8 lg:p-10 space-y-6 min-h-80"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-y border-border">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
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
