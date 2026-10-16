"use client";

import { Download, FileArchive, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { questRepository } from "@/lib/services/quest-repository";
import { getLevelProgress, useGameStore } from "@/lib/stores/game-store";
import { buildPortfolioFiles, downloadPortfolioZip } from "@/features/export/build-zip";

export interface ExportPortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportPortfolioDialog({ open, onOpenChange }: ExportPortfolioDialogProps) {
  const completedQuestIds = useGameStore((state) => state.completedQuestIds);
  const drafts = useGameStore((state) => state.drafts);
  const revenue = useGameStore((state) => state.revenue);
  const activeUsers = useGameStore((state) => state.activeUsers);
  const ownedItemIds = useGameStore((state) => state.ownedItemIds);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const completedCount = completedQuestIds.length;

  async function handleDownload() {
    setBusy(true);
    setError("");
    try {
      const files = buildPortfolioFiles({
        quests: questRepository.list(),
        completedQuestIds,
        drafts,
        stats: {
          revenue,
          activeUsers,
          level: getLevelProgress(activeUsers).level,
          ownedItemIds,
        },
      });
      const stamp = new Date().toISOString().slice(0, 10);
      await downloadPortfolioZip(files, `project-x-portofolio-${stamp}.zip`);
      onOpenChange(false);
    } catch {
      setError("Gagal membuat arsip. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
            <FileArchive className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Ekspor Portofolio Proyek</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            Seluruh kode dari misi yang telah kamu selesaikan dikemas menjadi arsip{" "}
            <span className="font-mono">.zip</span> siap dipakai di dunia nyata — lengkap
            dengan README proyek dan statistik perusahaan.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-border/70 bg-muted/40 px-3 py-2.5 text-center text-[12px]">
          <span className="font-semibold text-foreground">{completedCount} misi</span>{" "}
          <span className="text-muted-foreground">
            telah diselesaikan — berkasnya akan disertakan dalam arsip.
          </span>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
            {error}
          </p>
        )}

        <DialogFooter className="sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Nanti saja
          </Button>
          <Button
            onClick={() => void handleDownload()}
            disabled={busy || completedCount === 0}
            className="gap-2"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Unduh .zip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
