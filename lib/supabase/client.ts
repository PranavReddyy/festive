import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Convenience singleton for client components
let _client: ReturnType<typeof createSupabaseBrowserClient> | null = null;
export function getSupabaseBrowser() {
  if (!_client) _client = createSupabaseBrowserClient();
  return _client;
}
