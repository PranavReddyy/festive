import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground",
        secondary: "border-transparent bg-muted text-foreground",
        accent: "border-transparent bg-accent text-accent-foreground",
        success:
          "border-transparent bg-[oklch(0.95_0.05_150)] text-[oklch(0.4_0.1_150)]",
        warning:
          "border-transparent bg-[oklch(0.96_0.06_75)] text-[oklch(0.45_0.13_70)]",
        destructive:
          "border-transparent bg-[oklch(0.96_0.04_25)] text-[oklch(0.5_0.18_25)]",
        outline: "text-foreground border-border",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
