"use client";

import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateClassForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (response.status === 403) {
        setNotice("Akun ini bukan pengajar — tambahkan emailmu ke LECTURER_EMAILS.");
        return;
      }
      if (!response.ok) {
        setNotice("Gagal membuat kelas. Coba lagi.");
        return;
      }
      const data = (await response.json()) as { joinCode: string };
      setNotice(`Kelas dibuat! Kode untuk mahasiswa: ${data.joinCode}`);
      setName("");
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
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nama kelas (mis. TI-3A Pemrograman Web)"
        maxLength={60}
        className="h-8 max-w-xs text-[12px]"
      />
      <Button type="submit" size="sm" disabled={busy || name.trim().length < 2} className="gap-1.5">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        Buat Kelas
      </Button>
      {notice && (
        <p className="w-full font-mono text-[11px] text-muted-foreground">{notice}</p>
      )}
    </form>
  );
}
