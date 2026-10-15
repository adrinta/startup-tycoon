"use client";

import { Coins, RotateCcw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { localProgressRepository } from "@/lib/services/progress-repository";
import { getLevelProgress, useGameStore } from "@/lib/stores/game-store";
import { formatNumber, formatRupiah } from "@/lib/utils/format";

export interface StatsHudProps {
  onAfterReset?: () => void;
}

export function StatsHud({ onAfterReset }: StatsHudProps) {
  const revenue = useGameStore((state) => state.revenue);
  const activeUsers = useGameStore((state) => state.activeUsers);
  const levelInfo = getLevelProgress(activeUsers);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 rounded-md border border-amber-400/25 bg-amber-400/[0.07] px-2.5 py-1.5">
        <Coins className="h-3.5 w-3.5 text-amber-300" />
        <div className="leading-none">
          <div className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-amber-200/70">
            Revenue
          </div>
          <div className="font-mono text-[12px] font-semibold text-amber-200">
            {formatRupiah(revenue)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 rounded-md border border-cyan-400/25 bg-cyan-400/[0.07] px-2.5 py-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-cyan-300" />
        <div className="leading-none">
          <div className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-cyan-200/70">
            Active Users
          </div>
          <div className="font-mono text-[12px] font-semibold text-cyan-200">
            {formatNumber(activeUsers)} XP
          </div>
        </div>
      </div>

      <div className="hidden w-36 flex-col gap-1 rounded-md border border-border/60 bg-white/[0.03] px-2.5 py-1.5 lg:flex">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-muted-foreground">
            Level {levelInfo.level}
          </span>
          <span className="font-mono text-[8.5px] text-muted-foreground/70">
            {levelInfo.currentLevelXp}/{levelInfo.nextLevelXp}
          </span>
        </div>
        <Progress value={levelInfo.progress * 100} className="h-1" />
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset seluruh progres?</DialogTitle>
            <DialogDescription>
              Semua koin, XP, status misi, dan draft kode di perangkat ini akan dihapus.
              Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  localProgressRepository.reset();
                  onAfterReset?.();
                }}
              >
                Ya, reset
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
