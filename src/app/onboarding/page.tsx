"use client";

import { ArrowLeft, Building2, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth-provider";
import { cn } from "@/lib/utils";

const AVATAR_OPTIONS = ["🧑‍💻", "👩‍💻", "🧑‍🚀", "🦊", "🐙", "🚀", "🦄", "🐳"];

export default function OnboardingPage() {
  const router = useRouter();
  const { configured, loading, user, profile, refreshProfile } = useAuth();

  useEffect(() => {
    if (!loading && configured && !user) router.replace("/login");
  }, [loading, configured, user, router]);

  if (!configured) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 py-16">
        <div className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-lg font-semibold">Mode Lokal</h1>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
            Profil startup cloud membutuhkan konfigurasi Supabase (lihat README → Setup
            Cloud). Saat ini kamu bermain dalam Mode Lokal — profil tersimpan otomatis di
            browser ini.
          </p>
          <Button asChild className="mt-4 w-full">
            <Link href="/play">Kembali ke Gim</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading || (user && !profile)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Memuat profil…
        </span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-[12.5px] text-muted-foreground">
            Profil tidak dapat dimuat. Periksa koneksi lalu muat ulang.
          </p>
          <Button className="mt-4" onClick={() => void refreshProfile()}>
            Muat Ulang Profil
          </Button>
        </div>
      </div>
    );
  }

  // `key` memastikan form ter-remount dengan nilai profil terbaru tanpa
  // perlu sinkronisasi state lewat effect.
  return (
    <OnboardingForm
      key={`${profile.email}:${profile.startupName ?? "baru"}`}
      initialName={profile.startupName ?? ""}
      initialAvatar={profile.founderAvatar ?? "🧑‍💻"}
      email={profile.email}
    />
  );
}

function OnboardingForm({
  initialName,
  initialAvatar,
  email,
}: {
  initialName: string;
  initialAvatar: string;
  email: string;
}) {
  const router = useRouter();
  const [startupName, setStartupName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupName: startupName.trim(), founderAvatar: avatar }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { issues?: string[] } | null;
        setError(body?.issues?.[0] ?? "Gagal menyimpan profil. Coba lagi.");
        return;
      }
      router.push("/play");
    } catch {
      setError("Tidak dapat menghubungi server. Periksa koneksi.");
    } finally {
      setSaving(false);
    }
  }

  const valid = startupName.trim().length >= 2;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-5 px-6 py-16">
      <Link
        href="/play"
        className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Lewati untuk sekarang
      </Link>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          <Building2 className="h-3.5 w-3.5" /> Inisialisasi Perusahaan
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Kenalan dulu, Founder</h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          Nama startup dan avatar pendiri akan tampil di papan peringkat kelas. Masuk
          sebagai <span className="font-mono text-foreground">{email}</span>.
        </p>

        <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="startup-name">Nama Startup</Label>
            <Input
              id="startup-name"
              value={startupName}
              onChange={(event) => setStartupName(event.target.value)}
              placeholder="mis. Nusantara Digital"
              maxLength={40}
              autoComplete="off"
            />
            <p className="text-[10.5px] text-muted-foreground">
              Minimal 2 karakter · tersimpan permanen di profil cloud-mu.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Avatar Pendiri</Label>
            <div className="grid grid-cols-8 gap-1.5">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAvatar(option)}
                  aria-label={`Pilih avatar ${option}`}
                  className={cn(
                    "relative flex aspect-square items-center justify-center rounded-md border text-lg transition-colors",
                    avatar === option
                      ? "border-primary/60 bg-primary/10"
                      : "border-border/70 bg-card hover:bg-muted/60",
                  )}
                >
                  {option}
                  {avatar === option && (
                    <Check className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary p-0.5 text-primary-foreground" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full gap-2" disabled={!valid || saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {initialName ? "Simpan Profil" : "Dirikan Startup"}
          </Button>
        </form>
      </div>
    </div>
  );
}
