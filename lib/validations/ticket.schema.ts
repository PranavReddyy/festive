import { z } from "zod";

export const purchaseTicketSchema = z.object({
  event_id: z.string().uuid(),
  tier_id: z.string().uuid(),
});

export const validateTicketSchema = z.object({
  qr_token: z.string().min(1),
  event_id: z.string().uuid(),
});

export type PurchaseTicketInput = z.infer<typeof purchaseTicketSchema>;
export type ValidateTicketInput = z.infer<typeof validateTicketSchema>;
