import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  ArrowLeft,
  CloudOff,
  GraduationCap,
  KeyRound,
  TriangleAlert,
  UsersRound,
} from "lucide-react";
import { getQuestById } from "@/content/quests";
import { CreateClassForm } from "@/features/classroom/create-class-form";
import { JoinClassForm } from "@/features/classroom/join-class-form";
import { getPrisma } from "@/lib/db/prisma";
import { getClassroomOverview } from "@/lib/services/classroom";
import { isLecturerEmail } from "@/lib/services/classroom-logic";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { formatNumber, formatRupiah } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Dashboard Pengajar",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-6 py-10">
      <div className="flex items-center justify-between">
        <Link
          href="/play"
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Command Center
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          M7 · Kelas & Analitik
        </span>
      </div>

      <header className="space-y-1.5">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
          <GraduationCap className="h-6 w-6 text-primary" />
          Dashboard Pengajar
        </h1>
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          Pantau progres kelas, akurasi kode mahasiswa, dan temukan misi yang paling sering
          menjadi kendala.
        </p>
      </header>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-lg border border-border/60 bg-muted/40" />
      ))}
    </div>
  );
}

async function DashboardContent() {
  await connection();
  const user = await getAuthenticatedUser();

  if (!user) {
    return (
      <Notice
        icon={<CloudOff className="h-5 w-5" />}
        title="Masuk dengan Google dulu"
        body="Dashboard kelas membutuhkan akun (data tersimpan di cloud)."
      />
    );
  }

  const prisma = getPrisma();
  if (!prisma) {
    return (
      <Notice
        icon={<CloudOff className="h-5 w-5" />}
        title="Cloud belum dikonfigurasi"
        body="Ikuti README → Setup Cloud untuk mengaktifkan kelas & analitik."
      />
    );
  }

  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  const lecturer = isLecturerEmail(user.email) || row?.role === "lecturer";

  if (!lecturer) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold">
            <UsersRound className="h-4 w-4 text-primary" /> Area Mahasiswa
          </h2>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Gabung ke kelas dengan kode dari dosenmu agar progres dan akurasi kodingmu ikut
            terpantau di dashboard kelas.
          </p>
          <div className="mt-3">
            <JoinClassForm />
          </div>
        </div>
        <p className="px-1 font-mono text-[10.5px] leading-relaxed text-muted-foreground/90">
          Dosen? Tambahkan emailmu ke variabel environment LECTURER_EMAILS lalu login ulang
          untuk membuka panel pengajar.
        </p>
      </div>
    );
  }

  const overview = await getClassroomOverview(user.id);
  if (!overview) {
    return (
      <Notice
        icon={<TriangleAlert className="h-5 w-5" />}
        title="Gagal memuat data kelas"
        body="Coba beberapa saat lagi."
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="space-y-2 rounded-lg border border-border bg-card p-5">
        <h2 className="text-[14px] font-semibold">Kelasmu</h2>
        <CreateClassForm />
        {overview.classes.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">
            Belum ada kelas. Buat kelas pertama dan bagikan kodenya ke mahasiswa.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {overview.classes.map((entry) => (
              <div key={entry.id} className="rounded-md border border-border/70 bg-muted/30 px-3 py-2.5">
                <div className="text-[12.5px] font-semibold">{entry.name}</div>
                <div className="mt-1 flex items-center gap-2">
                  <KeyRound className="h-3.5 w-3.5 text-primary" />
                  <span className="font-mono text-[14px] font-bold tracking-[0.2em] text-primary">
                    {entry.joinCode}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    {entry.memberCount} mahasiswa
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[14px] font-semibold">Progres Mahasiswa</h2>
          <span className="font-mono text-[10.5px] text-muted-foreground">
            {overview.totals.members} mahasiswa · {overview.totals.attempts} audit tercatat
          </span>
        </div>
        {overview.members.length === 0 ? (
          <p className="rounded-lg border border-border bg-card px-4 py-3 text-[12px] text-muted-foreground">
            Belum ada mahasiswa yang bergabung.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-muted/50 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Mahasiswa</th>
                  <th className="px-3 py-2 text-right">Misi</th>
                  <th className="px-3 py-2 text-right">Akurasi</th>
                  <th className="px-3 py-2 text-right">Revenue</th>
                  <th className="px-3 py-2 text-right">XP</th>
                </tr>
              </thead>
              <tbody>
                {overview.members.map((member) => (
                  <tr key={member.id} className="border-t border-border/60 bg-card">
                    <td className="px-3 py-2">
                      <div className="font-medium">{member.label}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{member.email}</div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{member.completedCount}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {member.attempts === 0 ? "—" : `${Math.round(member.accuracy * 100)}%`}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-amber-700">
                      {formatRupiah(member.revenue)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{formatNumber(member.activeUsers)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-[14px] font-semibold">Misi Paling Menantang (Bottleneck)</h2>
        {overview.bottlenecks.length === 0 ? (
          <p className="rounded-lg border border-border bg-card px-4 py-3 text-[12px] text-muted-foreground">
            Belum ada data audit. Ajak mahasiswa menyelesaikan misi pertamanya.
          </p>
        ) : (
          <ol className="space-y-1.5">
            {overview.bottlenecks.map((entry, index) => {
              const quest = getQuestById(entry.questId);
              return (
                <li
                  key={entry.questId}
                  className="flex items-center gap-3 rounded-md border border-border/70 bg-card px-3 py-2"
                >
                  <span className="w-5 font-mono text-[11px] text-muted-foreground">{index + 1}.</span>
                  <span className="min-w-0 flex-1">
                    <span className="text-[12.5px] font-medium">
                      [{entry.questId}] {quest?.title ?? "Misi"}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                      {entry.total} audit · {entry.failed} gagal
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 font-mono text-[11px] text-red-700">
                    {Math.round(entry.failRate * 100)}% gagal
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

function Notice({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-5">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="text-[12.5px] leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1">{body}</p>
      </div>
    </div>
  );
}
