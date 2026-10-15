"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import type { Objective } from "@/content/quests/schema";
import type { ObjectiveResult } from "@/features/validation/types";
import { cn } from "@/lib/utils";

export type RunStatus = "idle" | "running" | "passed" | "failed" | "timeout";

export interface ObjectivesChecklistProps {
  objectives: Objective[];
  results: ObjectiveResult[] | null;
  status: RunStatus;
  completed: boolean;
}

export function ObjectivesChecklist({
  objectives,
  results,
  status,
  completed,
}: ObjectivesChecklistProps) {
  const resultById = new Map((results ?? []).map((result) => [result.id, result]));
  const passedCount = objectives.filter((objective) => resultById.get(objective.id)?.passed).length;
  const hasFails = objectives.some((objective) => {
    const result = resultById.get(objective.id);
    return result !== undefined && !result.passed;
  });

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Audit Objektif
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">
          {results ? `${passedCount}/${objectives.length}` : `0/${objectives.length}`}
        </div>
      </div>

      {status === "running" && (
        <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[11px] text-primary">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Menjalankan kode di sandbox…
        </div>
      )}

      {status === "passed" && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {completed
            ? "Semua objektif terpenuhi. Misi ini sudah kamu selesaikan!"
            : "Semua objektif terpenuhi!"}
        </div>
      )}

      {status === "failed" && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] text-red-700">
          <XCircle className="h-3.5 w-3.5" />
          Belum lolos audit — periksa objektif merah di bawah.
        </div>
      )}

      {status === "timeout" && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-700">
          <XCircle className="h-3.5 w-3.5" />
          Eksekusi dihentikan karena melebihi batas waktu (3 detik).
        </div>
      )}

      <ul className="space-y-1">
        {objectives.map((objective) => {
          const result = resultById.get(objective.id);
          const state = result === undefined ? "pending" : result.passed ? "passed" : "failed";
          return (
            <li
              key={objective.id}
              className={cn(
                "rounded-md border px-2.5 py-1.5 transition-colors",
                state === "pending" && "border-border/70 bg-muted/40",
                state === "passed" && "border-emerald-200 bg-emerald-50/80",
                state === "failed" && "border-red-200 bg-red-50/80",
              )}
            >
              <div className="flex items-start gap-2">
                {state === "pending" && (
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                )}
                {state === "passed" && (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                )}
                {state === "failed" && (
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                )}
                <div className="min-w-0">
                  <div className="text-[12px] leading-snug">{objective.label}</div>
                  {state === "failed" && result?.detail && (
                    <div className="mt-0.5 font-mono text-[10.5px] leading-snug text-red-600">
                      {result.detail}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {results && hasFails && (
        <p className="px-1 text-[10.5px] leading-relaxed text-muted-foreground/80">
          Terminal tidak memberi jawaban langsung — baca detail masalah di atas, cek pasangan
          tag, lalu deploy ulang.
        </p>
      )}
    </div>
  );
}
