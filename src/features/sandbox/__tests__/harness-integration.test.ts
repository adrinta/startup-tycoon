import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { getQuestById } from "@/content/quests";
import type { Objective } from "@/content/quests/schema";
import { QUEST_SOLUTIONS } from "@/content/quests/__fixtures__/solutions";
import { buildSrcdoc } from "@/features/sandbox/build-srcdoc";
import type { ObjectiveResult } from "@/features/validation/types";

/**
 * Test integrasi pipeline sandbox: menjalankan srcdoc hasil buildSrcdoc
 * di JSDOM (script capture + kode mahasiswa + harness evaluasi), lalu
 * mengirim pesan "validate" persis seperti parent di aplikasi dan
 * menunggu balasan "validation-result".
 */
function runSandboxValidation(
  srcdoc: string,
  objectives: Objective[],
): Promise<ObjectiveResult[]> {
  const dom = new JSDOM(srcdoc, { runScripts: "dangerously" });

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("validation-result tidak diterima")), 3000);

    dom.window.addEventListener("message", (event) => {
      const data = event.data as {
        __st?: boolean;
        type?: string;
        results?: ObjectiveResult[];
      };
      if (!data || data.__st !== true) return;

      if (data.type === "ready") {
        dom.window.dispatchEvent(
          new dom.window.MessageEvent("message", {
            data: { type: "validate", requestId: "req-1", objectives },
          }),
        );
      }

      if (data.type === "validation-result") {
        clearTimeout(timer);
        resolve(data.results ?? []);
      }
    });
  });
}

describe("pipeline sandbox end-to-end (jsdom)", () => {
  it("solusi quest 1.1 lolos semua objective melalui harness nyata", async () => {
    const quest = getQuestById("1.1");
    expect(quest).toBeTruthy();
    if (!quest) return;

    const srcdoc = buildSrcdoc(QUEST_SOLUTIONS["1.1"], "nonce-e2e");
    const results = await runSandboxValidation(srcdoc, quest.objectives);

    const failed = results.filter((result) => !result.passed);
    expect(failed.map((result) => result.id)).toEqual([]);
  });

  it("starter kosong gagal dan tetap mengembalikan hasil per objective", async () => {
    const quest = getQuestById("1.1");
    expect(quest).toBeTruthy();
    if (!quest) return;

    const srcdoc = buildSrcdoc({ "index.html": "<p>belum ada apa-apa</p>" }, "nonce-e2e2");
    const results = await runSandboxValidation(srcdoc, quest.objectives);

    expect(results).toHaveLength(quest.objectives.length);
    expect(results.some((result) => !result.passed)).toBe(true);
    const doctype = results.find((result) => result.id === "doctype");
    expect(doctype?.passed).toBe(false);
    expect(doctype?.detail).toBeTruthy();
  });

  it("kode mahasiswa yang error tidak mematikan harness", async () => {
    const quest = getQuestById("1.1");
    expect(quest).toBeTruthy();
    if (!quest) return;

    const srcdoc = buildSrcdoc(
      {
        ...QUEST_SOLUTIONS["1.1"],
        "app.js": "throw new Error('boom dari kode mahasiswa');",
      },
      "nonce-e2e3",
    );
    const results = await runSandboxValidation(srcdoc, quest.objectives);

    // Error kode mahasiswa tidak boleh menggagalkan evaluasi struktur.
    const failed = results.filter((result) => !result.passed);
    expect(failed.map((result) => result.id)).toEqual([]);
  });

  it("console.log dari <script> inline milik mahasiswa ikut tertangkap", async () => {
    const html = [
      "<!DOCTYPE html>",
      '<html lang="id"><head><title>Project X</title></head>',
      "<body><h1>Project X</h1>",
      "<script>console.log('halo dari inline');</script>",
      "</body></html>",
    ].join("\n");

    const srcdoc = buildSrcdoc({ "index.html": html }, "nonce-console");
    const dom = new JSDOM(srcdoc, { runScripts: "dangerously" });

    const texts = await new Promise<string[]>((resolve) => {
      const collected: string[] = [];
      dom.window.addEventListener("message", (event) => {
        const data = event.data as { __st?: boolean; type?: string; text?: string };
        if (!data || data.__st !== true) return;
        if (data.type === "console" && typeof data.text === "string") {
          collected.push(data.text);
        }
      });
      // postMessage bersifat async: beri kesempatan event loop menyelesaikan.
      setTimeout(() => resolve(collected), 300);
    });

    expect(texts.some((text) => text.includes("halo dari inline"))).toBe(true);
  });
});
