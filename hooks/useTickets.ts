"use client";

import { useQuery } from "@tanstack/react-query";
import type { Ticket } from "@/types";

export function useMyTickets() {
  return useQuery({
    queryKey: ["my-tickets"],
    queryFn: async (): Promise<Ticket[]> => {
      const res = await fetch("/api/tickets/my");
      if (!res.ok) throw new Error("Failed to load tickets");
      const json = await res.json();
      return json.data;
    },
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: async (): Promise<Ticket> => {
      const res = await fetch(`/api/tickets/${id}`);
      if (!res.ok) throw new Error("Failed to load ticket");
      const json = await res.json();
      return json.data;
    },
    enabled: !!id,
  });
}
