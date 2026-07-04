const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Денежная сумма в USD без копеек: 1234 → «$1,234». */
export function formatCurrency(value: number): string {
  return currencyFmt.format(value);
}

/** Доля 0..1 в проценты: 0.123 → «12.3%». */
export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** Относительное время: «just now», «5 seconds ago», «2 hours ago». */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);

  if (abs < 45) return rtf.format(diffSec, "second");
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  return rtf.format(diffDay, "day");
}
