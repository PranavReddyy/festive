"use client";

/**
 * Festive — ASCII art library.
 *
 * Editorial, monospace, ink-on-paper. Some pieces are static marginalia,
 * others are interactive — parallax tickets, cursor-tracking constellations,
 * a Konami easter egg, and a console signature. The goal is to fill the
 * negative space the product deliberately leaves, without breaking the
 * typographic register.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────────────────
// AsciiTicket — static ticket card with a gentle hover tilt.
// ──────────────────────────────────────────────────────────────────────────

const TICKET_FRAME = String.raw`
╔══════════════════════════════════════════════╤══════════════════╗
║                                              │                  ║
║    F E S T I V E   ·   ADMIT  ONE            │     no.          ║
║                                              │                  ║
║    ──────────────────────────────────────    │     0 0 4 {N}    ║
║                                              │                  ║
║    THE LOFT  ·  ROW 03  ·  SEAT 12           │       ★          ║
║                                              │                  ║
║    ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │                  ║
║                                              │   ┌──────────┐   ║
║      DOORS    19:30                          │   │ █▀▀ █▀█  │   ║
║      DATE     {DATE}                         │   │ █▀▀ █▀▄  │   ║
║      TIER     general · ₹ 1,200              │   │ ▀▀▀ ▀▀▀  │   ║
║                                              │   └──────────┘   ║
║    ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │                  ║
║                                              │     scan at      ║
║    issued · 14·apr·26     non-transferable   │     the door     ║
║                                              │                  ║
╚══════════════════════════════════════════════╧══════════════════╝
                ─ ─ ─ ─ ─ ─ tear here ─ ─ ─ ─ ─ ─
`.trim();

export function AsciiTicket({
  className,
  date = "29·04·26",
}: {
  className?: string;
  date?: string;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [num, setNum] = useState(2);

  // Cycle the last digit slowly to feel alive.
  useEffect(() => {
    const id = setInterval(() => setNum((n) => (n + 1) % 10), 1700);
    return () => clearInterval(id);
  }, []);

  // Gentle hover tilt — follows cursor only while inside the card.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    let raf = 0;
    const onEnter = () => {
      const onMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() =>
          setTilt({ rx: -dy * 6, ry: dx * 9 }),
        );
      };
      window.addEventListener("mousemove", onMove);
      card.addEventListener(
        "mouseleave",
        () => {
          window.removeEventListener("mousemove", onMove);
          cancelAnimationFrame(raf);
          setTilt({ rx: 0, ry: 0 });
        },
        { once: true },
      );
    };
    card.addEventListener("mouseenter", onEnter);
    return () => {
      card.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
    };
  }, []);

  const text = TICKET_FRAME.replace(
    "{DATE}",
    date.padEnd(8).slice(0, 8),
  ).replace("{N}", String(num));

  return (
    <div className={cn("relative perspective-distant select-none", className)}>
      <div
        ref={cardRef}
        className={cn(
          "relative bg-background border border-border shadow-[0_30px_60px_-30px_rgba(0,0,0,0.14)]",
          "px-6 py-7 md:px-8 md:py-9",
        )}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
        }}
      >
        <pre className="font-mono text-[8px] sm:text-[9px] md:text-[10.5px] lg:text-[11.5px] leading-[1.35] text-foreground whitespace-pre">
          {text}
        </pre>

        {/* Live status pill */}
        <div className="absolute -bottom-3 right-6 bg-background border border-border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.22em] text-muted-foreground inline-flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
          live
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// AsciiSpinner — animated dot that travels around a square.
// ──────────────────────────────────────────────────────────────────────────

