import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { AsciiInbox } from "./Ascii";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-20 px-6 rounded-md border border-dashed border-border",
        className,
      )}
    >
      {icon !== null && (
        <div className="mb-5 text-muted-foreground">
          {icon ?? <AsciiInbox />}
        </div>
      )}
      <h3 className="font-display text-2xl">{title}</h3>
      {description && (
        <p className="mt-2 text-[13px] text-muted-foreground max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
