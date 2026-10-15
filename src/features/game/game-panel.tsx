"use client";

import { Bug, Lock, MapPin, Terminal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { gameEvents } from "@/features/game/events";
import { questRepository } from "@/lib/services/quest-repository";
import { useGameStore } from "@/lib/stores/game-store";
import { cn } from "@/lib/utils";

interface RoomSlot {
  hook: string;
  emoji: string;
  label: string;
}

const ROOM_SLOTS: RoomSlot[] = [
  { hook: "garage.monitor-on", emoji: "🖥️", label: "Monitor CRT" },
  { hook: "garage.banner", emoji: "🪧", label: "Banner Toko" },
  { hook: "garage.rack", emoji: "🗄️", label: "Rak Produk" },
  { hook: "garage.whiteboard", emoji: "📋", label: "Papan Kas" },
  { hook: "garage.printer", emoji: "🖨️", label: "Mesin Cetak" },
  { hook: "garage.zones", emoji: "📦", label: "Zona Kerja" },
  { hook: "garage.audit", emoji: "🏆", label: "Lencana Audit" },
];

interface FeedEntry {
  id: number;
  text: string;
  tone: "info" | "success" | "danger";
}

let feedSequence = 0;

export function GamePanel() {
  const completedQuestIds = useGameStore((state) => state.completedQuestIds);
  const [feed, setFeed] = useState<FeedEntry[]>([
    {
      id: feedSequence++,
      text: "Garasi berdebu. Terminal tua menunggu kode pertama dari kamu.",
      tone: "info",
    },
  ]);
  const [bugs, setBugs] = useState(0);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const previousHooksRef = useRef<Set<string>>(new Set());

  const unlockedHooks = useMemo(() => {
    const hooks = new Set<string>();
    questRepository.list().forEach((quest) => {
      if (completedQuestIds.includes(quest.id)) hooks.add(quest.visualHook);
    });
    return hooks;
  }, [completedQuestIds]);

  useEffect(() => {
    const added: string[] = [];
    unlockedHooks.forEach((hook) => {
      if (!previousHooksRef.current.has(hook)) added.push(hook);
    });
    previousHooksRef.current = unlockedHooks;
    if (added.length > 0) {
      setHighlighted(added[added.length - 1]);
      const timer = setTimeout(() => setHighlighted(null), 1600);
      return () => clearTimeout(timer);
    }
  }, [unlockedHooks]);

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
      }),
      gameEvents.on("quest:failed", (payload) => {
        addEntry(
          `Audit gagal di tiket ${payload.questId} — ${payload.failedCount} objektif belum terpenuhi.`,
          "danger",
        );
      }),
      gameEvents.on("bug:spawn", () => {
        setBugs((count) => Math.min(count + 1, 9));
      }),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 border-b border-border/60 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Garasi Berdebu
          </span>
        </div>
        <AnimatePresence>
          {bugs > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] text-red-300"
            >
              <Bug className="h-3 w-3" /> {bugs} bug
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {ROOM_SLOTS.map((slot) => {
          const unlocked = unlockedHooks.has(slot.hook);
          const isHighlighted = highlighted === slot.hook;
          return (
            <motion.div
              key={slot.hook}
              animate={{
                scale: isHighlighted ? 1.06 : 1,
                opacity: unlocked ? 1 : 0.45,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center gap-1 rounded-md border",
                unlocked
                  ? "border-primary/30 bg-primary/[0.06]"
                  : "border-border/50 bg-white/[0.02] grayscale",
                isHighlighted && "shadow-[0_0_18px] shadow-primary/40 ring-1 ring-primary/60",
              )}
            >
              <span className="text-xl leading-none">{slot.emoji}</span>
              <span className="px-1 text-center font-mono text-[8.5px] uppercase tracking-wider text-muted-foreground">
                {slot.label}
              </span>
              {!unlocked && (
                <Lock className="absolute right-1 top-1 h-2.5 w-2.5 text-muted-foreground/50" />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-md border border-border/60 bg-black/30">
        <div className="flex items-center gap-1.5 border-b border-border/50 px-2.5 py-1.5">
          <Terminal className="h-3 w-3 text-emerald-400" />
          <span className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-muted-foreground">
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
                  "font-mono text-[10px] leading-relaxed",
                  entry.tone === "info" && "text-muted-foreground",
                  entry.tone === "success" && "text-emerald-400",
                  entry.tone === "danger" && "text-red-400",
                )}
              >
                <span className="text-muted-foreground/50">» </span>
                {entry.text}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <p className="px-1 text-[9.5px] leading-relaxed text-muted-foreground/70">
        Panel ruangan sementara berbasis React. Engine Phaser.js 2D isometrik hadir pada
        Fase 2 pengembangan — kontrak event-nya sudah aktif sejak sekarang.
      </p>
    </div>
  );
}
