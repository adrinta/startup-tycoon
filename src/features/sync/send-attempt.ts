"use client";

import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Mencatat satu audit (deploy) ke cloud untuk metrik akurasi & bottleneck
 * dashboard pengajar. Fire-and-forget: kegagalan diabaikan (mis. mode lokal).
 */
export function sendAttempt(questId: string, passed: boolean): void {
  if (!isSupabaseConfigured()) return;
  void fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questId, passed }),
  }).catch(() => undefined);
}
