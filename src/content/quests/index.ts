import { PHASE_1_QUESTS } from "@/content/quests/phase1";
import type { Quest } from "@/content/quests/schema";

/** Registry seluruh quest yang sudah tersedia. Babak 2–4 menyusul. */
export const QUESTS: Quest[] = [...PHASE_1_QUESTS].sort((a, b) => a.order - b.order);

export function getQuestById(id: string): Quest | undefined {
  return QUESTS.find((quest) => quest.id === id);
}

export function getQuestsByPhase(phase: number): Quest[] {
  return QUESTS.filter((quest) => quest.phase === phase);
}

export function getNextQuest(id: string): Quest | undefined {
  const current = getQuestById(id);
  if (!current) return undefined;
  return QUESTS.find((quest) => quest.order === current.order + 1);
}

export function getPreviousQuest(id: string): Quest | undefined {
  const current = getQuestById(id);
  if (!current) return undefined;
  return QUESTS.find((quest) => quest.order === current.order - 1);
}

/**
 * Misi pertama selalu terbuka; misi berikutnya terbuka setelah misi
 * sebelumnya selesai.
 */
export function isQuestUnlocked(quest: Quest, completedQuestIds: string[]): boolean {
  if (quest.order === 1) return true;
  const previous = QUESTS.find((candidate) => candidate.order === quest.order - 1);
  if (!previous) return true;
  return completedQuestIds.includes(previous.id);
}

export function getFirstPlayableQuestId(completedQuestIds: string[]): string {
  const nextPlayable = QUESTS.find(
    (quest) => isQuestUnlocked(quest, completedQuestIds) && !completedQuestIds.includes(quest.id),
  );
  return nextPlayable?.id ?? QUESTS[QUESTS.length - 1]?.id ?? "1.1";
}
