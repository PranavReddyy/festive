import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function StatsCard({
  label,
  value,
  delta,
  icon,
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <p className="mt-4 font-display text-4xl leading-none">{value}</p>
        {delta && (
          <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {delta}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
