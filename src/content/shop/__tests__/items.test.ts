import { describe, expect, it } from "vitest";
import { SHOP_ITEMS, computeBuffs, describeBuff, getShopItem } from "@/content/shop/items";

describe("katalog toko", () => {
  it("id unik dan harga positif", () => {
    const ids = SHOP_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of SHOP_ITEMS) {
      expect(item.cost, `harga ${item.id}`).toBeGreaterThan(0);
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
    }
  });

  it("getShopItem menemukan item dan mengembalikan undefined untuk id asing", () => {
    expect(getShopItem("lampu-berdiri")?.name).toBe("Lampu Berdiri");
    expect(getShopItem("tidak-ada")).toBeUndefined();
  });

  it("computeBuffs menjumlahkan bonus persentase", () => {
    const buffs = computeBuffs(["kursi-ergonomis", "tanaman-hias", "server-mini"]);
    expect(buffs.xpPct).toBe(30);
    expect(buffs.coinPct).toBe(0);
  });

  it("computeBuffs menandai buff preview dan hint", () => {
    expect(computeBuffs(["mesin-espresso"]).fastPreview).toBe(true);
    expect(computeBuffs(["lampu-berdiri"]).hintUnlocked).toBe(true);
    expect(computeBuffs(["karpet-motivasi"]).fastPreview).toBe(false);
  });

  it("mengabaikan item yang tidak dikenal", () => {
    expect(computeBuffs(["entah-apa", ""])).toEqual({
      xpPct: 0,
      coinPct: 0,
      fastPreview: false,
      hintUnlocked: false,
    });
  });

  it("describeBuff memberi label yang berbeda per jenis buff", () => {
    expect(describeBuff({ kind: "xp", pct: 10 })).toBe("XP +10%");
    expect(describeBuff({ kind: "coins", pct: 5 })).toBe("Koin +5%");
    expect(describeBuff({ kind: "preview" })).toBe("Pratinjau lebih cepat");
    expect(describeBuff({ kind: "hint" })).toBe("Petunjuk dari Ada");
  });
});
