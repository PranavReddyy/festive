import type { EventCategory } from "@/types";

export const EVENT_CATEGORIES = [
  "Conference",
  "Workshop",
  "Concert",
  "Sports",
  "Networking",
  "Festival",
  "Exhibition",
  "Webinar",
] as const satisfies readonly EventCategory[];

// Minimal monochrome category styling — a single hairline pill, ink text.
export const CATEGORY_COLORS: Record<EventCategory, string> = {
  Conference: "bg-transparent text-foreground border-border",
  Workshop: "bg-transparent text-foreground border-border",
  Concert: "bg-transparent text-foreground border-border",
  Sports: "bg-transparent text-foreground border-border",
  Networking: "bg-transparent text-foreground border-border",
  Festival: "bg-transparent text-foreground border-border",
  Exhibition: "bg-transparent text-foreground border-border",
  Webinar: "bg-transparent text-foreground border-border",
};

export const APP_NAME = "Festive";

export const PAGE_SIZE = 12;
