import { describe, expect, it } from "vitest";
import { getQuestById } from "@/content/quests";
import { buildPortfolioFiles, slugifyTitle } from "@/features/export/build-zip";

function questOrThrow(id: string) {
  const quest = getQuestById(id);
  if (!quest) throw new Error(`quest ${id} tidak ada`);
  return quest;
}

describe("slugifyTitle", () => {
  it("mengubah judul menjadi slug aman untuk nama folder", () => {
    expect(slugifyTitle("Power On System")).toBe("power-on-system");
    expect(slugifyTitle("Pitching Day!")).toBe("pitching-day");
    expect(slugifyTitle("Katalog & Media")).toBe("katalog-media");
  });
});

describe("buildPortfolioFiles", () => {
  const quests = [questOrThrow("1.1"), questOrThrow("1.2"), questOrThrow("4.1")];

  it("hanya menyertakan misi yang selesai, satu folder per misi", () => {
    const files = buildPortfolioFiles({
      quests,
      completedQuestIds: ["1.1", "4.1"],
      drafts: {},
      stats: { revenue: 100, activeUsers: 50, level: 2, ownedItemIds: [] },
    });

    const paths = Object.keys(files);
    expect(paths).toContain("1.1-power-on-system/index.html");
    expect(paths).toContain("4.1-inisialisasi-server/index.php");
    expect(paths.some((path) => path.startsWith("1.2-"))).toBe(false);
    expect(paths).toContain("README.md");
  });

  it("draft pemain menimpa starter code", () => {
    const files = buildPortfolioFiles({
      quests,
      completedQuestIds: ["1.1"],
      drafts: { "1.1": { "index.html": "<!-- versi final pemain -->" } },
      stats: { revenue: 0, activeUsers: 0, level: 1, ownedItemIds: [] },
    });
    expect(files["1.1-power-on-system/index.html"]).toContain("versi final pemain");
  });

  it("README memuat statistik dan daftar misi", () => {
    const files = buildPortfolioFiles({
      quests,
      completedQuestIds: ["1.1", "1.2"],
      drafts: {},
      stats: { revenue: 100, activeUsers: 50, level: 2, ownedItemIds: ["lampu-berdiri"] },
    });
    const readme = files["README.md"];
    expect(readme).toContain("Rp 100");
    expect(readme).toContain("2 dari 3");
    expect(readme).toContain("[1.1] Power On System");
    expect(readme).toContain("lampu-berdiri");
  });
});
