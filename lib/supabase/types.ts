// Minimal hand-written DB types to avoid `any` while keeping the codebase
// independent of `supabase gen types`. Re-generate if the schema evolves.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          role: "attendee" | "organiser" | "admin";
          organiser_name: string | null;
          organiser_bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          full_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          organiser_id: string;
          category: string;
          venue: string;
          city: string;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          event_date: string;
          end_date: string | null;
          banner_url: string | null;
          status: "Draft" | "Published" | "Cancelled" | "Completed";
          is_featured: boolean;
          tags: string[];
          max_attendees: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & {
          title: string;
          slug: string;
          description: string;
          organiser_id: string;
          category: string;
          venue: string;
          city: string;
          event_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
      };
      ticket_tiers: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          description: string | null;
          price: number;
          capacity: number;
          sale_starts_at: string | null;
          sale_ends_at: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ticket_tiers"]["Row"]> & {
          event_id: string;
          name: string;
          price: number;
          capacity: number;
        };
        Update: Partial<Database["public"]["Tables"]["ticket_tiers"]["Row"]>;
      };
      tickets: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          tier_id: string;
          tier_name: string;
          price_paid: number;
          qr_token: string;
          qr_code_url: string | null;
          status: "active" | "used" | "cancelled" | "refunded";
          ticket_number: string;
          attendee_name: string | null;
          attendee_email: string;
          purchased_at: string;
          checked_in_at: string | null;
          checked_in_by: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["tickets"]["Row"]> & {
          event_id: string;
          user_id: string;
          tier_id: string;
          tier_name: string;
          price_paid: number;
          attendee_email: string;
        };
        Update: Partial<Database["public"]["Tables"]["tickets"]["Row"]>;
      };
      saved_events: {
        Row: {
          user_id: string;
          event_id: string;
          saved_at: string;
        };
        Insert: { user_id: string; event_id: string };
        Update: never;
      };
    };
    Views: {
      events_with_availability: {
        Row: Database["public"]["Tables"]["events"]["Row"] & {
          organiser_full_name: string | null;
          organiser_name: string | null;
          organiser_avatar: string | null;
          min_price: number | null;
          total_capacity: number | null;
          tickets_sold: number | null;
          seats_available: number | null;
        };
      };
    };
    Functions: {
      get_tier_availability: {
        Args: { p_tier_id: string };
        Returns: number;
      };
    };
    Enums: {
      event_category:
        | "Conference"
        | "Workshop"
        | "Concert"
        | "Sports"
        | "Networking"
        | "Festival"
        | "Exhibition"
        | "Webinar";
      event_status: "Draft" | "Published" | "Cancelled" | "Completed";
      user_role: "attendee" | "organiser" | "admin";
      ticket_status: "active" | "used" | "cancelled" | "refunded";
    };
    CompositeTypes: Record<string, never>;
  };
};
