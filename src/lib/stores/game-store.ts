"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuestFileMap } from "@/content/quests/schema";

/**
 * Penyimpanan progres LOKAL (adapter untuk M1).
 *
 * Pada Fase 3 (M3), adapter `progress-repository` akan diganti dengan
 * implementasi Supabase (sinkronisasi cloud) TANPA mengubah API ini,
 * sehingga seluruh komponen tidak perlu disentuh.
 */

export interface QuestOutcome {
  firstTime: boolean;
  coins: number;
  xp: number;
  previousLevel: number;
  newLevel: number;
  levelUp: boolean;
}

export interface QuestRewardInput {
  id: string;
  rewards: { coins: number; xp: number };
}

interface GameState {
  revenue: number;
  activeUsers: number;
  completedQuestIds: string[];
  completedAt: Record<string, string>;
  drafts: Record<string, QuestFileMap>;
  completeQuest: (quest: QuestRewardInput) => QuestOutcome;
  saveDraft: (questId: string, files: QuestFileMap) => void;
  resetGame: () => void;
}

/* --------------------------- Ekonomi & Level --------------------------- */

/** Level naik pada kelipatan kuadrat: L2 = 100 XP, L3 = 400 XP, L4 = 900 XP, ... */
export function levelFromXp(xp: number): number {
  if (xp < 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

export interface LevelProgress {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number; // 0..1
}

export function getLevelProgress(xp: number): LevelProgress {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(level + 1);
  const span = Math.max(1, ceiling - floor);
  return {
    level,
    currentLevelXp: xp - floor,
    nextLevelXp: ceiling - floor,
    progress: Math.min(1, Math.max(0, (xp - floor) / span)),
  };
}

/* ------------------------------- Store -------------------------------- */

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      revenue: 0,
      activeUsers: 0,
      completedQuestIds: [],
      completedAt: {},
      drafts: {},

      completeQuest: (quest) => {
        const state = get();
        const previousLevel = levelFromXp(state.activeUsers);

        if (state.completedQuestIds.includes(quest.id)) {
          return {
            firstTime: false,
            coins: 0,
            xp: 0,
            previousLevel,
            newLevel: previousLevel,
            levelUp: false,
          };
        }

        const newXp = state.activeUsers + quest.rewards.xp;
        const newLevel = levelFromXp(newXp);

        set({
          revenue: state.revenue + quest.rewards.coins,
          activeUsers: newXp,
          completedQuestIds: [...state.completedQuestIds, quest.id],
          completedAt: { ...state.completedAt, [quest.id]: new Date().toISOString() },
        });

        return {
          firstTime: true,
          coins: quest.rewards.coins,
          xp: quest.rewards.xp,
          previousLevel,
          newLevel,
          levelUp: newLevel > previousLevel,
        };
      },

      saveDraft: (questId, files) =>
        set((state) => ({
          drafts: { ...state.drafts, [questId]: files },
        })),

      resetGame: () =>
        set({
          revenue: 0,
          activeUsers: 0,
          completedQuestIds: [],
          completedAt: {},
          drafts: {},
        }),
    }),
    {
      name: "startup-tycoon-save",
      version: 1,
    },
  ),
);

/**
 * Progres disimpan di localStorage; render baru boleh memakai data
 * setelah hidrasi selesai agar tidak terjadi hydration mismatch.
 * (useSyncExternalStore memakai snapshot server `false` selama hidrasi.)
 */
export function useGameStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useGameStore.persist.onFinishHydration(onStoreChange),
    () => useGameStore.persist.hasHydrated(),
    () => false,
  );
}
