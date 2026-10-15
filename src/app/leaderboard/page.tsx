import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ArrowLeft, CloudOff, Medal, ServerCrash, Trophy } from "lucide-react";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/services/leaderboard";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { formatNumber, formatRupiah } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Papan Peringkat",
};

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-6 py-10">
      <div className="flex items-center justify-between">
        <Link
          href="/play"
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Command Center
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          Babak 1 · The Bootstrap
        </span>
      </div>

      <header className="space-y-1.5">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <Trophy className="h-6 w-6 text-amber-500" />
          Papan Peringkat
        </h1>
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          Peringkat berdasarkan total Revenue perusahaan, dengan Active Users (XP) sebagai
          penentu seri.
        </p>
      </header>

      {/* Data cloud dirender sebagai dynamic hole saat request (Cache Components). */}
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardContent />
      </Suspense>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-1.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded-lg border border-border/60 bg-muted/40"
        />
      ))}
      <p className="pt-1 text-center font-mono text-[10.5px] uppercase tracking-[0.25em] text-muted-foreground">
        Memuat peringkat…
      </p>
    </div>
  );
}

async function LeaderboardContent() {
  await connection();
  const [result, user] = await Promise.all([getLeaderboard(), getAuthenticatedUser()]);

  if (!result.ok && result.reason === "unconfigured") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-5">
        <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="text-[12.5px] leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Cloud belum dikonfigurasi</p>
          <p className="mt-1">
            Papan peringkat membutuhkan Supabase + database (lihat{" "}
            <span className="font-mono">README → Setup Cloud</span>). Saat ini gim berjalan
            dalam Mode Lokal — progresmu tetap aman di browser ini dan akan di-merge
            otomatis begitu login aktif.
          </p>
        </div>
      </div>
    );
  }

  if (!result.ok) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <ServerCrash className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="text-[12.5px] leading-relaxed">
          Papan peringkat sedang tidak dapat dimuat. Coba beberapa saat lagi.
        </div>
      </div>
    );
  }

  if (result.entries.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Medal className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-[12.5px] text-muted-foreground">
          Belum ada pendiri yang masuk. Jadilah yang pertama memuncaki peringkat!
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-1.5">
      {result.entries.map((entry, index) => (
        <LeaderboardRow
          key={entry.id}
          entry={entry}
          index={index}
          isMe={user !== null && entry.id === user.id}
        />
      ))}
    </ol>
  );
}

function LeaderboardRow({
  entry,
  index,
  isMe,
}: {
  entry: LeaderboardEntry;
  index: number;
  isMe: boolean;
}) {
  return (
    <li
      className={
        isMe
          ? "flex items-center gap-3 rounded-lg border border-primary/50 bg-primary/[0.06] px-4 py-3"
          : "flex items-center gap-3 rounded-lg border border-border/70 bg-card px-4 py-3"
      }
    >
      <span className="w-8 shrink-0 text-center font-mono text-[13px] font-semibold text-muted-foreground">
        {index < 3 ? MEDALS[index] : index + 1}
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted/50 text-lg">
        {entry.founderAvatar ?? "🧑‍💻"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-[13.5px] font-semibold">{entry.name}</span>
          {isMe && (
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-primary">
              Kamu
            </span>
          )}
        </span>
        <span className="mt-0.5 block font-mono text-[10.5px] text-muted-foreground">
          {entry.completedCount} misi selesai
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-mono text-[13px] font-semibold text-amber-700">
          {formatRupiah(entry.revenue)}
        </span>
        <span className="block font-mono text-[10.5px] text-muted-foreground">
          {formatNumber(entry.activeUsers)} XP
        </span>
      </span>
    </li>
  );
}
