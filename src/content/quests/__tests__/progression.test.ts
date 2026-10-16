import { describe, expect, it } from "vitest";
import {
  QUESTS,
  getFirstPlayableQuestId,
  getNextQuest,
  getQuestById,
  isQuestUnlocked,
} from "@/content/quests";

describe("progresi & pembukaan misi", () => {
  it("misi pertama selalu terbuka", () => {
    const first = QUESTS[0];
    expect(isQuestUnlocked(first, [])).toBe(true);
  });

  it("misi berikutnya terkunci sampai misi sebelumnya selesai", () => {
    const second = getQuestById("1.2");
    expect(second).toBeTruthy();
    if (!second) return;
    expect(isQuestUnlocked(second, [])).toBe(false);
    expect(isQuestUnlocked(second, ["1.1"])).toBe(true);
  });

  it("boss fight terbuka setelah misi terakhir babaknya selesai", () => {
    const boss = getQuestById("1.7");
    expect(boss).toBeTruthy();
    if (!boss) return;
    expect(isQuestUnlocked(boss, ["1.1", "1.2", "1.3", "1.4", "1.5"])).toBe(false);
    expect(isQuestUnlocked(boss, ["1.6"])).toBe(true);
  });

  it("misi pertama yang bisa dimainkan mengikuti progres pemain", () => {
    expect(getFirstPlayableQuestId([])).toBe("1.1");
    expect(getFirstPlayableQuestId(["1.1"])).toBe("1.2");
    expect(getFirstPlayableQuestId(["1.1", "1.2", "1.3"])).toBe("1.4");
  });

  it("setelah semua misi selesai, fallback menunjuk misi terakhir", () => {
    const allIds = QUESTS.map((quest) => quest.id);
    expect(getFirstPlayableQuestId(allIds)).toBe(allIds[allIds.length - 1]);
  });

  it("getNext mengembalikan misi berikutnya dan undefined di akhir babak terakhir", () => {
    expect(getNextQuest("1.1")?.id).toBe("1.2");
    expect(getNextQuest("1.6")?.id).toBe("1.7");
    expect(getNextQuest("1.7")?.id).toBe("2.1");
    expect(getNextQuest("2.6")?.id).toBe("2.7");
    expect(getNextQuest("2.7")?.id).toBe("3.1");
    expect(getNextQuest("3.6")?.id).toBe("3.7");
    expect(getNextQuest("3.7")?.id).toBe("4.1");
    expect(getNextQuest("4.6")?.id).toBe("4.7");
    expect(getNextQuest("4.7")).toBeUndefined();
  });
});
