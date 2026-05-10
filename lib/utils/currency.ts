/**
 * Format a price stored in PAISE for INR display.
 */
export function formatCurrency(paise: number | null | undefined): string {
  if (paise == null) return "—";
  if (paise === 0) return "Free";
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}
