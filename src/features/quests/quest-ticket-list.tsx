"use client";

import { CheckCircle2, Lock, LockOpen, Skull } from "lucide-react";
import type { Quest } from "@/content/quests/schema";
import { isQuestUnlocked } from "@/content/quests";
import { cn } from "@/lib/utils";

export interface QuestTicketListProps {
  quests: Quest[];
  selectedId: string | null;
  completedQuestIds: string[];
  onSelect: (questId: string) => void;
}

interface ChapterGroup {
  chapter: string;
  quests: Quest[];
}

function groupByChapter(quests: Quest[]): ChapterGroup[] {
  const groups: ChapterGroup[] = [];
  for (const quest of quests) {
    const last = groups[groups.length - 1];
    if (last && last.chapter === quest.chapter) {
      last.quests.push(quest);
    } else {
      groups.push({ chapter: quest.chapter, quests: [quest] });
    }
  }
  return groups;
}

export function QuestTicketList({
  quests,
  selectedId,
  completedQuestIds,
  onSelect,
}: QuestTicketListProps) {
  const groups = groupByChapter(quests);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Tiket Masuk
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {completedQuestIds.length}/{quests.length}
        </span>
      </div>

      <div className="scroll-slim min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-2">
        {groups.map((group) => (
          <div key={group.chapter} className="space-y-1">
            <div className="px-1 pt-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground/90">
              {group.chapter}
            </div>
            {group.quests.map((quest) => {
              const unlocked = isQuestUnlocked(quest, completedQuestIds);
              const completed = completedQuestIds.includes(quest.id);
              const selected = quest.id === selectedId;

              return (
                <button
                  key={quest.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onSelect(quest.id)}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left transition-colors",
                    selected
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/60 bg-card hover:border-border hover:bg-muted/60",
                    !unlocked &&
                      "cursor-not-allowed opacity-50 hover:border-border/60 hover:bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-[10px]",
                      completed
                        ? "bg-emerald-100 text-emerald-700"
                        : unlocked
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {quest.id}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[12px] font-medium leading-tight">
                        {quest.title}
                      </span>
                      {quest.isBoss && <Skull className="h-3 w-3 shrink-0 text-red-500" />}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">
                      {quest.client.name}
                    </span>
                  </span>

                  {completed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : unlocked ? (
                    <LockOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 group-hover:text-primary" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        <div className="mt-2 rounded-md border border-dashed border-border/60 px-2.5 py-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Babak 3: Growth Hack
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            High-Rise Tower & materi JavaScript — segera hadir.
          </div>
        </div>
      </div>
    </div>
  );
}
