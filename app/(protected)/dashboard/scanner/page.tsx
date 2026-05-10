import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseRSCClient } from "@/lib/supabase/server";
import { QRScanner } from "@/components/tickets/QRScanner";

type Props = { searchParams: Promise<{ event?: string }> };

export const dynamic = "force-dynamic";

export default async function ScannerPage({ searchParams }: Props) {
  const { event } = await searchParams;
  const supabase = await createSupabaseRSCClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/scanner");

  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_date, status")
    .eq("organiser_id", user.id)
    .order("event_date", { ascending: true });

  const evList = events ?? [];
  if (!event) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-display text-3xl">Pick an event to scan for</h1>
        {evList.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            You don&apos;t have any events yet.
          </p>
        ) : (
          <div className="space-y-2">
            {evList.map((e) => (
              <Link
                key={e.id}
                href={`/dashboard/scanner?event=${e.id}`}
                className="block rounded-md border border-border p-4 hover:border-foreground/40 transition-colors"
              >
                <p className="font-semibold">{e.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(e.event_date).toLocaleString("en-IN")} · {e.status}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const ev = evList.find((e) => e.id === event);
  if (!ev) redirect("/dashboard/scanner");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">{ev.title}</h1>
          <p className="text-sm text-muted-foreground">Check-in scanner</p>
        </div>
        <Link
          href="/dashboard/scanner"
          className="text-sm text-muted-foreground hover:underline"
        >
          Switch event
        </Link>
      </div>
      <QRScanner eventId={ev.id} />
    </div>
  );
}
