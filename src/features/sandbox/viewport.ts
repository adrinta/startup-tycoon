import type { Objective, ObjectiveResult } from "@/features/validation/types";

export type PreviewViewport = "fit" | "desktop" | "tablet" | "mobile";

export interface ViewportDimension {
  width: number;
  height: number;
  label: string;
}

export const VIEWPORT_DIMENSIONS: Record<Exclude<PreviewViewport, "fit">, ViewportDimension> = {
  desktop: { width: 1280, height: 800, label: "Desktop" },
  tablet: { width: 768, height: 1024, label: "Tablet" },
  mobile: { width: 390, height: 844, label: "Mobile" },
};

export function dimensionForWidth(width: number): ViewportDimension {
  const known = Object.values(VIEWPORT_DIMENSIONS).find((dimension) => dimension.width === width);
  if (known) return known;
  return { width, height: 800, label: `${width}px` };
}

export function viewportWidthOf(viewport: PreviewViewport): number | null {
  if (viewport === "fit") return null;
  return VIEWPORT_DIMENSIONS[viewport].width;
}

/** Lebar viewport yang menempel pada aturan (mis. pemeriksaan khusus media query). */
export function objectiveViewport(objective: Objective): number | null {
  const rule = objective.rule;
  if ((rule.kind === "computed" || rule.kind === "allOf") && typeof rule.viewport === "number") {
    return rule.viewport;
  }
  return null;
}

export function hasViewportObjectives(objectives: Objective[]): boolean {
  return objectives.some((objective) => objectiveViewport(objective) !== null);
}

export interface ObjectiveGroup {
  viewport: number | null;
  objectives: Objective[];
}

/**
 * Mengelompokkan objective berdasarkan lebar viewport pengujiannya.
 * Objective tanpa `viewport` masuk grup `null` (dijalankan apa adanya).
 */
export function groupObjectivesByViewport(objectives: Objective[]): ObjectiveGroup[] {
  const groups: ObjectiveGroup[] = [];
  const indexByViewport = new Map<number | null, number>();

  for (const objective of objectives) {
    const viewport = objectiveViewport(objective);
    let index = indexByViewport.get(viewport);
    if (index === undefined) {
      index = groups.length;
      groups.push({ viewport, objectives: [] });
      indexByViewport.set(viewport, index);
    }
    groups[index].objectives.push(objective);
  }

  return groups;
}

/**
 * Menyusun ulang hasil per-viewport mengikuti urutan objective aslinya.
 * Objective yang tidak sempat diperiksa ditandai gagal dengan pesan netral.
 */
export function mergeGroupResults(
  objectives: Objective[],
  collected: Map<string, ObjectiveResult>,
): ObjectiveResult[] {
  return objectives.map(
    (objective) =>
      collected.get(objective.id) ?? {
        id: objective.id,
        passed: false,
        detail: "Pemeriksaan tidak selesai — deploy ulang untuk mengulang audit.",
      },
  );
}
