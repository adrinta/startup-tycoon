import { describe, expect, it } from "vitest";
import type { Objective } from "@/content/quests/schema";
import {
  evaluatePhpObjectives,
  type PhpScenarioOutput,
} from "@/features/php/php-evaluate";

function output(partial: Partial<PhpScenarioOutput> & { id: string }): PhpScenarioOutput {
  return {
    text: "",
    errors: "",
    exitCode: 0,
    dbJson: null,
    ...partial,
  };
}

function objective(id: string, rule: Objective["rule"]): Objective {
  return { id, label: id, rule };
}

describe("evaluatePhpObjectives", () => {
  it("lolos saat seluruh pemeriksaan output terpenuhi", () => {
    const objectives: Objective[] = [
      objective("a", {
        kind: "php",
        scenario: "utama",
        expectOutputContains: ["<h1>Project X</h1>", "3 fitur"],
        expectOutputNotContains: ["<?php"],
      }),
      objective("b", {
        kind: "php",
        scenario: "utama",
        expectSelector: "h1",
        expectNoSelector: "script",
      }),
    ];
    const results = evaluatePhpObjectives(objectives, [
      output({ id: "utama", text: "<html><body><h1>Project X</h1><p>3 fitur aktif</p></body></html>" }),
    ]);
    expect(results.map((result) => result.passed)).toEqual([true, true]);
  });

  it("memberi detail saat konten tidak ditemukan", () => {
    const results = evaluatePhpObjectives(
      [objective("a", { kind: "php", scenario: "s", expectOutputContains: ["Selamat datang"] })],
      [output({ id: "s", text: "Login gagal" })],
    );
    expect(results[0].passed).toBe(false);
    expect(results[0].detail).toContain("Selamat datang");
  });

  it("menolak konten terlarang", () => {
    const results = evaluatePhpObjectives(
      [
        objective("a", {
          kind: "php",
          scenario: "s",
          expectOutputNotContains: ["Selamat datang"],
        }),
      ],
      [output({ id: "s", text: "Selamat datang, admin!" })],
    );
    expect(results[0].passed).toBe(false);
    expect(results[0].detail).toContain("masih memuat");
  });

  it("memeriksa selector DOM pada output", () => {
    const missing = evaluatePhpObjectives(
      [objective("a", { kind: "php", scenario: "s", expectSelector: "#daftar-produk" })],
      [output({ id: "s", text: "<div id='lain'>x</div>" })],
    );
    expect(missing[0].passed).toBe(false);

    const strip = evaluatePhpObjectives(
      [objective("b", { kind: "php", scenario: "s", expectNoSelector: "form" })],
      [output({ id: "s", text: "<div>tanpa form</div>" })],
    );
    expect(strip[0].passed).toBe(true);
  });

  it("memeriksa isi database dari dbJson", () => {
    const ok = evaluatePhpObjectives(
      [objective("a", { kind: "php", scenario: "s", expectDbContains: ['"nama":"Teh Botol"'] })],
      [output({ id: "s", dbJson: '[{"nama":"Teh Botol"}]' })],
    );
    expect(ok[0].passed).toBe(true);

    const missingRow = evaluatePhpObjectives(
      [objective("b", { kind: "php", scenario: "s", expectDbContains: ['"nama":"Kopi"'] })],
      [output({ id: "s", dbJson: '[{"nama":"Teh Botol"}]' })],
    );
    expect(missingRow[0].passed).toBe(false);
    expect(missingRow[0].detail).toContain("Kopi");

    const noQuery = evaluatePhpObjectives(
      [objective("c", { kind: "php", scenario: "s", expectDbContains: ["x"] })],
      [output({ id: "s", dbJson: null })],
    );
    expect(noQuery[0].passed).toBe(false);
    expect(noQuery[0].detail).toContain("database");
  });

  it("memeriksa exit code dan error PHP opsional", () => {
    const exitBad = evaluatePhpObjectives(
      [objective("a", { kind: "php", scenario: "s", expectExitCode: 0 })],
      [output({ id: "s", exitCode: 2 })],
    );
    expect(exitBad[0].passed).toBe(false);

    const noErrors = evaluatePhpObjectives(
      [objective("b", { kind: "php", scenario: "s", expectNoPhpErrors: true })],
      [output({ id: "s", errors: "Warning: Undefined variable" })],
    );
    expect(noErrors[0].passed).toBe(false);
    expect(noErrors[0].detail).toContain("Warning");
  });

  it("gagal ramah bila skenario tidak dijalankan", () => {
    const results = evaluatePhpObjectives(
      [objective("a", { kind: "php", scenario: "hilang" })],
      [output({ id: "lain" })],
    );
    expect(results[0].passed).toBe(false);
    expect(results[0].detail).toContain("hilang");
  });

  it("menolak aturan non-php di babak ini", () => {
    const results = evaluatePhpObjectives(
      [objective("a", { kind: "dom", selector: "form" })],
      [output({ id: "s" })],
    );
    expect(results[0].passed).toBe(false);
    expect(results[0].detail).toContain("PHP");
  });
});
