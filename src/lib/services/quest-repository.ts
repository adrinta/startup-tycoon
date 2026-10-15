import {
  QUESTS,
  getFirstPlayableQuestId,
  getNextQuest,
  getPreviousQuest,
  getQuestById,
  getQuestsByPhase,
  isQuestUnlocked,
} from "@/content/quests";

/**
 * Akses katalog quest. Pada M1 sumbernya file konten TS; pada M3
 * implementasi dapat diganti dengan fetch dari API/Supabase melalui
 * antarmuka yang sama.
 */
export const questRepository = {
  list: () => QUESTS,
  listByPhase: getQuestsByPhase,
  getById: getQuestById,
  getNext: getNextQuest,
  getPrevious: getPreviousQuest,
  isUnlocked: isQuestUnlocked,
  firstPlayable: getFirstPlayableQuestId,
};
