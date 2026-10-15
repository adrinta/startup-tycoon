const numberFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatRupiah(value: number): string {
  return `Rp ${numberFormatter.format(value)}`;
}

export function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
