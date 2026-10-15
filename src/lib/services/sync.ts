export interface ProgressSnapshotFull {
  revenue: number;
  activeUsers: number;
  completedQuestIds: string[];
  ownedItemIds: string[];
}

function sortQuestIds(ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const [aPhase, aNumber] = a.split(".").map(Number);
    const [bPhase, bNumber] = b.split(".").map(Number);
    if (aPhase !== bPhase) return aPhase - bPhase;
    return aNumber - bNumber;
  });
}

/**
 * Strategi merge saat login pertama (lokal <-> cloud):
 * - daftar misi & dekorasi = gabungan (union) kedua sisi;
 * - revenue/XP = nilai terbesar (konservatif, mencegah kehilangan progres).
 */
export function mergeSnapshots(
  local: ProgressSnapshotFull,
  server: ProgressSnapshotFull,
): ProgressSnapshotFull {
  return {
    revenue: Math.max(local.revenue, server.revenue),
    activeUsers: Math.max(local.activeUsers, server.activeUsers),
    completedQuestIds: sortQuestIds(
      Array.from(new Set([...local.completedQuestIds, ...server.completedQuestIds])),
    ),
    ownedItemIds: Array.from(new Set([...local.ownedItemIds, ...server.ownedItemIds])).sort(),
  };
}

export function snapshotsEqual(a: ProgressSnapshotFull, b: ProgressSnapshotFull): boolean {
  return (
    a.revenue === b.revenue &&
    a.activeUsers === b.activeUsers &&
    a.completedQuestIds.length === b.completedQuestIds.length &&
    a.completedQuestIds.every((id, index) => id === b.completedQuestIds[index]) &&
    a.ownedItemIds.length === b.ownedItemIds.length &&
    a.ownedItemIds.every((id, index) => id === b.ownedItemIds[index])
  );
}

/** Menyeragamkan urutan agar perbandingan snapshot selalu stabil. */
export function normalizeSnapshot(snapshot: ProgressSnapshotFull): ProgressSnapshotFull {
  return {
    revenue: snapshot.revenue,
    activeUsers: snapshot.activeUsers,
    completedQuestIds: sortQuestIds(snapshot.completedQuestIds),
    ownedItemIds: [...snapshot.ownedItemIds].sort(),
  };
}
