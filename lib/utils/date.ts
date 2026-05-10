import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";

export function formatEventDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "EEE, d MMM · h:mm a");
}

export function formatLongDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "EEEE, d MMMM yyyy");
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "h:mm a");
}

export function relativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isPast(date: string | Date): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return isBefore(d, new Date());
}

export function isFuture(date: string | Date): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return isAfter(d, new Date());
}