const SPINNER_FRAMES = [
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

export function AsciiSpinner({
  className,
  label = "loading",
}: {
  className?: string;
  label?: string;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % SPINNER_FRAMES.length), 90);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={cn("inline-flex items-center gap-3", className)} aria-label={label}>
      <span className="font-mono text-[11px] tracking-tight text-foreground/70">
        {SPINNER_FRAMES[i]}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// AsciiInbox — small print marginalia for the empty state.
// ──────────────────────────────────────────────────────────────────────────

const INBOX = String.raw`
   ┌──────────┐
   │          │
   │  · ·  ·  │
   │          │
   └──────────┘
       └─┘
`.trim();

export function AsciiInbox({ className }: { className?: string }) {
  return (
    <pre
      aria-hidden
      className={cn(
        "font-mono text-[10px] leading-[1.2] text-muted-foreground/70 select-none",
        className,
      )}
    >
      {INBOX}
    </pre>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// AsciiSignature — footer flourish, a hand-drawn rule.
// ──────────────────────────────────────────────────────────────────────────

export function AsciiSignature({ className }: { className?: string }) {
  return (
    <pre
      aria-hidden
      className={cn(
        "font-mono text-[11px] leading-none text-muted-foreground/60 select-none",
        className,
      )}
    >
      {`·  ─  ·  ─  ·  ✦  ─  ·  ─  ·`}
    </pre>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// AsciiBigNumber — large display digits used on the 404 page.
// ──────────────────────────────────────────────────────────────────────────

const BIG: Record<string, string[]> = {
  "0": ["╔═══╗", "║   ║", "║   ║", "║   ║", "╚═══╝"],
  "1": ["  ╗  ", "  ║  ", "  ║  ", "  ║  ", "  ╝  "],
  "2": ["╔═══╗", "    ║", "╔═══╝", "║    ", "╚═══╝"],
  "3": ["╔═══╗", "    ║", "  ══╣", "    ║", "╚═══╝"],
  "4": ["║   ║", "║   ║", "╚═══╣", "    ║", "    ╝"],
  "5": ["╔═══╗", "║    ", "╚═══╗", "    ║", "╚═══╝"],
  "6": ["╔═══╗", "║    ", "╠═══╗", "║   ║", "╚═══╝"],
  "7": ["╔═══╗", "    ║", "   ╔╝", "  ╔╝ ", "  ╝  "],
  "8": ["╔═══╗", "║   ║", "╠═══╣", "║   ║", "╚═══╝"],
  "9": ["╔═══╗", "║   ║", "╚═══╣", "    ║", "╚═══╝"],
};

export function AsciiBigNumber({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const rows = [0, 1, 2, 3, 4]
    .map((r) =>
      text
        .split("")
        .map((ch) => BIG[ch]?.[r] ?? "     ")
        .join("  "),
    )
    .join("\n");
  return (
    <pre
      aria-hidden
      className={cn(
        "font-mono text-[11px] md:text-[14px] leading-[1.2] text-foreground select-none",
        className,
      )}
    >
      {rows}
    </pre>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// AsciiLoadingScreen — full-page loading ceremony with a marquee progress
// bar, a wordmark made of block characters, and rotating status copy.
// ──────────────────────────────────────────────────────────────────────────

const FESTIVE_BLOCK = String.raw`
███████ ███████ ███████ ████████ ██ ██    ██ ███████
██      ██      ██         ██    ██ ██    ██ ██
█████   █████   ███████    ██    ██ ██    ██ █████
██      ██           ██    ██    ██  ██  ██  ██
██      ███████ ███████    ██    ██   ████   ███████
`.trim();

const STATUS_LINES = [
  "warming the projector",
  "checking the guest list",
  "tearing tickets at the door",
  "uncoiling the cables",
  "tuning the room",
];

export function AsciiLoadingScreen({ className }: { className?: string }) {
  const [tick, setTick] = useState(0);
  const [status, setStatus] = useState(0);

  useEffect(() => {
    const a = setInterval(() => setTick((t) => (t + 1) % 100), 60);
    const b = setInterval(
      () => setStatus((s) => (s + 1) % STATUS_LINES.length),
      1400,
    );
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);

  // Build a 40-cell progress bar where the leading edge marches across.
  const cells = 40;
  const head = tick % cells;
  const bar = Array.from({ length: cells }, (_, i) => {
    const distance = (i - head + cells) % cells;
    if (distance === 0) return "█";
    if (distance === 1) return "▓";
    if (distance === 2) return "▒";
    if (distance === 3) return "░";
    return " ";
  }).join("");

  return (
    <div
      className={cn(
        "fixed inset-0 z-100 grid place-items-center bg-background",
        className,
      )}
    >
      <div className="text-center px-6 max-w-3xl">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground mb-10">
          one moment
        </p>

        <pre className="font-mono text-[6px] sm:text-[8px] md:text-[10px] lg:text-[12px] leading-[1.1] text-foreground select-none whitespace-pre">
          {FESTIVE_BLOCK}
        </pre>

        <div className="mt-12 mx-auto max-w-md">
          <pre className="font-mono text-[12px] tracking-tighter text-foreground select-none whitespace-pre">
            {`[${bar}]`}
          </pre>
          <p className="mt-6 text-[11px] font-mono text-muted-foreground tabular-nums">
            <span className="opacity-50">$</span>{" "}
            <span className="italic">{STATUS_LINES[status]}</span>
            <span className="ml-1 inline-block w-2 h-3 align-[-2px] bg-foreground animate-pulse" />
          </p>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// AsciiConstellation — interactive starfield tracking the cursor.
// Decorative, runs at ~30fps via rAF, throttled position updates.
// ──────────────────────────────────────────────────────────────────────────

export function AsciiConstellation({
  cols = 56,
  rows = 9,
  className,
}: {
  cols?: number;
  rows?: number;
  className?: string;
}) {
  const ref = useRef<HTMLPreElement | null>(null);
  const [grid, setGrid] = useState<string[][]>(() =>
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => "·")),
  );
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const seedRef = useRef<number[][]>(
    Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.random()),
    ),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const charW = rect.width / cols;
      const charH = rect.height / rows;
      mouseRef.current = {
        x: (e.clientX - rect.left) / charW,
        y: (e.clientY - rect.top) / charH,
      };
    };
    const onLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 60) {
        last = t;
        const next: string[][] = [];
        const { x: mx, y: my } = mouseRef.current;
        for (let r = 0; r < rows; r++) {
          const row: string[] = [];
          for (let c = 0; c < cols; c++) {
            const dx = (c - mx) * 0.5;
            const dy = r - my;
            const d = Math.sqrt(dx * dx + dy * dy);
            const seed = seedRef.current[r][c];
            const twinkle = (Math.sin(t / 800 + seed * 7) + 1) / 2;

            let ch = " ";
            if (d < 1.5) ch = "✦";
            else if (d < 3) ch = "✧";
            else if (d < 5) ch = "+";
            else if (d < 8) ch = seed > 0.5 ? "·" : " ";
            else if (seed + twinkle * 0.4 > 1.15) ch = "·";
            else ch = " ";
            row.push(ch);
          }
          next.push(row);
        }
        setGrid(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [cols, rows]);

  const text = grid.map((r) => r.join("")).join("\n");

  return (
    <pre
      ref={ref}
      aria-hidden
      className={cn(
        "font-mono text-[11px] md:text-[12px] leading-[1.1] select-none whitespace-pre overflow-hidden",
        className,
      )}
    >
      {text}
    </pre>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// AsciiQRBlock — decorative pseudo-QR block that pulses on hover.
// ──────────────────────────────────────────────────────────────────────────

const QR_LINES = [
  "█▀▀▀▀▀█ ▄ █▄▀▄ ▀ █▀▀▀▀▀█",
  "█ ███ █ █▀ ▄▄▀▀▄ █ ███ █",
  "█ ▀▀▀ █  ▀▀▀█▄▀  █ ▀▀▀ █",
  "▀▀▀▀▀▀▀ █ █ █ █  ▀▀▀▀▀▀▀",
  "▀ ▄█ ▀▀▄  ▀▄▀▀▄▀▄ ██ ▀▄ ",
  " ▄▀█▄▄▀█▀ ▀  ▀▄ ▄ ▄▄ ▀▄ ",
  "▀ ▀ ▀ ▀ █▄▀▄▀ ▄▀▀▀▀▀█▄ ▀",
  "█▀▀▀▀▀█  ▀█▄ ▄▄ █ ▀ █▀▄ ",
  "█ ███ █ ▄▀▄ ▀ ▀ ▀▀▀▀█ ▄ ",
  "█ ▀▀▀ █ █▄ ▀▀█▀▄▄ ▄  ▀▄ ",
  "▀▀▀▀▀▀▀ ▀  ▀ ▀ ▀▀ ▀▀▀ ▀▀",
];

export function AsciiQRBlock({ className }: { className?: string }) {
  return (
    <pre
      aria-hidden
      className={cn(
        "font-mono text-[10px] md:text-[11px] leading-[1.05] text-foreground select-none",
        "transition-transform duration-300 hover:scale-[1.04]",
        className,
      )}
    >
      {QR_LINES.join("\n")}
    </pre>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// AsciiCornerBracket — small typographic ornament.
// ──────────────────────────────────────────────────────────────────────────

export function AsciiCornerBracket({
  variant = "tl",
  className,
}: {
  variant?: "tl" | "tr" | "bl" | "br";
  className?: string;
}) {
  const map = {
    tl: "┌─\n│ ",
    tr: "─┐\n │",
    bl: "│ \n└─",
    br: " │\n─┘",
  };
  return (
    <pre
      aria-hidden
      className={cn(
        "font-mono text-[10px] leading-[1.1] text-muted-foreground/60 select-none",
        className,
      )}
    >
      {map[variant]}
    </pre>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// KonamiEasterEgg — listens for ↑↑↓↓←→←→BA, opens a celebratory overlay.
// Also prints a console signature on mount for the curious developer.
// ──────────────────────────────────────────────────────────────────────────

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const FIREWORKS = String.raw`
        .   *      .   *           *  .         .
   *       .   .            .  *      .       *
       *         *      .                .         *
        ╔════════════════════════════════════╗
        ║                                    ║
        ║       F E S T I V E   ·   38       ║
        ║                                    ║
        ║      you found the secret door     ║
        ║                                    ║
        ╚════════════════════════════════════╝
   *        *      *      .          .       *
       .         .    *     .    *           *
`.trim();

export function KonamiEasterEgg() {
  const [open, setOpen] = useState(false);
  const seqRef = useRef<string[]>([]);

  useEffect(() => {
    // Console signature on first mount.
    if (typeof window !== "undefined" && !window.__festiveSig) {
      window.__festiveSig = true;
      const big = [
        "%c",
        "  ╔═══════════════════════════════════════════════╗",
        "  ║                                               ║",
        "  ║    F E S T I V E    —    Team 38 / 2026       ║",
        "  ║                                               ║",
        "  ║    Curious? Source is open.                   ║",
        "  ║    Try ↑↑↓↓←→←→BA on any Festive page.        ║",
        "  ║                                               ║",
        "  ╚═══════════════════════════════════════════════╝",
        "",
      ].join("\n");
      // eslint-disable-next-line no-console
      console.log(
        big,
        "color: oklch(0.18 0.012 50); font-family: ui-monospace, monospace;",
      );
    }

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      seqRef.current = [...seqRef.current, key].slice(-KONAMI.length);
      if (
        seqRef.current.length === KONAMI.length &&
        seqRef.current.every((k, i) => k === KONAMI[i])
      ) {
        setOpen(true);
        seqRef.current = [];
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Easter egg"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-200 grid place-items-center bg-background/95 backdrop-blur-sm cursor-pointer animate-in fade-in duration-300"
    >
      <pre className="font-mono text-[10px] md:text-[14px] leading-[1.2] text-foreground select-none px-6 text-center">
        {FIREWORKS}
      </pre>
      <p className="absolute bottom-10 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        click anywhere · or press esc
      </p>
    </div>
  );
}

declare global {
  interface Window {
    __festiveSig?: boolean;
  }
}
