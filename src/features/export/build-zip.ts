import type { Quest, QuestFileMap } from "@/content/quests/schema";

export interface PortfolioStats {
  revenue: number;
  activeUsers: number;
  level: number;
  ownedItemIds: string[];
}

export interface PortfolioInput {
  quests: Quest[];
  completedQuestIds: string[];
  drafts: Record<string, QuestFileMap>;
  stats: PortfolioStats;
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Menyusun seluruh berkas portofolio (murni & dapat diuji):
 * satu folder per misi yang telah diselesaikan + README proyek.
 */
export function buildPortfolioFiles(input: PortfolioInput): Record<string, string> {
  const { quests, completedQuestIds, drafts, stats } = input;
  const files: Record<string, string> = {};

  const completed = quests.filter((quest) => completedQuestIds.includes(quest.id));

  for (const quest of completed) {
    const folder = `${quest.id}-${slugifyTitle(quest.title)}`;
    const questFiles = { ...quest.starterFiles, ...(drafts[quest.id] ?? {}) };
    for (const [name, content] of Object.entries(questFiles)) {
      files[`${folder}/${name}`] = content;
    }
  }

  const lines = [
    "# Project X — Portofolio Startup Tycoon",
    "",
    `Dibuat dari gim **Startup Tycoon** pada ${new Date().toISOString().slice(0, 10)}.`,
    "",
    "## Statistik Perusahaan",
    "",
    `- Revenue: Rp ${stats.revenue.toLocaleString("id-ID")}`,
    `- Active Users (XP): ${stats.activeUsers.toLocaleString("id-ID")}`,
    `- Level: ${stats.level}`,
    `- Misi selesai: ${completed.length} dari ${quests.length}`,
    "",
    "## Daftar Misi",
    "",
  ];

  for (const quest of completed) {
    lines.push(`- [${quest.id}] ${quest.title} — ${quest.chapter}`);
  }

  if (stats.ownedItemIds.length > 0) {
    lines.push("", "## Dekorasi Kantor yang Dimiliki", "");
    for (const item of stats.ownedItemIds) {
      lines.push(`- ${item}`);
    }
  }

  lines.push(
    "",
    "## Cara Menjalankan",
    "",
    "Berkas HTML dapat dibuka langsung di browser. Untuk misi PHP (folder `4.x`),",
    "letakkan `index.php` pada server PHP apa pun (mis. `php -S localhost:8000`).",
    "Berkas `style.css`/`app.js` di setiap folder dipakai oleh halaman di folder yang sama.",
    "",
  );

  files["README.md"] = lines.join("\n");
  return files;
}

/** Mengunduh berkas portofolio sebagai arsip .zip (dilakukan di sisi klien). */
export async function downloadPortfolioZip(
  files: Record<string, string>,
  filename: string,
): Promise<void> {
  const [{ default: JSZip }, { saveAs }] = await Promise.all([
    import("jszip"),
    import("file-saver"),
  ]);
  const zip = new JSZip();
  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, filename);
}
