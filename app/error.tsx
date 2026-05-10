"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <div className="max-w-md text-center space-y-4">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="font-display text-3xl">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          {error.message || "Please try again in a moment."}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
