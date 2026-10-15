/**
 * Gerbang konfigurasi cloud. Semua fitur M3 (auth, sync, leaderboard)
 * memakai fungsi ini agar aplikasi tetap berjalan penuh dalam
 * "Mode Lokal" ketika environment Supabase belum diisi.
 */

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Daftar domain kampus yang diizinkan (kosong = semua domain Google). */
export function getAllowedEmailDomains(): string[] {
  const raw = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? "";
  return raw
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Mengizinkan email bila daftar domain kosong, atau bila domain email
 * sama dengan salah satu domain yang terdaftar (termasuk subdomain).
 */
export function isEmailDomainAllowed(email: string | null | undefined): boolean {
  const domains = getAllowedEmailDomains();
  if (domains.length === 0) return true;
  if (!email) return false;
  const at = email.lastIndexOf("@");
  if (at === -1) return false;
  const domain = email.slice(at + 1).toLowerCase();
  return domains.some((allowed) => domain === allowed || domain.endsWith("." + allowed));
}
