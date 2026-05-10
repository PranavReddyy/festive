export type UserRole = "attendee" | "organiser" | "admin";

export type EventCategory =
  | "Conference"
  | "Workshop"
  | "Concert"
  | "Sports"
  | "Networking"
  | "Festival"
  | "Exhibition"
  | "Webinar";

export type EventStatus = "Draft" | "Published" | "Cancelled" | "Completed";

export type TicketStatus = "active" | "used" | "cancelled" | "refunded";

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  organiser_name: string | null;
  organiser_bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketTier {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number; // paise
  capacity: number;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
  sort_order: number;
  created_at?: string;
  available?: number;
  sold?: number;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  organiser_id: string;
  category: EventCategory;
  venue: string;
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  event_date: string;
  end_date: string | null;
  banner_url: string | null;
  status: EventStatus;
  is_featured: boolean;
  tags: string[];
  max_attendees: number | null;
  created_at: string;
  updated_at: string;
  // from view
  organiser_full_name?: string | null;
  organiser_name?: string | null;
  organiser_avatar?: string | null;
  min_price?: number | null;
  total_capacity?: number | null;
  tickets_sold?: number | null;
  seats_available?: number | null;
  // joined
  ticket_tiers?: TicketTier[];
}

export interface Ticket {
  id: string;
  event_id: string;
  user_id: string;
  tier_id: string;
  tier_name: string;
  price_paid: number;
  qr_token: string;
  qr_code_url: string | null;
  status: TicketStatus;
  ticket_number: string;
  attendee_name: string | null;
  attendee_email: string;
  purchased_at: string;
  checked_in_at: string | null;
  checked_in_by: string | null;
  event?: Event;
  profiles?: Pick<Profile, "full_name" | "avatar_url">;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface EventFilters {
  category?: EventCategory | "All";
  dateRange?: "today" | "week" | "month" | "all";
  priceMin?: number;
  priceMax?: number;
  city?: string;
  search?: string;
  onlyAvailable?: boolean;
}

export interface CreateEventInput {
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  city: string;
  address?: string;
  event_date: string;
  end_date?: string;
  banner_url?: string;
  tags?: string[];
  ticket_tiers: Array<{
    name: string;
    description?: string;
    price: number; // rupees on form
    capacity: number;
    sort_order: number;
  }>;
}
