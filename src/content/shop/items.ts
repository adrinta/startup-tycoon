export type BuffKind = "xp" | "coins" | "preview" | "hint";

export type ShopBuff =
  | { kind: "xp"; pct: number }
  | { kind: "coins"; pct: number }
  | { kind: "preview" }
  | { kind: "hint" };

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  category: "furniture" | "electronics" | "decoration";
  cost: number;
  description: string;
  buff: ShopBuff;
}

/**
 * Katalog dekorasi kantor. Efek buff bersifat pasif dan langsung aktif
 * setelah dibeli. Total harga seluruh katalog Babak 1 sengaja lebih besar
 * dari total reward agar pemain harus memilih.
 */
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "karpet-motivasi",
    name: "Karpet Motivasi",
    emoji: "🧶",
    category: "decoration",
    cost: 100,
    description: "Aksen lantai yang membuat ruangan terasa lebih hidup.",
    buff: { kind: "coins", pct: 5 },
  },
  {
    id: "tanaman-hias",
    name: "Tanaman Hias",
    emoji: "🪴",
    category: "decoration",
    cost: 120,
    description: "Udara segar, pikiran jernih — belajar jadi lebih fokus.",
    buff: { kind: "xp", pct: 5 },
  },
  {
    id: "lemari-arsip",
    name: "Lemari Arsip",
    emoji: "🗃️",
    category: "furniture",
    cost: 140,
    description: "Dokumen klien tersimpan rapi, pembayaran lancar.",
    buff: { kind: "coins", pct: 10 },
  },
  {
    id: "lampu-berdiri",
    name: "Lampu Berdiri",
    emoji: "💡",
    category: "furniture",
    cost: 150,
    description: "Cahaya terang membantu Ada mengingat petunjuk penting.",
    buff: { kind: "hint" },
  },
  {
    id: "kursi-ergonomis",
    name: "Kursi Ergonomis",
    emoji: "🪑",
    category: "furniture",
    cost: 180,
    description: "Duduk nyaman, coding lebih lama tanpa pegal.",
    buff: { kind: "xp", pct: 10 },
  },
  {
    id: "mesin-espresso",
    name: "Mesin Espresso",
    emoji: "☕",
    category: "electronics",
    cost: 220,
    description: "Kafein mempercepat refleks — pratinjau kode berjalan lebih gesit.",
    buff: { kind: "preview" },
  },
  {
    id: "server-mini",
    name: "Mini Server Rack",
    emoji: "🖥️",
    category: "electronics",
    cost: 260,
    description: "Rack server mungil dengan lampu LED hijau yang menenangkan.",
    buff: { kind: "xp", pct: 15 },
  },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}

export interface BuffTotals {
  xpPct: number;
  coinPct: number;
  fastPreview: boolean;
  hintUnlocked: boolean;
}

export function computeBuffs(ownedItemIds: string[]): BuffTotals {
  const totals: BuffTotals = { xpPct: 0, coinPct: 0, fastPreview: false, hintUnlocked: false };
  for (const id of ownedItemIds) {
    const item = getShopItem(id);
    if (!item) continue;
    switch (item.buff.kind) {
      case "xp":
        totals.xpPct += item.buff.pct;
        break;
      case "coins":
        totals.coinPct += item.buff.pct;
        break;
      case "preview":
        totals.fastPreview = true;
        break;
      case "hint":
        totals.hintUnlocked = true;
        break;
    }
  }
  return totals;
}

export function describeBuff(buff: ShopBuff): string {
  switch (buff.kind) {
    case "xp":
      return `XP +${buff.pct}%`;
    case "coins":
      return `Koin +${buff.pct}%`;
    case "preview":
      return "Pratinjau lebih cepat";
    case "hint":
      return "Petunjuk dari Ada";
  }
}

export function summarizeBuffs(totals: BuffTotals): string[] {
  const parts: string[] = [];
  if (totals.xpPct > 0) parts.push(`XP +${totals.xpPct}%`);
  if (totals.coinPct > 0) parts.push(`Koin +${totals.coinPct}%`);
  if (totals.fastPreview) parts.push("Pratinjau cepat");
  if (totals.hintUnlocked) parts.push("Petunjuk aktif");
  return parts;
}
