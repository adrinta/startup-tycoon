"use client";

import { Loader2, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JoinClassForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/class/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (response.status === 404) {
        setNotice("Kode kelas tidak ditemukan. Periksa kembali.");
        return;
      }
      if (!response.ok) {
        setNotice("Gagal bergabung. Coba lagi.");
        return;
      }
      const data = (await response.json()) as { className?: string };
      setNotice(`Berhasil bergabung ke kelas ${data.className ?? ""}!`);
      setCode("");
      router.refresh();
    } catch {
      setNotice("Tidak dapat menghubungi server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-wrap gap-2">
      <Input
        value={code}
        onChange={(event) => setCode(event.target.value.toUpperCase())}
        placeholder="Kode kelas (mis. AB12CD)"
        maxLength={12}
        className="h-8 max-w-[200px] font-mono text-[12px] uppercase"
      />
      <Button type="submit" size="sm" disabled={busy || code.trim().length < 4} className="gap-1.5">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UsersRound className="h-3.5 w-3.5" />}
        Gabung Kelas
      </Button>
      {notice && <p className="w-full font-mono text-[11px] text-muted-foreground">{notice}</p>}
    </form>
  );
}
