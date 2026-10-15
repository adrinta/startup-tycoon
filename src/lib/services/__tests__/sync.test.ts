import { describe, expect, it } from "vitest";
import {
  mergeSnapshots,
  normalizeSnapshot,
  snapshotsEqual,
  type ProgressSnapshotFull,
} from "@/lib/services/sync";

const base: ProgressSnapshotFull = {
  revenue: 0,
  activeUsers: 0,
  completedQuestIds: [],
  ownedItemIds: [],
};

describe("mergeSnapshots (login pertama: lokal <-> cloud)", () => {
  it("menggabungkan misi & dekorasi sebagai union terurut", () => {
    const merged = mergeSnapshots(
      {
        ...base,
        revenue: 100,
        activeUsers: 50,
        completedQuestIds: ["1.2", "1.1"],
        ownedItemIds: ["lampu-berdiri"],
      },
      {
        ...base,
        revenue: 80,
        activeUsers: 70,
        completedQuestIds: ["1.1", "1.3"],
        ownedItemIds: ["karpet-motivasi"],
      },
    );

    expect(merged.revenue).toBe(100);
    expect(merged.activeUsers).toBe(70);
    expect(merged.completedQuestIds).toEqual(["1.1", "1.2", "1.3"]);
    expect(merged.ownedItemIds).toEqual(["karpet-motivasi", "lampu-berdiri"]);
  });

  it("memakai nilai revenue/XP terbesar (konservatif)", () => {
    const merged = mergeSnapshots(
      { ...base, revenue: 10, activeUsers: 5 },
      { ...base, revenue: 999, activeUsers: 100 },
    );
    expect(merged.revenue).toBe(999);
    expect(merged.activeUsers).toBe(100);
  });
});

describe("snapshotsEqual", () => {
  it("true untuk isi dan urutan yang sama", () => {
    expect(snapshotsEqual({ ...base }, { ...base })).toBe(true);
  });

  it("false bila ada perbedaan nilai", () => {
    expect(snapshotsEqual({ ...base, revenue: 1 }, { ...base, revenue: 2 })).toBe(false);
    expect(
      snapshotsEqual(
        { ...base, completedQuestIds: ["1.1"] },
        { ...base, completedQuestIds: ["1.2"] },
      ),
    ).toBe(false);
  });
});

describe("normalizeSnapshot", () => {
  it("mengurutkan id quest secara numerik dan id item secara alfabetis", () => {
    const normalized = normalizeSnapshot({
      ...base,
      completedQuestIds: ["1.10", "1.2", "1.1"],
      ownedItemIds: ["server-mini", "karpet-motivasi"],
    });

    expect(normalized.completedQuestIds).toEqual(["1.1", "1.2", "1.10"]);
    expect(normalized.ownedItemIds).toEqual(["karpet-motivasi", "server-mini"]);
  });
});
