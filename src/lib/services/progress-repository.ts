import type { QuestFileMap } from "@/content/quests/schema";
import {
  useGameStore,
  type BuyItemResult,
  type QuestOutcome,
  type QuestRewardInput,
} from "@/lib/stores/game-store";

export interface ProgressSnapshot {
  revenue: number;
  activeUsers: number;
  completedQuestIds: string[];
}

/**
 * Batas antarmuka penyimpanan progres.
 *
 * M1–M2 -> `localProgressRepository` (zustand + localStorage)
 * M3    -> `cloudProgressRepository` (Supabase + API route) dengan API identik.
 */
export interface ProgressRepository {
  getSnapshot(): ProgressSnapshot;
  completeQuest(quest: QuestRewardInput): QuestOutcome;
  buyItem(itemId: string): BuyItemResult;
  saveDraft(questId: string, files: QuestFileMap): void;
  reset(): void;
}

export const localProgressRepository: ProgressRepository = {
  getSnapshot: () => {
    const state = useGameStore.getState();
    return {
      revenue: state.revenue,
      activeUsers: state.activeUsers,
      completedQuestIds: state.completedQuestIds,
    };
  },
  completeQuest: (quest) => useGameStore.getState().completeQuest(quest),
  buyItem: (itemId) => useGameStore.getState().buyItem(itemId),
  saveDraft: (questId, files) => useGameStore.getState().saveDraft(questId, files),
  reset: () => useGameStore.getState().resetGame(),
};
