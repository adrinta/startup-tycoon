"use client";

import { Bell, Download, Sparkles, Trophy } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getLevelProgress, useGameStore } from "@/lib/stores/game-store";
import { formatNumber, formatRupiah } from "@/lib/utils/format";

export interface EndingCinematicProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: () => void;
}

/**
 * Adegan akhir setelah boss IPO (misi 4.7): saham Project X resmi
 * melantai di bursa. Menampilkan epilog cerita + rekap statistik perjalanan.
 */
export function EndingCinematic({ open, onOpenChange, onExport }: EndingCinematicProps) {
  const revenue = useGameStore((state) => state.revenue);
  const activeUsers = useGameStore((state) => state.activeUsers);
  const completedQuestIds = useGameStore((state) => state.completedQuestIds);
  const ownedItemIds = useGameStore((state) => state.ownedItemIds);
  const level = getLevelProgress(activeUsers).level;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-primary/40 sm:max-w-lg">
        <DialogTitle className="sr-only">Ending: Project X Melantai di Bursa</DialogTitle>

        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -18 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-300 bg-amber-50"
          >
            <Bell className="h-8 w-8 text-amber-500" />
          </motion.div>

          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.35 }}
            className="text-6xl"
          >
            🦄
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Ending · The Unicorn
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Project X Resmi Melantai di Bursa!
            </h2>
            <p className="text-[12.5px] leading-relaxed text-muted-foreground">
              Dari sebuah garasi berdebu hingga panggung bursa global. Server tua milik
              Cipher kini menjadi fondasi perusahaan unicorn — dan kamu yang membangunnya,
              baris demi baris kode: <span className="text-foreground">HTML</span>,{" "}
              <span className="text-foreground">CSS</span>,{" "}
              <span className="text-foreground">JavaScript</span>, hingga{" "}
              <span className="text-foreground">PHP & Database</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="grid w-full grid-cols-3 gap-2 pt-1"
          >
            <EndStat label="Revenue" value={formatRupiah(revenue)} />
            <EndStat label="Active Users" value={`${formatNumber(activeUsers)} XP`} />
            <EndStat label="Level" value={`Lv ${level}`} />
            <EndStat label="Misi Selesai" value={`${completedQuestIds.length}/28`} />
            <EndStat label="Dekorasi" value={`${ownedItemIds.length} item`} />
            <EndStat label="IPO" value="Sukses 🎉" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05 }}
            className="flex w-full flex-col gap-2 pt-1 sm:flex-row sm:justify-center"
          >
            <Button onClick={onExport} className="gap-2">
              <Download className="h-4 w-4" /> Ekspor Portofolio .zip
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/leaderboard">
                <Trophy className="h-4 w-4" /> Papan Peringkat
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EndStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-card px-2 py-1.5">
      <div className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 truncate font-mono text-[11.5px] font-semibold">{value}</div>
    </div>
  );
}
