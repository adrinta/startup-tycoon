import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/lib/stores/game-store";

function resetStore(overrides: Partial<ReturnType<typeof useGameStore.getState>> = {}) {
  useGameStore.setState({
    revenue: 0,
    activeUsers: 0,
    completedQuestIds: [],
    completedAt: {},
    drafts: {},
    ownedItemIds: [],
    ...overrides,
  });
}

describe("ekonomi & toko", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it("completeQuest memberi reward dan mencatat misi selesai", () => {
    const outcome = useGameStore
      .getState()
      .completeQuest({ id: "1.1", rewards: { coins: 40, xp: 20 } });

    expect(outcome.firstTime).toBe(true);
    expect(outcome.coins).toBe(40);
    expect(outcome.xp).toBe(20);
    expect(useGameStore.getState().revenue).toBe(40);
    expect(useGameStore.getState().completedQuestIds).toContain("1.1");
  });

  it("completeQuest kedua kali tidak memberi reward ganda", () => {
    const quest = { id: "1.1", rewards: { coins: 40, xp: 20 } };
    useGameStore.getState().completeQuest(quest);
    const second = useGameStore.getState().completeQuest(quest);

    expect(second.firstTime).toBe(false);
    expect(second.coins).toBe(0);
    expect(useGameStore.getState().revenue).toBe(40);
  });

  it("buff dekorasi menambah koin dan XP", () => {
    resetStore({ ownedItemIds: ["lemari-arsip", "kursi-ergonomis"] });
    const outcome = useGameStore
      .getState()
      .completeQuest({ id: "1.2", rewards: { coins: 100, xp: 50 } });

    // Lemari Arsip +10% koin, Kursi Ergonomis +10% XP.
    expect(outcome.coins).toBe(110);
    expect(outcome.xp).toBe(55);
  });

  it("membeli item memotong koin dan mencatat kepemilikan", () => {
    resetStore({ revenue: 500 });
    const result = useGameStore.getState().buyItem("lampu-berdiri");

    expect(result).toEqual({ ok: true });
    expect(useGameStore.getState().revenue).toBe(350);
    expect(useGameStore.getState().ownedItemIds).toContain("lampu-berdiri");
  });

  it("koin kurang ditolak tanpa mengubah saldo", () => {
    resetStore({ revenue: 50 });
    const result = useGameStore.getState().buyItem("server-mini");

    expect(result).toEqual({ ok: false, reason: "insufficient" });
    expect(useGameStore.getState().revenue).toBe(50);
    expect(useGameStore.getState().ownedItemIds).toEqual([]);
  });

  it("item yang sudah dimiliki tidak bisa dibeli lagi", () => {
    resetStore({ revenue: 500, ownedItemIds: ["lampu-berdiri"] });
    const result = useGameStore.getState().buyItem("lampu-berdiri");

    expect(result).toEqual({ ok: false, reason: "owned" });
    expect(useGameStore.getState().revenue).toBe(500);
  });

  it("item tidak dikenal ditolak", () => {
    const result = useGameStore.getState().buyItem("barang-halusinasi");
    expect(result).toEqual({ ok: false, reason: "unknown" });
  });

  it("kenaikan level dilaporkan saat XP melewati ambang", () => {
    resetStore({ activeUsers: 90 });
    const outcome = useGameStore
      .getState()
      .completeQuest({ id: "1.3", rewards: { coins: 10, xp: 30 } });

    expect(outcome.previousLevel).toBe(1);
    expect(outcome.newLevel).toBe(2);
    expect(outcome.levelUp).toBe(true);
  });

  it("reset menghapus progres sekaligus kepemilikan dekorasi", () => {
    resetStore({ revenue: 500, ownedItemIds: ["karpet-motivasi"] });
    useGameStore.getState().resetGame();

    const state = useGameStore.getState();
    expect(state.revenue).toBe(0);
    expect(state.ownedItemIds).toEqual([]);
    expect(state.completedQuestIds).toEqual([]);
  });
});
