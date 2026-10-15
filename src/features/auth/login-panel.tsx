"use client";

import { AlertTriangle, ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";

const ERROR_MESSAGES: Record<string, string> = {
  domain:
    "Email akun Google-mu tidak termasuk domain kampus yang diizinkan untuk gim ini.",
  auth: "Proses masuk gagal atau dibatalkan. Silakan coba lagi.",
  unconfigured: "Cloud belum dikonfigurasi — lihat README bagian Setup Cloud.",
};

export function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { configured, loading, user, signInWithGoogle } = useAuth();
  const errorCode = searchParams.get("error");
  const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] ?? "Terjadi kesalahan." : null;

  useEffect(() => {
    if (user) router.replace("/play");
  }, [user, router]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <Link
        href="/"
        className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Kembali
      </Link>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          Startup Tycoon
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Masuk ke Command Center</h1>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          Gunakan akun Google (pribadi atau email kampus) untuk menyinkronkan progres
          lintas perangkat dan masuk papan peringkat kelas.
        </p>

        {errorMessage && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] leading-relaxed text-red-700">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {errorMessage}
          </div>
        )}

        <div className="mt-5 space-y-2.5">
          {configured ? (
            <Button
              className="w-full gap-2"
              size="lg"
              disabled={loading}
              onClick={() => void signInWithGoogle()}
            >
              <LogIn className="h-4 w-4" />
              Masuk dengan Google
            </Button>
          ) : (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-900">
              Cloud belum dikonfigurasi. Kamu tetap bisa bermain dalam{" "}
              <strong>Mode Lokal</strong> — progres tersimpan di browser ini. Isi{" "}
              <code>.env</code> sesuai panduan <strong>README → Setup Cloud</strong> untuk
              mengaktifkan login.
            </div>
          )}

          <Button asChild variant="outline" className="w-full">
            <Link href="/play">Lanjut bermain (Mode Lokal)</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
