import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Braces,
  Coins,
  Gamepad2,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/features/auth/auth-button";

export const metadata: Metadata = {
  title: "Startup Tycoon — Dari Garasi ke Unicorn",
};

const PHASES = [
  { label: "Garasi", detail: "HTML", active: true },
  { label: "Co-Working", detail: "CSS", active: false },
  { label: "High-Rise", detail: "JavaScript", active: false },
  { label: "Penthouse", detail: "PHP + DB", active: false },
];

const FEATURES = [
  {
    icon: Braces,
    title: "Editor & Sandbox di Browser",
    body: "Tulis HTML, CSS, JS, dan PHP di dalam editor kelas VS Code. Semua kode dieksekusi di sandbox terisolasi — tanpa instalasi apa pun.",
  },
  {
    icon: Sparkles,
    title: "Umpan Balik Visual",
    body: "Setiap baris kode yang benar langsung mengubah ruangan kantor virtual: monitor menyala, rak terisi, hingga menara unicorn berdiri.",
  },
  {
    icon: Coins,
    title: "Ekonomi & Progresi",
    body: "Selesaikan tiket klien untuk mengumpulkan Revenue dan Active Users. Belanjakan koin untuk dekorasi kantor dengan buff pasif.",
  },
  {
    icon: ShieldCheck,
    title: "Validasi Objektif",
    body: "Terminal audit memeriksa struktur DOM dan logika kode-mu tanpa membocorkan jawaban — sama seperti review code di dunia kerja.",
  },
];

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.55 0.13 235 / 0.07) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.13 235 / 0.07) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-primary/40 bg-primary/10 font-mono text-sm font-bold text-primary shadow-[0_4px_14px_-4px] shadow-primary/40">
            S
          </div>
          <span className="text-sm font-semibold tracking-[0.2em]">
            STARTUP <span className="text-primary">TYCOON</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AuthButton size="sm" variant="ghost" />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 px-8 py-12">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.07] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            <Gamepad2 className="h-3.5 w-3.5" />
            Simulasi Bisnis × Full-Stack Web
          </div>

          <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight">
            Belajar Web Development
            <br />
            dengan Membangun{" "}
            <span className="text-primary drop-shadow-[0_2px_14px_oklch(0.55_0.13_235/0.25)]">
              Startup Unicorn
            </span>
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Kamu menemukan server tua milik programer legenda bernama Cipher beserta cetak biru
            <span className="text-foreground"> Project X</span>. Dari garasi berdebu, tuntaskan
            tiket klien dengan HTML, CSS, JavaScript, dan PHP — semua dieksekusi langsung di
            browsermu, tanpa setup apa pun.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2 shadow-[0_8px_24px_-6px] shadow-primary/40">
              <Link href="/play">
                Mulai dari Garasi <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <AuthButton size="lg" variant="outline" />
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {PHASES.map((phase, index) => (
              <div key={phase.label} className="flex items-center gap-2">
                <div
                  className={
                    phase.active
                      ? "rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-center"
                      : "rounded-md border border-border bg-muted/50 px-3 py-1.5 text-center opacity-80"
                  }
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em]">
                    Babak {index + 1}
                  </div>
                  <div className="text-[12px] font-medium">
                    {phase.label} · <span className="font-mono text-[11px]">{phase.detail}</span>
                  </div>
                </div>
                {index < PHASES.length - 1 && (
                  <span className="font-mono text-muted-foreground/50">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border/60 bg-card/60 p-4 backdrop-blur-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <feature.icon className="h-4 w-4 text-primary" />
                <span className="text-[13px] font-semibold">{feature.title}</span>
              </div>
              <p className="text-[12px] leading-relaxed text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 flex items-center justify-between border-t border-border/50 px-8 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Blocks className="h-3 w-3" /> HTML · CSS · JS · PHP
        </span>
        <span className="flex items-center gap-1.5">
          <Trophy className="h-3 w-3" /> 24 misi + 4 boss fight — dari garasi ke IPO
        </span>
      </footer>
    </div>
  );
}
