/**
 * Logika murni untuk fitur kelas & dashboard pengajar (M7).
 * Tanpa dependensi database agar mudah diuji.
 */

const JOIN_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateJoinCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += JOIN_CODE_ALPHABET.charAt(Math.floor(Math.random() * JOIN_CODE_ALPHABET.length));
  }
  return code;
}

export function normalizeJoinCode(code: string): string {
  return code.trim().toUpperCase();
}

/** Daftar email pengajar dari env LECTURER_EMAILS (dipisah koma). */
export function isLecturerEmail(
  email: string | null | undefined,
  rawList: string | undefined = process.env.LECTURER_EMAILS,
): boolean {
  if (!email) return false;
  const lecturers = (rawList ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return lecturers.includes(email.toLowerCase());
}

export interface AttemptSummary {
  total: number;
  passed: number;
  failed: number;
  accuracy: number; // 0..1 (1 bila tanpa percobaan)
}

export function summarizeAttempts(
  attempts: Array<{ passed: boolean }>,
): AttemptSummary {
  const total = attempts.length;
  const passed = attempts.filter((attempt) => attempt.passed).length;
  return {
    total,
    passed,
    failed: total - passed,
    accuracy: total === 0 ? 1 : passed / total,
  };
}

export interface QuestDifficulty {
  questId: string;
  total: number;
  failed: number;
  failRate: number;
}

/** Misi dengan tingkat kegagalan tertinggi (bottleneck) untuk pengajar. */
export function rankBottleneckQuests(
  attempts: Array<{ questId: string; passed: boolean }>,
  limit = 8,
): QuestDifficulty[] {
  const byQuest = new Map<string, { total: number; failed: number }>();
  for (const attempt of attempts) {
    const entry = byQuest.get(attempt.questId) ?? { total: 0, failed: 0 };
    entry.total += 1;
    if (!attempt.passed) entry.failed += 1;
    byQuest.set(attempt.questId, entry);
  }

  const list: QuestDifficulty[] = [];
  byQuest.forEach((entry, questId) => {
    list.push({
      questId,
      total: entry.total,
      failed: entry.failed,
      failRate: entry.total === 0 ? 0 : entry.failed / entry.total,
    });
  });

  return list
    .sort((a, b) => b.failRate - a.failRate || b.failed - a.failed)
    .slice(0, limit);
}
