import { describe, expect, it } from "vitest";
import { QUESTS, getQuestById } from "@/content/quests";
import { questSchema } from "@/content/quests/schema";
import {
  QUEST_BROKEN_SAMPLES,
  QUEST_SOLUTIONS,
} from "@/content/quests/__fixtures__/solutions";
import { evaluateObjectives } from "@/features/sandbox/harness";

function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

function failedObjectiveIds(questId: string, code: string): string[] {
  const quest = getQuestById(questId);
  if (!quest) throw new Error(`Quest ${questId} tidak ditemukan`);
  return evaluateObjectives(parseHtml(code), quest.objectives)
    .filter((result) => !result.passed)
    .map((result) => result.id);
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
});

describe("solusi kanonik lulus semua objective", () => {
  for (const quest of QUESTS) {
    it(`quest ${quest.id} — ${quest.title}`, () => {
      const failed = failedObjectiveIds(quest.id, QUEST_SOLUTIONS[quest.id]);
      expect(failed, `objective yang gagal: ${failed.join(", ")}`).toEqual([]);
    });
  }
});

describe("starter code masih menantang (belum lulus)", () => {
  for (const quest of QUESTS) {
    it(`quest ${quest.id} starter belum menyelesaikan misi`, () => {
      const starter = quest.starterFiles["index.html"] ?? "";
      const results = evaluateObjectives(parseHtml(starter), quest.objectives);
      expect(
        results.some((result) => !result.passed),
        `starter quest ${quest.id} sudah lulus semua objective`,
      ).toBe(true);
    });
  }
});

describe("varian kode rusak harus terdeteksi", () => {
  for (const [questId, sample] of Object.entries(QUEST_BROKEN_SAMPLES)) {
    it(`quest ${questId} gagal pada objective "${sample.expectFailed}"`, () => {
      expect(failedObjectiveIds(questId, sample.code)).toContain(sample.expectFailed);
    });
  }
});
