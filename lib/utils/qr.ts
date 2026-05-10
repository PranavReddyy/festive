import QRCode from "qrcode";

export async function generateQRCodeDataURL(token: string): Promise<string> {
  return QRCode.toDataURL(token, {
    width: 320,
    margin: 2,
    color: { dark: "#09090b", light: "#ffffff" },
    errorCorrectionLevel: "H",
  });
}

export async function generateQRCodeBuffer(token: string): Promise<Buffer> {
  return QRCode.toBuffer(token, {
    width: 320,
    margin: 2,
    color: { dark: "#09090b", light: "#ffffff" },
    errorCorrectionLevel: "H",
  });
}
