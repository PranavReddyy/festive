import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <div className="max-w-md text-center space-y-6">
        <p className="font-display text-[8rem] leading-none italic text-foreground/15">
          404
        </p>
        <h1 className="font-display text-3xl">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
