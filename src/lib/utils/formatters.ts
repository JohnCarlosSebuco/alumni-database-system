import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(dateStr: string, pattern = "MMM d, yyyy"): string {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), pattern);
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function formatFullName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(" ");
}

export function formatCurrency(amount: number, currency = "PHP"): string {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-PH").format(n);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

export function batchYearLabel(year: number | null): string {
  if (!year) return "—";
  return `Batch ${year}`;
}
