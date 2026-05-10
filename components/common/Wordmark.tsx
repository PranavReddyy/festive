import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Festive wordmark — pure type, no icon. The italic "F" gives it
 * editorial character without leaning on a logo glyph.
 */
export function Wordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };
  return (
    <Link
      href="/"
      className={cn(
        "font-display tracking-tight leading-none inline-flex items-baseline",
        sizes[size],
        className,
      )}
      aria-label="Festive — home"
    >
      <span className="italic">F</span>
      <span>estive</span>
    </Link>
  );
}
