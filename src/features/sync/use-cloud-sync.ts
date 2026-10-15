"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import {
  mergeSnapshots,
  normalizeSnapshot,
  type ProgressSnapshotFull,
} from "@/lib/services/sync";
import { useGameStore, useGameStoreHydrated } from "@/lib/stores/game-store";

function readLocalSnapshot(): ProgressSnapshotFull {
  const state = useGameStore.getState();
  return normalizeSnapshot({
    revenue: state.revenue,
    activeUsers: state.activeUsers,
    completedQuestIds: state.completedQuestIds,
    ownedItemIds: state.ownedItemIds,
  });
}

const PUSH_DEBOUNCE_MS = 1500;

/**
 * Sinkronisasi progres ke cloud (M3, Supabase):
 * 1. Saat login: ambil snapshot server, merge dengan progres lokal
 *    (union misi & dekorasi, revenue/XP = terbesar), lalu simpan hasil merge.
 * 2. Setiap perubahan ekonomi/progres berikutnya di-push (debounce 1,5 dtk).
 *
 * Aman offline: kegagalan jaringan diabaikan dan dicoba lagi saat ada
 * perubahan berikutnya. Berjalan hanya bila Supabase dikonfigurasi & login.
 */
export function useCloudSync(): void {
  const { configured, user } = useAuth();
  const hydrated = useGameStoreHydrated();
  const lastPushedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!configured || !user || !hydrated) return;

    let cancelled = false;
    let pushTimer: ReturnType<typeof setTimeout> | null = null;

    async function push(snapshot: ProgressSnapshotFull): Promise<void> {
      const serialized = JSON.stringify(snapshot);
      if (lastPushedRef.current === serialized) return;
      try {
        const response = await fetch("/api/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: serialized,
        });
        if (response.ok) lastPushedRef.current = serialized;
      } catch {
        // Offline — coba lagi pada perubahan berikutnya.
      }
    }

    void (async () => {
      try {
        const response = await fetch("/api/progress");
        if (!response.ok || cancelled) return;
        const server = normalizeSnapshot((await response.json()) as ProgressSnapshotFull);
        const merged = mergeSnapshots(readLocalSnapshot(), server);
        useGameStore.getState().applyCloudSnapshot(merged);
        await push(merged);
      } catch {
        // Mode offline — biarkan progres lokal berjalan.
      }
    })();

    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      const relevant =
        state.revenue !== prevState.revenue ||
        state.activeUsers !== prevState.activeUsers ||
        state.completedQuestIds.length !== prevState.completedQuestIds.length ||
        state.ownedItemIds.length !== prevState.ownedItemIds.length;
      if (!relevant) return;
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(() => {
        void push(readLocalSnapshot());
      }, PUSH_DEBOUNCE_MS);
    });

    return () => {
      cancelled = true;
      unsubscribe();
      if (pushTimer) clearTimeout(pushTimer);
    };
  }, [configured, user, hydrated]);
}
