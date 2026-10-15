import { getPrisma } from "@/lib/db/prisma";

export interface LeaderboardEntry {
  id: string;
  name: string;
  startupName: string | null;
  founderAvatar: string | null;
  avatarUrl: string | null;
  revenue: number;
  activeUsers: number;
  completedCount: number;
}

export type LeaderboardResult =
  | { ok: true; entries: LeaderboardEntry[] }
  | { ok: false; reason: "unconfigured" | "error" };

export async function getLeaderboard(limit = 50): Promise<LeaderboardResult> {
  const prisma = getPrisma();
  if (!prisma) return { ok: false, reason: "unconfigured" };

  try {
    const users = await prisma.user.findMany({
      orderBy: [{ revenue: "desc" }, { activeUsers: "desc" }],
      take: limit,
      include: { _count: { select: { progress: true } } },
    });

    return {
      ok: true,
      entries: users.map((user) => ({
        id: user.id,
        name: user.startupName ?? user.fullName ?? "Startup Tanpa Nama",
        startupName: user.startupName,
        founderAvatar: user.founderAvatar,
        avatarUrl: user.avatarUrl,
        revenue: user.revenue,
        activeUsers: user.activeUsers,
        completedCount: user._count.progress,
      })),
    };
  } catch (error) {
    console.error("Gagal memuat leaderboard:", error);
    return { ok: false, reason: "error" };
  }
}
