import { z } from "zod";

// Permissive UUID shape: 8-4-4-4-12 hex, case-insensitive. Zod 4's
// z.uuid() rejects seed/test UUIDs whose version nibble is 0, so we
// validate the shape without enforcing a specific RFC 9562 version.
const uuidShape = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Must be a UUID",
  );

export const purchaseTicketSchema = z.object({
  event_id: uuidShape,
  tier_id: uuidShape,
});

export const validateTicketSchema = z.object({
  qr_token: z.string().min(1),
  event_id: uuidShape,
});

export type PurchaseTicketInput = z.infer<typeof purchaseTicketSchema>;
export type ValidateTicketInput = z.infer<typeof validateTicketSchema>;
