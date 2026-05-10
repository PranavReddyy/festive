"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const FRAMES = [
  "[●     ]",
  "[ ●    ]",
  "[  ●   ]",
  "[   ●  ]",
  "[    ● ]",
  "[     ●]",
  "[    ● ]",
  "[   ●  ]",
  "[  ●   ]",
  "[ ●    ]",
];

export function LoadingSpinner({
  className,
  label = "loading",
  size: _size,
}: {
  className?: string;
  label?: string;
  /** Retained for API compatibility with the previous icon spinner. Unused. */
  size?: number;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % FRAMES.length), 90);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center gap-3", className)}
    >
      <span
        aria-hidden
        className="font-mono text-[12px] tracking-tight text-foreground/75"
      >
        {FRAMES[i]}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
