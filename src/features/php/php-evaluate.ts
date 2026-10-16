import type { Objective, Rule } from "@/content/quests/schema";
import type { ObjectiveResult } from "@/features/validation/types";

export interface PhpScenarioOutput {
  id: string;
  /** Output tampilan (marker DB sudah dibuang). */
  text: string;
  errors: string;
  exitCode: number;
  /** Hasil query inspeksi database (JSON string) bila skenario mendefinisikannya. */
  dbJson: string | null;
}

/**
 * Evaluator sisi React untuk objektif `php` (Babak 4). Dipanggil setelah
 * semua skenario dieksekusi oleh mesin PHP-WASM. Murni & dapat diuji tanpa WASM.
 */
export function evaluatePhpObjectives(
  objectives: Objective[],
  outputs: PhpScenarioOutput[],
): ObjectiveResult[] {
  const outputById = new Map(outputs.map((output) => [output.id, output]));

  return objectives.map((objective) => {
    const rule = objective.rule;
    if (rule.kind !== "php") {
      return {
        id: objective.id,
        passed: false,
        detail: "Babak 4 hanya mendukung objektif PHP.",
      } satisfies ObjectiveResult;
    }
    return { id: objective.id, ...evaluatePhpRule(rule, outputById) };
  });
}

function evaluatePhpRule(
  rule: Extract<Rule, { kind: "php" }>,
  outputById: Map<string, PhpScenarioOutput>,
): { passed: boolean; detail?: string } {
  const output = outputById.get(rule.scenario);
  if (!output) {
    return {
      passed: false,
      detail: `Skenario "${rule.scenario}" tidak dijalankan. Coba deploy ulang.`,
    };
  }

  if (rule.expectExitCode !== undefined && output.exitCode !== rule.expectExitCode) {
    return {
      passed: false,
      detail: `Script keluar dengan kode ${output.exitCode} (diharapkan ${rule.expectExitCode}).`,
    };
  }

  if (rule.expectNoPhpErrors && output.errors.trim() !== "") {
    return {
      passed: false,
      detail: "PHP melaporkan error: " + output.errors.trim().split("\n")[0],
    };
  }

  for (const needle of rule.expectOutputContains ?? []) {
    if (!output.text.includes(needle)) {
      return {
        passed: false,
        detail: `Output belum memuat "${needle}".`,
      };
    }
  }

  for (const needle of rule.expectOutputNotContains ?? []) {
    if (output.text.includes(needle)) {
      return {
        passed: false,
        detail: `Output masih memuat "${needle}" — seharusnya tidak.`,
      };
    }
  }

  if (rule.expectSelector !== undefined) {
    const found = parseSelector(output.text, rule.expectSelector);
    if (found !== true) {
      return {
        passed: false,
        detail: `Halaman hasil belum memiliki elemen "${rule.expectSelector}".`,
      };
    }
  }

  if (rule.expectNoSelector !== undefined) {
    const found = parseSelector(output.text, rule.expectNoSelector);
    if (found !== false) {
      return {
        passed: false,
        detail: `Halaman hasil masih memiliki elemen "${rule.expectNoSelector}".`,
      };
    }
  }

  for (const needle of rule.expectDbContains ?? []) {
    if (output.dbJson === null) {
      return {
        passed: false,
        detail: "Pemeriksaan database tidak tersedia untuk skenario ini.",
      };
    }
    if (!output.dbJson.includes(needle)) {
      return {
        passed: false,
        detail: `Data "${needle}" belum ditemukan di database.`,
      };
    }
  }

  return { passed: true };
}

function parseSelector(html: string, selector: string): boolean | null {
  if (typeof DOMParser === "undefined") return null;
  try {
    const document = new DOMParser().parseFromString(html, "text/html");
    return document.querySelector(selector) !== null;
  } catch {
    return null;
  }
}
