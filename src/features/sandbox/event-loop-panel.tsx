"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export interface LoopEvent {
  id: number;
  kind: "start" | "fire";
  label: string;
  delay?: number;
  at: number;
}

export interface EventLoopPanelProps {
  events: LoopEvent[];
}

const CHIP_LIFETIME_MS = 4200;

/**
 * Visualizer Event Loop: kode sinkron berjalan di Call Stack, timer
 * menunggu di Web APIs, lalu callback-nya mengantri dan dijalankan.
 * Data berasal dari instrumentasi setTimeout di dalam sandbox.
 */
export function EventLoopPanel({ events }: EventLoopPanelProps) {
  // Denyut waktu agar chip lama memudar (bukan hanya saat ada event baru).
  // `now` disimpan sebagai state lewat callback interval agar render tetap murni.
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 700);
    return () => clearInterval(timer);
  }, []);

  const recent = events.filter((event) => now === 0 || now - event.at < CHIP_LIFETIME_MS);

  // Pasangkan start -> fire per label (greedy) untuk menentukan posisi chip.
  const firedIds = new Set<number>();
  const usedFire = new Set<number>();
  for (const start of recent) {
    if (start.kind !== "start") continue;
    for (const fire of recent) {
      if (fire.kind !== "fire" || usedFire.has(fire.id)) continue;
      if (fire.at >= start.at && fire.label === start.label) {
        usedFire.add(fire.id);
        firedIds.add(start.id);
        break;
      }
    }
  }

  const webApiChips = recent.filter((event) => event.kind === "start" && !firedIds.has(event.id));
  const callbackChips = recent.filter(
    (event) => event.kind === "fire" || (event.kind === "start" && firedIds.has(event.id)),
  );
  const stackActive = recent.length > 0;

  return (
    <div className="border-b border-border/70 bg-slate-50 px-2.5 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground">
          Event Loop — kode kamu
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/90">
          timer nyata dari <span className="text-primary">setTimeout</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <Lane
          title="Call Stack"
          hint="berjalan sekarang"
          accent="border-sky-200 bg-sky-50"
          chips={
            stackActive ? (
              <motion.span
                key="stack-chip"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded border border-sky-300 bg-white px-1.5 py-0.5 font-mono text-[9.5px] text-sky-700"
              >
                eksekusi kode
              </motion.span>
            ) : null
          }
        />
        <Lane
          title="Web APIs"
          hint="menunggu waktu"
          accent="border-amber-200 bg-amber-50"
          chips={
            <AnimatePresence initial={false}>
              {webApiChips.map((chip) => (
                <motion.span
                  key={chip.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="rounded border border-amber-300 bg-white px-1.5 py-0.5 font-mono text-[9.5px] text-amber-700"
                >
                  {chip.label}
                  {typeof chip.delay === "number" ? ` · ${chip.delay}ms` : ""}
                </motion.span>
              ))}
            </AnimatePresence>
          }
        />
        <Lane
          title="Callback Queue"
          hint="siap dijalankan"
          accent="border-emerald-200 bg-emerald-50"
          chips={
            <AnimatePresence initial={false}>
              {callbackChips.slice(-4).map((chip) => (
                <motion.span
                  key={chip.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="rounded border border-emerald-300 bg-white px-1.5 py-0.5 font-mono text-[9.5px] text-emerald-700"
                >
                  {chip.label} ✓
                </motion.span>
              ))}
            </AnimatePresence>
          }
        />
      </div>

      <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
        Kode sinkron selesai lebih dulu; callback <span className="font-mono">setTimeout</span>{" "}
        baru dieksekusi setelah antriannya tiba — itulah Event Loop.
      </p>
    </div>
  );
}

function Lane({
  title,
  hint,
  accent,
  chips,
}: {
  title: string;
  hint: string;
  accent: string;
  chips: React.ReactNode;
}) {
  return (
    <div className={`rounded-md border px-2 py-1.5 ${accent}`}>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[9px] uppercase tracking-wider text-foreground/70">
          {title}
        </span>
      </div>
      <div className="mt-1 flex min-h-[20px] flex-wrap items-center gap-1">
        {chips}
        {!chips && <span className="font-mono text-[9px] text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
