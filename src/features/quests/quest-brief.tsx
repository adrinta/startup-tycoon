"use client";

import { CheckCircle2, Coins, Skull, TrendingUp } from "lucide-react";
import type { Quest } from "@/content/quests/schema";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export interface QuestBriefProps {
  quest: Quest;
  completed: boolean;
}

export function QuestBrief({ quest, completed }: QuestBriefProps) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-lg">
            {quest.client.avatar}
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Tiket #{quest.id} · {quest.location}
            </div>
            <div className="text-sm font-semibold">{quest.client.name}</div>
            <div className="text-[11px] text-muted-foreground">{quest.client.role}</div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {quest.isBoss && (
            <Badge variant="destructive" className="gap-1 font-mono text-[10px] uppercase">
              <Skull className="h-3 w-3" /> Boss Fight
            </Badge>
          )}
          {completed && (
            <Badge className="gap-1 bg-emerald-500/15 font-mono text-[10px] text-emerald-400 shadow-[inset_0_0_0_1px] shadow-emerald-500/40">
              <CheckCircle2 className="h-3 w-3" /> Selesai
            </Badge>
          )}
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-amber-300">
              <Coins className="h-3.5 w-3.5" /> +{formatNumber(quest.rewards.coins)}
            </span>
            <span className="flex items-center gap-1 text-cyan-300">
              <TrendingUp className="h-3.5 w-3.5" /> +{formatNumber(quest.rewards.xp)} XP
            </span>
          </div>
        </div>
      </div>

      <h2 className="text-base font-semibold tracking-tight">
        {quest.title}
      </h2>

      <blockquote className="border-l-2 border-primary/40 pl-3 text-[13px] leading-relaxed text-muted-foreground">
        “{quest.brief}”
      </blockquote>

      <div>
        <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Dokumen Permintaan
        </div>
        <ol className="space-y-1">
          {quest.instructions.map((instruction, index) => (
            <li key={index} className="flex gap-2 text-[12.5px] leading-relaxed">
              <span
                className={cn(
                  "font-mono text-[11px] leading-5",
                  quest.isBoss ? "text-red-400" : "text-primary/80",
                )}
              >
                {String(index + 1).padStart(2, "0")}.
              </span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
      </div>

      {quest.codexRefs.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Materi:
          </span>
          {quest.codexRefs.map((ref) => (
            <span
              key={ref}
              className="rounded border border-border/80 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {ref}
            </span>
          ))}
          <span className="text-[10px] text-muted-foreground/70">
            → buka tab Holo-Codex di panel kanan
          </span>
        </div>
      )}
    </div>
  );
}
