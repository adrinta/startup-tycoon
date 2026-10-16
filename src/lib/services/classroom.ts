import { getPrisma } from "@/lib/db/prisma";
import {
  generateJoinCode,
  normalizeJoinCode,
  rankBottleneckQuests,
  summarizeAttempts,
  type QuestDifficulty,
} from "@/lib/services/classroom-logic";

export interface ClassroomInfo {
  id: string;
  name: string;
  joinCode: string;
  memberCount: number;
  createdAt: string;
}

export interface ClassroomMember {
  id: string;
  label: string;
  email: string;
  completedCount: number;
  revenue: number;
  activeUsers: number;
  attempts: number;
  accuracy: number;
}

export interface ClassroomOverview {
  classes: ClassroomInfo[];
  members: ClassroomMember[];
  bottlenecks: QuestDifficulty[];
  totals: { members: number; attempts: number };
}

export async function createClass(
  lecturerId: string,
  name: string,
): Promise<{ ok: true; joinCode: string } | { ok: false; reason: "conflict" | "db" }> {
  const prisma = getPrisma();
  if (!prisma) return { ok: false, reason: "db" };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const joinCode = generateJoinCode();
    try {
      await prisma.class.create({
        data: { name: name.slice(0, 60), joinCode, lecturerId },
      });
      return { ok: true, joinCode };
    } catch {
      // Kemungkinan kode bentrok — coba kode baru.
    }
  }
  return { ok: false, reason: "conflict" };
}

export async function joinClassByCode(
  userId: string,
  rawCode: string,
): Promise<{ ok: boolean; className?: string }> {
  const prisma = getPrisma();
  if (!prisma) return { ok: false };

  const code = normalizeJoinCode(rawCode);
  if (code.length < 4) return { ok: false };

  const target = await prisma.class.findUnique({ where: { joinCode: code } });
  if (!target) return { ok: false };

  await prisma.classMember.upsert({
    where: { classId_userId: { classId: target.id, userId } },
    create: { classId: target.id, userId },
    update: {},
  });
  return { ok: true, className: target.name };
}

export async function getClassroomOverview(
  lecturerId: string,
): Promise<ClassroomOverview | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const classes = await prisma.class.findMany({
    where: { lecturerId },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: "desc" },
  });

  const classIds = classes.map((entry) => entry.id);
  const memberships = classIds.length
    ? await prisma.classMember.findMany({ where: { classId: { in: classIds } } })
    : [];

  const memberIds = Array.from(new Set(memberships.map((entry) => entry.userId)));
  const users = memberIds.length
    ? await prisma.user.findMany({
        where: { id: { in: memberIds } },
        include: {
          _count: { select: { progress: true } },
          attempts: { select: { questId: true, passed: true } },
        },
      })
    : [];

  const allAttempts = users.flatMap((user) => user.attempts);

  const members: ClassroomMember[] = users.map((user) => {
    const summary = summarizeAttempts(user.attempts);
    return {
      id: user.id,
      label: user.startupName ?? user.fullName ?? user.email,
      email: user.email,
      completedCount: user._count.progress,
      revenue: user.revenue,
      activeUsers: user.activeUsers,
      attempts: summary.total,
      accuracy: summary.accuracy,
    };
  });

  return {
    classes: classes.map((entry) => ({
      id: entry.id,
      name: entry.name,
      joinCode: entry.joinCode,
      memberCount: entry._count.members,
      createdAt: entry.createdAt.toISOString(),
    })),
    members: members.sort((a, b) => b.completedCount - a.completedCount),
    bottlenecks: rankBottleneckQuests(allAttempts),
    totals: { members: members.length, attempts: allAttempts.length },
  };
}
