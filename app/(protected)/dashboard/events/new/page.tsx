import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EventForm } from "@/components/events/EventForm";

export default function NewEventPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-3 w-3" /> Back to dashboard
      </Link>
      <div>
        <h1 className="font-display text-4xl">Create an event</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tell us about your event. You can publish it once everything looks
          right.
        </p>
      </div>
      <EventForm />
    </div>
  );
}
