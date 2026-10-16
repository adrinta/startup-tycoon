import { describe, expect, it } from "vitest";
import type { Objective } from "@/content/quests/schema";
import type { ObjectiveResult } from "@/features/validation/types";
import {
  VIEWPORT_DIMENSIONS,
  dimensionForWidth,
  groupObjectivesByViewport,
  mergeGroupResults,
  objectiveViewport,
  viewportWidthOf,
} from "@/features/sandbox/viewport";

function makeObjective(id: string, viewport?: number): Objective {
  if (viewport === undefined) {
    return { id, label: id, rule: { kind: "dom", selector: "div" } };
  }
  return {
    id,
    label: id,
    rule: { kind: "computed", selector: "div", property: "display", expected: "flex", viewport },
  };
}

describe("definisi viewport", () => {
  it("memetakan nama viewport ke lebar standar", () => {
    expect(viewportWidthOf("desktop")).toBe(1280);
    expect(viewportWidthOf("tablet")).toBe(768);
    expect(viewportWidthOf("mobile")).toBe(390);
    expect(viewportWidthOf("fit")).toBeNull();
  });

  it("dimensionForWidth mengembalikan dimensi dikenal atau fallback", () => {
    expect(dimensionForWidth(390)).toEqual(VIEWPORT_DIMENSIONS.mobile);
    expect(dimensionForWidth(1024)).toEqual({ width: 1024, height: 800, label: "1024px" });
  });
});

describe("objectiveViewport", () => {
  it("membaca viewport dari aturan computed dan allOf", () => {
    expect(objectiveViewport(makeObjective("a", 390))).toBe(390);
    const allOf: Objective = {
      id: "b",
      label: "b",
      rule: { kind: "allOf", viewport: 1280, rules: [{ kind: "dom", selector: "div" }] },
    };
    expect(objectiveViewport(allOf)).toBe(1280);
  });

  it("null untuk objective tanpa viewport", () => {
    expect(objectiveViewport(makeObjective("c"))).toBeNull();
  });
});

describe("groupObjectivesByViewport", () => {
  it("mengelompokkan sesuai urutan kemunculan", () => {
    const groups = groupObjectivesByViewport([
      makeObjective("default-1"),
      makeObjective("desktop-1", 1280),
      makeObjective("default-2"),
      makeObjective("mobile-1", 390),
      makeObjective("desktop-2", 1280),
    ]);

    expect(groups.map((group) => group.viewport)).toEqual([null, 1280, 390]);
    expect(groups[0].objectives.map((objective) => objective.id)).toEqual([
      "default-1",
      "default-2",
    ]);
    expect(groups[1].objectives.map((objective) => objective.id)).toEqual([
      "desktop-1",
      "desktop-2",
    ]);
    expect(groups[2].objectives.map((objective) => objective.id)).toEqual(["mobile-1"]);
  });

  it("daftar kosong menghasilkan tidak ada grup", () => {
    expect(groupObjectivesByViewport([])).toEqual([]);
  });
});

describe("mergeGroupResults", () => {
  it("menyusun ulang hasil mengikuti urutan objective asli", () => {
    const objectives = [
      makeObjective("a"),
      makeObjective("b", 1280),
      makeObjective("c", 390),
    ];
    const collected = new Map<string, ObjectiveResult>([
      ["c", { id: "c", passed: true }],
      ["a", { id: "a", passed: true }],
      ["b", { id: "b", passed: false, detail: "belum" }],
    ]);

    const merged = mergeGroupResults(objectives, collected);
    expect(merged.map((result) => result.id)).toEqual(["a", "b", "c"]);
    expect(merged[1].passed).toBe(false);
  });

  it("objective yang tidak diperiksa ditandai gagal dengan pesan netral", () => {
    const objectives = [makeObjective("a"), makeObjective("b")];
    const merged = mergeGroupResults(objectives, new Map([["a", { id: "a", passed: true }]]));
    expect(merged[1].passed).toBe(false);
    expect(merged[1].detail).toContain("tidak selesai");
  });
});
