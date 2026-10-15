import { afterEach, describe, expect, it } from "vitest";
import {
  getAllowedEmailDomains,
  isDatabaseConfigured,
  isEmailDomainAllowed,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

function setEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}

afterEach(() => {
  setEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
  setEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", undefined);
  setEnv("DATABASE_URL", undefined);
  setEnv("NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS", undefined);
});

describe("gerbang konfigurasi cloud", () => {
  it("mode lokal saat env Supabase belum diisi", () => {
    expect(isSupabaseConfigured()).toBe(false);
    expect(isDatabaseConfigured()).toBe(false);
  });

  it("aktif saat URL dan anon key tersedia", () => {
    setEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    setEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    setEnv("DATABASE_URL", "postgresql://example");
    expect(isSupabaseConfigured()).toBe(true);
    expect(isDatabaseConfigured()).toBe(true);
  });

  it("tidak aktif bila salah satu env Supabase hilang", () => {
    setEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    expect(isSupabaseConfigured()).toBe(false);
  });
});

describe("pembatasan domain email kampus", () => {
  it("tanpa daftar domain, semua email diizinkan", () => {
    expect(getAllowedEmailDomains()).toEqual([]);
    expect(isEmailDomainAllowed("siapa.saja@gmail.com")).toBe(true);
    expect(isEmailDomainAllowed(null)).toBe(true);
  });

  it("membatasi ke domain terdaftar termasuk subdomain", () => {
    setEnv("NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS", "univ.ac.id, Kampus.Example.COM ");
    expect(getAllowedEmailDomains()).toEqual(["univ.ac.id", "kampus.example.com"]);
    expect(isEmailDomainAllowed("mahasiswa@univ.ac.id")).toBe(true);
    expect(isEmailDomainAllowed("dosen@fisip.univ.ac.id")).toBe(true);
    expect(isEmailDomainAllowed("user@kampus.example.com")).toBe(true);
    expect(isEmailDomainAllowed("user@gmail.com")).toBe(false);
    expect(isEmailDomainAllowed("penipu@univ.ac.id.evil.com")).toBe(false);
    expect(isEmailDomainAllowed(null)).toBe(false);
    expect(isEmailDomainAllowed("tanpa-at")).toBe(false);
  });
});
