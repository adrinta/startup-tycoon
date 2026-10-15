"use client";

import { ArrowRight, Coins, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Quest } from "@/content/quests/schema";
import type { QuestOutcome } from "@/lib/stores/game-store";
import { formatNumber } from "@/lib/utils/format";

export interface RewardDialogProps {
  open: boolean;
  quest: Quest | null;
  outcome: QuestOutcome | null;
  nextQuestId: string | null;
  onClose: () => void;
  onNextQuest: (questId: string) => void;
}

export function RewardDialog({
  open,
  quest,
  outcome,
  nextQuestId,
  onClose,
  onNextQuest,
}: RewardDialogProps) {
  if (!quest || !outcome) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="border-primary/30 sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-300 bg-amber-50">
            <Trophy className="h-7 w-7 text-amber-500" />
          </div>
          <DialogTitle className="text-lg">Audit Lolos!</DialogTitle>
          <DialogDescription className="text-center">
            {quest.isBoss ? "Boss fight ditaklukkan — " : ""}
            {quest.title} selesai. {quest.visualNote}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-700">
              <Coins className="h-3 w-3" /> Revenue
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-amber-800">
              +{formatNumber(outcome.coins)}
            </div>
          </div>
          <div className="rounded-md border border-cyan-200 bg-cyan-50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-700">
              <TrendingUp className="h-3 w-3" /> XP
            </div>
            <div className="mt-1 font-mono text-lg font-semibold text-cyan-800">
              +{formatNumber(outcome.xp)}
            </div>
          </div>
        </div>

        {outcome.levelUp && (
          <div className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-center text-[12px] font-medium text-primary">
            ⚡ Level perusahaan naik: {outcome.previousLevel} → {outcome.newLevel}!
          </div>
        )}

        <DialogFooter className="sm:justify-center">
          {nextQuestId ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Nanti saja
              </Button>
              <Button onClick={() => onNextQuest(nextQuestId)} className="gap-2">
                Misi Berikutnya <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>Tutup</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
