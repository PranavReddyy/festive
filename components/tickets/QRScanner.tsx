"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Html5Qrcode as Html5QrcodeType } from "html5-qrcode";
import {
  Camera,
  CheckCircle2,
  XCircle,
  Keyboard,
  RefreshCcw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ScanStatus = "ok" | "duplicate" | "cancelled" | "invalid" | "error";

interface ScanEntry {
  id: string;
  status: ScanStatus;
  message: string;
  ticket_number?: string;
  attendee_name?: string;
  tier_name?: string;
  checked_in_at?: string;
  at: number;
}

interface CameraInfo {
  id: string;
  label: string;
}

const DUPLICATE_SUPPRESS_MS = 4000;
const FLASH_MS = 1800;

export function QRScanner({ eventId }: { eventId: string }) {
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [cameras, setCameras] = useState<CameraInfo[]>([]);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [flash, setFlash] = useState<ScanEntry | null>(null);
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);

  const scannerRef = useRef<Html5QrcodeType | null>(null);
  const lastTokensRef = useRef<Map<string, number>>(new Map());
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elementId = "qr-reader";

  const stats = useMemo(() => {
    const ok = history.filter((h) => h.status === "ok").length;
    const dup = history.filter((h) => h.status === "duplicate").length;
    const bad = history.filter(
      (h) => h.status === "invalid" || h.status === "cancelled" || h.status === "error",
    ).length;
    return { ok, dup, bad, total: history.length };
  }, [history]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      void hardStop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCameras() {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const list = await Html5Qrcode.getCameras();
      const mapped = list.map((c) => ({ id: c.id, label: c.label || "Camera" }));
      setCameras(mapped);
      if (!cameraId && mapped.length > 0) {
        // Prefer back camera if labeled.
        const back = mapped.find((c) => /back|rear|environment/i.test(c.label));
        setCameraId(back?.id ?? mapped[0].id);
      }
    } catch {
      /* permissions not granted yet — list will populate after start */
    }
  }

  async function start(forceCameraId?: string) {
    if (scanning || starting) return;
    setStarting(true);
    setPermError(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const reader = new Html5Qrcode(elementId, { verbose: false });
      scannerRef.current = reader;

      const config = { fps: 10, qrbox: { width: 240, height: 240 } };
      const onScan = (decoded: string) => {
        void onDecoded(decoded);
      };
      const onErr = () => {
        /* per-frame parse failures — ignore */
      };

      // Camera selection priority:
      //  1. Explicit deviceId from picker / argument.
      //  2. Previously chosen deviceId in state.
      //  3. Force rear camera via exact constraint (mobile).
      //  4. Soft preference for rear camera (desktop / single-cam).
      const explicitId = forceCameraId ?? cameraId;

      if (explicitId) {
        await reader.start(explicitId, config, onScan, onErr);
      } else {
        try {
          await reader.start(
            { facingMode: { exact: "environment" } },
            config,
            onScan,
            onErr,
          );
        } catch (rearErr) {
          // No rear camera (laptop, single-cam tablet) — fall back.
          // Re-create the reader because html5-qrcode leaves state behind on failure.
          try {
            await reader.clear();
          } catch {
            /* ignore */
          }
          const fallback = new Html5Qrcode(elementId, { verbose: false });
          scannerRef.current = fallback;
          try {
            await fallback.start(
              { facingMode: "environment" },
              config,
              onScan,
              onErr,
            );
          } catch {
            // Surface the original rear-camera error if both fail.
            throw rearErr;
          }
        }
      }

      setScanning(true);
      // Once permission is granted, refresh the camera list (now has labels).
      void loadCameras();
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
            ? e
            : "Could not start camera";
      setPermError(msg);
      scannerRef.current = null;
    } finally {
      setStarting(false);
    }
  }

  async function hardStop() {
    const r = scannerRef.current;
    scannerRef.current = null;
    if (r) {
      try {
        if (r.isScanning) await r.stop();
        await r.clear();
      } catch {
        /* ignore */
      }
    }
    setScanning(false);
  }

  async function switchCamera(id: string) {
    setCameraId(id);
    if (scanning) {
      await hardStop();
      await start(id);
    }
  }

  function pushFlash(entry: ScanEntry) {
    setFlash(entry);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlash(null), FLASH_MS);
  }

  function pushHistory(entry: ScanEntry) {
    setHistory((prev) => [entry, ...prev].slice(0, 25));
  }

  async function onDecoded(raw: string) {
    const token = raw.trim();
    if (!token) return;

    // Suppress duplicate scans of the same token within window.
    const now = Date.now();
    const last = lastTokensRef.current.get(token);
    if (last && now - last < DUPLICATE_SUPPRESS_MS) return;
    lastTokensRef.current.set(token, now);

    // Trim the map occasionally so it doesn't grow forever.
    if (lastTokensRef.current.size > 200) {
      const cutoff = now - DUPLICATE_SUPPRESS_MS;
      for (const [k, v] of lastTokensRef.current) {
        if (v < cutoff) lastTokensRef.current.delete(k);
      }
    }

    await validate(token);
  }

  async function validate(token: string) {
    setBusy(true);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      const res = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ qr_token: token, event_id: eventId }),
      });
      let json: Record<string, unknown> = {};
      try {
        json = await res.json();
      } catch {
        /* non-JSON body */
      }

      let entry: ScanEntry;
      if (res.ok) {
        const d = (json.data ?? {}) as Record<string, string>;
        entry = {
          id,
          status: "ok",
          message: "Checked in",
          ticket_number: d.ticket_number,
          attendee_name: d.attendee_name,
          tier_name: d.tier_name,
          checked_in_at: d.checked_in_at,
          at: Date.now(),
        };
      } else {
        const code = (json.code as string) || "";
        const apiError = (json.error as string) || "";
        let status: ScanStatus = "error";
        let message = apiError || `Request failed (HTTP ${res.status})`;
        if (code === "ALREADY_USED") {
          status = "duplicate";
          const t = json.checked_in_at as string | undefined;
          message = t
            ? `Already checked in at ${new Date(t).toLocaleTimeString()}`
            : "Already checked in";
        } else if (code === "INVALID_QR") {
          status = "invalid";
          message = "Unknown QR — not for this event";
        } else if (code === "CANCELLED") {
          status = "cancelled";
          message = apiError || "Ticket is cancelled";
        } else if (res.status === 401 || res.status === 403) {
          status = "error";
          message = apiError || "Not authorised for this event";
        } else if (res.status === 404) {
          status = "invalid";
          message = apiError || "Not found";
        } else if (res.status === 422) {
          // Schema rejection — surface the server's reason verbatim plus the
          // token preview so the operator can see what the camera read.
          status = "invalid";
          const preview =
            token.length > 24 ? `${token.slice(0, 16)}…` : token;
          message = `${apiError || "Rejected by server"} (token: ${preview})`;
        }
        entry = { id, status, message, at: Date.now() };
      }

      pushFlash(entry);
      pushHistory(entry);
    } catch (e) {
      const entry: ScanEntry = {
        id,
        status: "error",
        message: e instanceof Error ? `Network: ${e.message}` : "Network error",
        at: Date.now(),
      };
      pushFlash(entry);
      pushHistory(entry);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 max-w-xl mx-auto">
      {/* Camera viewport */}
      <div className="relative aspect-square w-full rounded-md border border-border bg-foreground/5 overflow-hidden">
        <div
          id={elementId}
          className="absolute inset-0 [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
        />

        {/* Idle / permission overlay */}
        {!scanning && !starting && (
          <div className="absolute inset-0 grid place-items-center text-center text-muted-foreground p-8 bg-foreground/5">
            <div className="space-y-3">
              <Camera className="h-10 w-10 mx-auto opacity-50" />
              {permError ? (
                <>
                  <p className="text-sm text-destructive font-medium">
                    Camera blocked
                  </p>
                  <p className="text-xs max-w-xs mx-auto">{permError}</p>
                  <p className="text-[11px] text-muted-foreground/80">
                    Allow camera access in your browser, then click Start again.
                  </p>
                </>
              ) : (
                <p className="text-sm">
                  Click start to enable the camera and scan QR codes.
                </p>
              )}
            </div>
          </div>
        )}

        {starting && (
          <div className="absolute inset-0 grid place-items-center bg-foreground/5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Starting camera…
            </div>
          </div>
        )}

        {/* Reticle */}
        {scanning && (
          <>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="relative h-60 w-60">
                <span className="absolute -top-px -left-px h-6 w-6 border-t-2 border-l-2 border-white drop-shadow" />
                <span className="absolute -top-px -right-px h-6 w-6 border-t-2 border-r-2 border-white drop-shadow" />
                <span className="absolute -bottom-px -left-px h-6 w-6 border-b-2 border-l-2 border-white drop-shadow" />
                <span className="absolute -bottom-px -right-px h-6 w-6 border-b-2 border-r-2 border-white drop-shadow" />
              </div>
            </div>
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/90 backdrop-blur text-[10px] font-medium uppercase tracking-[0.18em]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[oklch(0.65_0.18_150)] opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.55_0.16_150)]" />
              </span>
              Live
            </div>
            {busy && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/90 backdrop-blur text-[10px] font-medium">
                <Loader2 className="h-3 w-3 animate-spin" /> Validating
              </div>
            )}
          </>
        )}

        {/* Flash banner — recent scan result */}
        {flash && (
          <div
            className={cn(
              "absolute bottom-3 left-3 right-3 flex items-start gap-3 rounded-md border p-3 backdrop-blur shadow-sm transition-opacity",
              statusBg(flash.status),
            )}
          >
            {statusIcon(flash.status)}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium leading-tight">
                {flash.message}
              </p>
              {flash.attendee_name && (
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {flash.attendee_name}
                  {flash.tier_name ? ` · ${flash.tier_name}` : ""}
                  {flash.ticket_number ? ` · ${flash.ticket_number}` : ""}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {scanning ? (
          <Button onClick={hardStop} variant="outline" className="flex-1 min-w-35">
            Stop scanning
          </Button>
        ) : (
          <Button
            onClick={() => start()}
            disabled={starting}
            className="flex-1 min-w-35"
          >
            {starting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Starting…
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" /> Start scanning
              </>
            )}
          </Button>
        )}

        {cameras.length > 1 && (
          <select
            value={cameraId ?? ""}
            onChange={(e) => switchCamera(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-2 text-[12px]"
            aria-label="Camera"
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        )}

        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setHistory([]);
              lastTokensRef.current.clear();
            }}
            className="text-muted-foreground"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Reset session
          </Button>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-px bg-border border border-border rounded-md overflow-hidden">
        <Stat label="Scans" value={stats.total} />
        <Stat label="Admitted" value={stats.ok} tone="ok" />
        <Stat label="Duplicates" value={stats.dup} tone="warn" />
        <Stat label="Rejected" value={stats.bad} tone="bad" />
      </div>

      {/* Manual entry */}
      <div className="rounded-md border border-border bg-card">
        <div className="p-4 space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground flex items-center gap-1.5">
            <Keyboard className="h-3 w-3" /> Manual entry
          </label>
          <div className="flex gap-2">
            <Input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && manual.trim() && !busy) {
                  void validate(manual.trim());
                  setManual("");
                }
              }}
              placeholder="Paste ticket QR token (UUID)"
              className="font-mono text-[12px]"
            />
            <Button
              disabled={!manual.trim() || busy}
              onClick={async () => {
                await validate(manual.trim());
                setManual("");
              }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validate"}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Paste the raw token if a QR can&apos;t be scanned. Press Enter to validate.
          </p>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Recent scans
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {history.length} this session
            </span>
          </div>
          <ul className="divide-y divide-border max-h-72 overflow-auto">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex items-start gap-3 px-4 py-2.5 text-[13px]"
              >
                <span className="mt-0.5 shrink-0">{statusIcon(h.status, "sm")}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium leading-tight truncate">
                    {h.message}
                  </p>
                  {(h.attendee_name || h.tier_name || h.ticket_number) && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {[h.attendee_name, h.tier_name, h.ticket_number]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                  {new Date(h.at).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "ok" | "warn" | "bad";
}) {
  const color =
    tone === "ok"
      ? "text-[oklch(0.5_0.12_150)]"
      : tone === "bad"
        ? "text-destructive"
        : tone === "warn"
          ? "text-[oklch(0.55_0.14_70)]"
          : "text-foreground";
  return (
    <div className="bg-card px-3 py-2.5">
      <div className={cn("font-display text-2xl leading-none tabular-nums", color)}>
        {value}
      </div>
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}

function statusIcon(status: ScanStatus, size: "sm" | "md" = "md") {
  const cls = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  switch (status) {
    case "ok":
      return <CheckCircle2 className={cn(cls, "text-[oklch(0.5_0.12_150)] shrink-0")} />;
    case "duplicate":
      return <AlertTriangle className={cn(cls, "text-[oklch(0.55_0.14_70)] shrink-0")} />;
    case "invalid":
    case "cancelled":
    case "error":
    default:
      return <XCircle className={cn(cls, "text-destructive shrink-0")} />;
  }
}

function statusBg(status: ScanStatus) {
  switch (status) {
    case "ok":
      return "bg-[oklch(0.97_0.04_150)]/95 border-[oklch(0.5_0.12_150)]/40";
    case "duplicate":
      return "bg-[oklch(0.97_0.05_85)]/95 border-[oklch(0.55_0.14_70)]/40";
    case "invalid":
    case "cancelled":
    case "error":
    default:
      return "bg-[oklch(0.97_0.03_25)]/95 border-destructive/40";
  }
}

