export type CurrencyAmount = { currency: string; amount: number };

/** Formats one amount in its own currency, e.g. ₦200, $5.00, £10, €7. */
export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: (currency || "NGN").toUpperCase(),
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
  }
}

/** Formats per-currency totals without ever adding across currencies. */
export function formatMoneyByCurrency(rows?: CurrencyAmount[] | null): string {
  if (!rows || rows.length === 0) return formatMoney(0, "NGN");
  return [...rows]
    .sort((a, b) => b.amount - a.amount)
    .map((r) => formatMoney(r.amount, r.currency))
    .join(" · ");
}
