"use client";

import { TerminalSquare } from "lucide-react";
import type { ConsoleEntry } from "@/features/validation/types";
import { cn } from "@/lib/utils";

export interface ConsolePanelProps {
  entries: ConsoleEntry[];
}

export function ConsolePanel({ entries }: ConsolePanelProps) {
  if (entries.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/30 p-6 text-center">
        <TerminalSquare className="h-5 w-5 text-muted-foreground/70" />
        <p className="max-w-xs text-[11px] leading-relaxed text-muted-foreground">
          Console bersih. Pesan <span className="font-mono text-primary">console.log</span>{" "}
          dan error JavaScript dari kode-mu akan tampil di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="scroll-slim h-full overflow-y-auto bg-muted/20 p-2.5">
      {entries.map((entry, index) => (
        <div
          key={index}
          className={cn(
            "border-l-2 py-0.5 pl-2 font-mono text-[11px] leading-relaxed",
            entry.level === "error" && "border-red-500/70 text-red-600",
            entry.level === "warn" && "border-amber-500/70 text-amber-600",
            entry.level === "info" && "border-sky-500/70 text-sky-600",
            entry.level === "debug" && "border-border text-muted-foreground",
            entry.level === "log" && "border-emerald-500/60 text-emerald-700",
          )}
        >
          <span className="mr-1.5 text-muted-foreground/60">
            {entry.level === "error" ? "✕" : entry.level === "warn" ? "!" : "›"}
          </span>
          {entry.text}
        </div>
      ))}
    </div>
  );
}
