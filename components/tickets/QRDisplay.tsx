"use client";

import { useEffect, useState } from "react";
import { generateQRCodeDataURL } from "@/lib/utils/qr";
import { Skeleton } from "@/components/ui/skeleton";

export function QRDisplay({
  token,
  size = 220,
}: {
  token: string;
  size?: number;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateQRCodeDataURL(token).then((u) => {
      if (!cancelled) setDataUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!dataUrl) {
    return <Skeleton style={{ width: size, height: size }} className="rounded-md" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="Ticket QR code"
      width={size}
      height={size}
      className="rounded-md bg-white p-3"
    />
  );
}
