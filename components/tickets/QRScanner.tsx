"use client";

import { useEffect, useRef, useState } from "react";
import type { Html5Qrcode as Html5QrcodeType } from "html5-qrcode";
import { Camera, CheckCircle2, XCircle, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScanResult {
  ok: boolean;
  message: string;
  ticket_number?: string;
  attendee_name?: string;
  tier_name?: string;
  checked_in_at?: string;
}

export function QRScanner({ eventId }: { eventId: string }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const scannerRef = useRef<Html5QrcodeType | null>(null);
  const elementId = "qr-reader";

  useEffect(() => {
    return () => {
      void stop();
    };
  }, []);

  async function start() {
    setResult(null);
    if (scanning) return;
    const { Html5Qrcode } = await import("html5-qrcode");
    const reader = new Html5Qrcode(elementId);
    scannerRef.current = reader;
    try {
      await reader.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decoded) => {
          await stop();
          await validate(decoded);
        },
        () => {},
      );
      setScanning(true);
    } catch (e) {
      setResult({
        ok: false,
        message:
          e instanceof Error
            ? `Camera error: ${e.message}`
            : "Could not start camera",
      });
    }
  }

  async function stop() {
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

  async function validate(token: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ qr_token: token, event_id: eventId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setResult({
          ok: false,
          message:
            json.code === "ALREADY_USED"
              ? `Already checked in${json.checked_in_at ? ` at ${new Date(json.checked_in_at).toLocaleTimeString()}` : ""}`
              : (json.error ?? "Invalid QR"),
        });
      } else {
        setResult({
          ok: true,
          message: "Checked in",
          ticket_number: json.data.ticket_number,
          attendee_name: json.data.attendee_name,
          tier_name: json.data.tier_name,
          checked_in_at: json.data.checked_in_at,
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div
        className="relative aspect-square w-full rounded-md border border-border bg-foreground/5 overflow-hidden"
      >
        {/* html5-qrcode mounts its <video> here. Container must always be visible
            with real dimensions when reader.start() is called, otherwise the
            stream attaches but renders at 0×0. */}
        <div
          id={elementId}
          className="absolute inset-0 [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
        />
        {!scanning && (
          <div className="absolute inset-0 grid place-items-center text-center text-muted-foreground p-8 bg-foreground/5">
            <div>
              <Camera className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Click start to enable the camera and scan QR codes.
              </p>
            </div>
          </div>
        )}
        {scanning && (
          <div className="absolute inset-0 m-auto w-60 h-60 border border-foreground/40 rounded-md pointer-events-none" />
        )}
      </div>

      <div className="flex gap-2">
        {scanning ? (
          <Button onClick={stop} variant="outline" className="flex-1">
            Stop scanning
          </Button>
        ) : (
          <Button onClick={start} className="flex-1">
            <Camera className="h-4 w-4" /> Start scanning
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4 space-y-2">
          <label className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
            <Keyboard className="h-3 w-3" /> Manual entry
          </label>
          <div className="flex gap-2">
            <Input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Paste QR token"
            />
            <Button
              disabled={!manual || busy}
              onClick={async () => {
                await validate(manual.trim());
                setManual("");
              }}
            >
              Validate
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card
          className={cn(
            "border",
            result.ok
              ? "border-[oklch(0.5_0.12_150)]/40 bg-[oklch(0.97_0.04_150)]"
              : "border-destructive/40 bg-[oklch(0.97_0.03_25)]",
          )}
        >
          <CardContent className="p-4 flex items-start gap-3">
            {result.ok ? (
              <CheckCircle2 className="h-5 w-5 text-[oklch(0.5_0.12_150)] shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-[14px] font-medium">{result.message}</p>
              {result.attendee_name && (
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {result.attendee_name} · {result.tier_name} ·{" "}
                  {result.ticket_number}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
