"use client";

import dynamic from "next/dynamic";
import { Bug, MapPin, Terminal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { gameEvents } from "@/features/game/events";
import type { RoomState } from "@/features/game/phaser/garage-scene";
import { ShopDialog } from "@/features/game/shop-dialog";
import { questRepository } from "@/lib/services/quest-repository";
import { useGameStore } from "@/lib/stores/game-store";
import { cn } from "@/lib/utils";

const GameCanvas = dynamic(
  () => import("@/features/game/phaser/game-canvas").then((mod) => mod.GameCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[320/344] w-full animate-pulse rounded-md border border-border/70 bg-muted/50" />
    ),
  },
);

export interface GamePanelProps {
  activeQuestTitle: string | null;
  activeQuestHint: string | null;
  activeQuestPhase: number;
  location: string;
}

interface FeedEntry {
  id: number;
  text: string;
  tone: "info" | "success" | "danger";
}

let feedSequence = 0;

export function GamePanel({
  activeQuestTitle,
  activeQuestHint,
  activeQuestPhase,
  location,
}: GamePanelProps) {
  const completedQuestIds = useGameStore((state) => state.completedQuestIds);
  const ownedItemIds = useGameStore((state) => state.ownedItemIds);

  const [feed, setFeed] = useState<FeedEntry[]>([
    {
      id: feedSequence++,
      text: "Garasi berdebu. Terminal tua menunggu kode pertama dari kamu.",
      tone: "info",
    },
  ]);
  const [bugs, setBugs] = useState(0);
  const [bugBurst, setBugBurst] = useState(0);
  const [clearBurst, setClearBurst] = useState(0);

  const completedHooks = useMemo(() => {
    const hooks: string[] = [];
    questRepository.list().forEach((quest) => {
      if (completedQuestIds.includes(quest.id)) hooks.push(quest.visualHook);
    });
    return hooks;
  }, [completedQuestIds]);

  const roomState = useMemo<RoomState>(
    () => ({
      completedHooks,
      ownedItemIds,
      activeQuestTitle,
      activeQuestHint,
      stage:
        activeQuestPhase >= 4
          ? "penthouse"
          : activeQuestPhase >= 3
            ? "tower"
            : activeQuestPhase >= 2
              ? "coworking"
              : "garage",
    }),
    [completedHooks, ownedItemIds, activeQuestTitle, activeQuestHint, activeQuestPhase],
  );

  useEffect(() => {
    function addEntry(text: string, tone: FeedEntry["tone"]) {
      setFeed((current) => [...current.slice(-7), { id: feedSequence++, text, tone }]);
    }

    const unsubscribers = [
      gameEvents.on("quest:started", (payload) => {
        addEntry(`Tiket ${payload.questId} dibuka: ${payload.title}.`, "info");
      }),
      gameEvents.on("quest:completed", (payload) => {
        addEntry(payload.visualNote, "success");
        setBugs(0);
        setClearBurst((count) => count + 1);
      }),
      gameEvents.on("quest:failed", (payload) => {
        addEntry(
          `Audit gagal di tiket ${payload.questId} — ${payload.failedCount} objektif belum terpenuhi.`,
          "danger",
        );
      }),
      gameEvents.on("bug:spawn", () => {
        setBugs((count) => Math.min(count + 1, 9));
        setBugBurst((count) => count + 1);
      }),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 border-b border-border/70 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {location}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <AnimatePresence>
            {bugs > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-mono text-[10px] text-red-600"
              >
                <Bug className="h-3 w-3" /> {bugs}
              </motion.span>
            )}
          </AnimatePresence>
          <ShopDialog />
        </div>
      </div>

      <GameCanvas roomState={roomState} bugBurst={bugBurst} clearBurst={clearBurst} />

      <div className="rounded-md border border-border/70 bg-muted/40">
        <div className="flex items-center gap-1.5 border-b border-border/60 px-2.5 py-1.5">
          <Terminal className="h-3 w-3 text-emerald-600" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Umpan Ruangan
          </span>
        </div>
        <div className="scroll-slim max-h-28 space-y-1 overflow-y-auto px-2.5 py-1.5">
          <AnimatePresence initial={false}>
            {feed.map((entry) => (
              <motion.p
                key={entry.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "font-mono text-[10.5px] leading-relaxed",
                  entry.tone === "info" && "text-muted-foreground",
                  entry.tone === "success" && "text-emerald-600",
                  entry.tone === "danger" && "text-red-600",
                )}
              >
                <span className="text-muted-foreground/70">» </span>
                {entry.text}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <p className="px-1 text-[10.5px] leading-relaxed text-muted-foreground/90">
        Ruangan dirender dengan Phaser.js (2D isometrik). Klik <strong>Ada</strong> untuk
        berbicara, dan belanja dekorasi di <strong>Toko</strong> — barangnya langsung tampil
        di ruangan ini.
      </p>
    </div>
  );
}
