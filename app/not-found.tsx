import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AsciiBigNumber } from "@/components/common/Ascii";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <div className="max-w-xl text-center space-y-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Festive · section ∅
        </p>
        <div className="flex justify-center">
          <AsciiBigNumber text="404" />
        </div>
        <h1 className="font-display text-3xl">Ticket not found.</h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
          Take it from the top — there&apos;s plenty more on the bill.
        </p>
        <Button asChild>
          <Link href="/">Back to the foyer</Link>
        </Button>
      </div>
    </div>
  );
}
