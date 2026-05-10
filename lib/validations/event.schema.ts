import { z } from "zod";
import { EVENT_CATEGORIES } from "@/lib/constants";

export const ticketTierSchema = z.object({
  name: z.string().min(1, "Tier name required").max(50),
  description: z.string().max(200).optional().or(z.literal("")),
  price: z.number().min(0, "Price cannot be negative"),
  capacity: z.number().int().min(1, "Minimum 1 seat"),
  sort_order: z.number().int().default(0),
});

export const createEventSchema = z.object({
  title: z.string().min(5, "Title too short").max(120),
  description: z.string().min(20, "Add a meaningful description").max(5000),
  category: z.enum(EVENT_CATEGORIES),
  venue: z.string().min(3).max(200),
  city: z.string().min(2).max(100),
  address: z.string().max(300).optional().or(z.literal("")),
  event_date: z.string().min(1, "Pick a date"),
  end_date: z.string().optional().or(z.literal("")),
  banner_url: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).max(10).default([]),
  ticket_tiers: z
    .array(ticketTierSchema)
    .min(1, "At least one ticket tier required")
    .max(5),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(["Draft", "Published", "Cancelled", "Completed"]).optional(),
});

export type CreateEventSchema = z.infer<typeof createEventSchema>;
export type UpdateEventSchema = z.infer<typeof updateEventSchema>;
