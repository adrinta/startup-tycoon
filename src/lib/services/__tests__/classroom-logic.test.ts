import { describe, expect, it } from "vitest";
import {
  generateJoinCode,
  isLecturerEmail,
  normalizeJoinCode,
  rankBottleneckQuests,
  summarizeAttempts,
} from "@/lib/services/classroom-logic";

describe("kode kelas", () => {
  it("menghasilkan kode 6 karakter tanpa huruf ambigu", () => {
    for (let i = 0; i < 20; i += 1) {
      const code = generateJoinCode();
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/);
      expect(code).not.toMatch(/[IO01L]/);
    }
  });

  it("kode acak bervariasi", () => {
    const codes = new Set(Array.from({ length: 30 }, () => generateJoinCode()));
    expect(codes.size).toBeGreaterThan(25);
  });

  it("normalisasi memangkas spasi dan menaikkan huruf", () => {
    expect(normalizeJoinCode("  ab12cd ")).toBe("AB12CD");
  });
});

describe("deteksi pengajar (LECTURER_EMAILS)", () => {
  it("cocok tanpa peduli huruf besar/kecil dan spasi", () => {
    expect(isLecturerEmail("Dosen@Kampus.ac.id", "dosen@kampus.ac.id, lain@x.com")).toBe(true);
    expect(isLecturerEmail("dosen@kampus.ac.id", " dosen@kampus.ac.id , x@y.z")).toBe(true);
  });

  it("tidak cocok untuk email lain atau daftar kosong", () => {
    expect(isLecturerEmail("mhs@kampus.ac.id", "dosen@kampus.ac.id")).toBe(false);
    expect(isLecturerEmail("dosen@kampus.ac.id", undefined)).toBe(false);
    expect(isLecturerEmail(null, "dosen@kampus.ac.id")).toBe(false);
  });
});

describe("ringkasan akurasi", () => {
  it("tanpa percobaan dianggap akurasi sempurna", () => {
    expect(summarizeAttempts([])).toEqual({ total: 0, passed: 0, failed: 0, accuracy: 1 });
  });

  it("menghitung proporsi lulus", () => {
    const summary = summarizeAttempts([
      { passed: true },
      { passed: false },
      { passed: true },
      { passed: true },
    ]);
    expect(summary.total).toBe(4);
    expect(summary.failed).toBe(1);
    expect(summary.accuracy).toBeCloseTo(0.75);
  });
});

describe("bottleneck misi", () => {
  it("mengurutkan berdasarkan tingkat kegagalan lalu jumlah kegagalan", () => {
    const ranked = rankBottleneckQuests([
      { questId: "1.1", passed: true },
      { questId: "2.2", passed: false },
      { questId: "2.2", passed: false },
      { questId: "2.2", passed: true },
      { questId: "3.7", passed: false },
      { questId: "3.7", passed: true },
    ]);
    expect(ranked[0].questId).toBe("2.2");
    expect(ranked[0].failRate).toBeCloseTo(2 / 3);
    expect(ranked[1].questId).toBe("3.7");
    expect(ranked[2].questId).toBe("1.1");
    expect(ranked[2].failRate).toBe(0);
  });

  it("membatasi jumlah hasil", () => {
    const attempts = Array.from({ length: 12 }, (_, index) => ({
      questId: `1.${index + 1}`,
      passed: false,
    }));
    expect(rankBottleneckQuests(attempts, 5)).toHaveLength(5);
  });
});
