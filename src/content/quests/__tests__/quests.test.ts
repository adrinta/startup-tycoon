import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { QUESTS, getQuestById } from "@/content/quests";
import { questSchema, type MockApi, type QuestFileMap } from "@/content/quests/schema";
import {
  QUEST_BROKEN_SAMPLES,
  QUEST_SOLUTIONS,
} from "@/content/quests/__fixtures__/solutions";
import { buildSrcdoc } from "@/features/sandbox/build-srcdoc";
import { evaluateObjectives } from "@/features/sandbox/harness";
import { objectiveViewport } from "@/features/sandbox/viewport";
import type { Objective } from "@/content/quests/schema";

/**
 * Dokumen uji dibangun lewat `buildSrcdoc` yang sama dengan aplikasi
 * (style.css disuntikkan ke <style>, script dijalankan), lalu dieksekusi
 * di JSDOM sehingga aturan dom, computed, dan js diukur apa adanya.
 */
function buildTestDocument(files: QuestFileMap, mocks?: MockApi[]): Document {
  return new JSDOM(buildSrcdoc(files, "test-nonce", { mocks }), {
    runScripts: "dangerously",
  }).window.document;
}

function nonViewportObjectives(questId: string): Objective[] {
  const quest = getQuestById(questId);
  if (!quest) throw new Error(`Quest ${questId} tidak ditemukan`);
  return quest.objectives.filter((objective) => objectiveViewport(objective) === null);
}

async function failedIds(
  questId: string,
  files: QuestFileMap,
  objectives: Objective[],
): Promise<string[]> {
  const quest = getQuestById(questId);
  const results = await evaluateObjectives(buildTestDocument(files, quest?.mocks), objectives);
  return results.filter((result) => !result.passed).map((result) => result.id);
}

describe("integritas katalog quest", () => {
  it("semua quest valid menurut schema zod", () => {
    expect(QUESTS.length).toBeGreaterThan(0);
    for (const quest of QUESTS) {
      const parsed = questSchema.safeParse(quest);
      const issues = parsed.success ? "" : JSON.stringify(parsed.error.issues);
      expect(parsed.success, `quest ${quest.id} tidak valid: ${issues}`).toBe(true);
    }
  });

  it("setiap quest punya objective dengan id unik", () => {
    for (const quest of QUESTS) {
      const ids = quest.objectives.map((objective) => objective.id);
      expect(new Set(ids).size, `quest ${quest.id} punya objective id duplikat`).toBe(ids.length);
    }
  });

  it("id quest unik dan urutan order berurutan menaik", () => {
    const ids = QUESTS.map((quest) => quest.id);
    expect(new Set(ids).size).toBe(ids.length);
    const orders = QUESTS.map((quest) => quest.order);
    expect(new Set(orders).size).toBe(orders.length);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("setiap quest punya solusi kanonik untuk pengujian", () => {
    for (const quest of QUESTS) {
      expect(QUEST_SOLUTIONS[quest.id], `solusi quest ${quest.id} belum dibuat`).toBeTruthy();
    }
  });

  it("objective ber-viewport hanya muncul di quest responsive", () => {
    for (const quest of QUESTS) {
      const hasViewport = quest.objectives.some(
        (objective) => objectiveViewport(objective) !== null,
      );
      if (hasViewport) {
        expect(quest.responsivePreview, `quest ${quest.id} butuh responsivePreview`).toBe(true);
        const css = QUEST_SOLUTIONS[quest.id]?.["style.css"] ?? "";
        expect(css, `solusi ${quest.id} harus memuat @media`).toMatch(/@media/);
      }
    }
  });
});

describe("solusi kanonik lulus semua objective non-viewport", () => {
  for (const quest of QUESTS) {
    it(
      `quest ${quest.id} — ${quest.title}`,
      async () => {
        const objectives = nonViewportObjectives(quest.id);
        const failed = await failedIds(quest.id, QUEST_SOLUTIONS[quest.id], objectives);
        expect(failed, `objective yang gagal: ${failed.join(", ")}`).toEqual([]);
      },
      30000,
    );
  }
});

describe("starter code masih menantang (belum lulus)", () => {
  for (const quest of QUESTS) {
    it(
      `quest ${quest.id} starter belum menyelesaikan misi`,
      async () => {
        const objectives = nonViewportObjectives(quest.id);
        const results = await evaluateObjectives(
          buildTestDocument(quest.starterFiles, quest.mocks),
          objectives,
        );
        expect(
          results.some((result) => !result.passed),
          `starter quest ${quest.id} sudah lulus semua objective yang teruji`,
        ).toBe(true);
      },
      30000,
    );
  }
});

describe("varian kode rusak harus terdeteksi", () => {
  for (const [questId, sample] of Object.entries(QUEST_BROKEN_SAMPLES)) {
    it(
      `quest ${questId} gagal pada objective "${sample.expectFailed}"`,
      async () => {
        const quest = getQuestById(questId);
        if (!quest) throw new Error(`Quest ${questId} tidak ditemukan`);
        const failed = await failedIds(questId, sample.files, quest.objectives);
        expect(failed).toContain(sample.expectFailed);
      },
      30000,
    );
  }
});
