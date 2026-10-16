import { describe, expect, it } from "vitest";
import { getQuestsByPhase } from "@/content/quests";
import { PHP_QUEST_SOLUTIONS } from "@/content/quests/__fixtures__/php-solutions";
import type { PhpScenario } from "@/content/quests/schema";
import { evaluatePhpObjectives, type PhpScenarioOutput } from "@/features/php/php-evaluate";
import {
  PHP_DOCUMENT_ROOT,
  buildScenarioUrl,
  extractDbMarker,
  phpAdminScript,
  phpDbQueryScript,
} from "@/features/php/php-script";

/**
 * Uji integrasi MESIN PHP-WASM sungguhan (node runtime).
 * Berat (memuat wasm + filesystem), jadi hanya berjalan bila diaktifkan:
 *
 *   RUN_PHP_ENGINE_TESTS=1 pnpm test
 */

const RUN = process.env.RUN_PHP_ENGINE_TESTS === "1";

interface NodeEngine {
  runScenarios(files: Record<string, string>, scenarios: PhpScenario[]): Promise<PhpScenarioOutput[]>;
}

let enginePromise: Promise<NodeEngine> | null = null;

async function getEngine(): Promise<NodeEngine> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const { loadNodeRuntime } = await import("@php-wasm/node");
      const { PHP, PHPRequestHandler } = await import("@php-wasm/universal");

      const runtimeId = await loadNodeRuntime("8.3", {
        emscriptenOptions: { processId: 7 },
      });
      const php = new PHP(runtimeId);
      try {
        php.mkdir(PHP_DOCUMENT_ROOT);
      } catch {
        // sudah ada
      }

      let handler = new PHPRequestHandler({
        phpFactory: async () => php,
        documentRoot: PHP_DOCUMENT_ROOT,
      });

      async function request(options: {
        method: "GET" | "POST";
        url: string;
        post?: Record<string, string>;
      }): Promise<PhpScenarioOutput> {
        const response = await handler.request({
          method: options.method,
          url: options.url,
          body: options.method === "POST" ? (options.post ?? {}) : undefined,
        });
        const { display, dbJson } = extractDbMarker(response.text);
        return {
          id: "",
          text: display,
          errors: response.errors,
          exitCode: response.exitCode,
          dbJson,
        };
      }

      return {
        async runScenarios(files, scenarios) {
          for (const [name, contents] of Object.entries(files)) {
            php.writeFile(`${PHP_DOCUMENT_ROOT}/${name}`, contents);
          }
          php.writeFile(`${PHP_DOCUMENT_ROOT}/__dbq.php`, "<?php");

          const outputs: PhpScenarioOutput[] = [];
          for (const scenario of scenarios) {
            if (scenario.reset) {
              php.writeFile(`${PHP_DOCUMENT_ROOT}/__admin.php`, phpAdminScript(scenario.seedSql));
              await handler.request({ method: "GET", url: "__admin.php" });
              handler = new PHPRequestHandler({
                phpFactory: async () => php,
                documentRoot: PHP_DOCUMENT_ROOT,
              });
            }

            let dbJson: string | null = null;
            if (scenario.dbQuery !== undefined) {
              php.writeFile(`${PHP_DOCUMENT_ROOT}/__dbq.php`, phpDbQueryScript(scenario.dbQuery));
            }

            const result = await request({
              method: scenario.method,
              url: buildScenarioUrl(scenario),
              post: scenario.post,
            });

            if (scenario.dbQuery !== undefined) {
              const dbResult = await request({ method: "GET", url: "__dbq.php" });
              dbJson = dbResult.dbJson;
            }

            outputs.push({ ...result, id: scenario.id, dbJson });
          }
          return outputs;
        },
      };
    })();
  }
  return enginePromise;
}

describe.skipIf(!RUN)("mesin PHP-WASM (integrasi)", () => {
  for (const quest of getQuestsByPhase(4)) {
    it(
      `quest ${quest.id} — solusi kanonik lulus semua objektif`,
      async () => {
        const engine = await getEngine();
        const outputs = await engine.runScenarios(
          PHP_QUEST_SOLUTIONS[quest.id],
          quest.phpScenarios ?? [],
        );
        const results = evaluatePhpObjectives(quest.objectives, outputs);
        const failed = results
          .filter((result) => !result.passed)
          .map((result) => `${result.id} (${result.detail ?? "tanpa detail"})`);
        expect(failed, `gagal: ${failed.join(" · ")}`).toEqual([]);
      },
      60000,
    );

    it(
      `quest ${quest.id} — starter belum menyelesaikan misi`,
      async () => {
        const engine = await getEngine();
        const outputs = await engine.runScenarios(
          quest.starterFiles,
          quest.phpScenarios ?? [],
        );
        const results = evaluatePhpObjectives(quest.objectives, outputs);
        expect(results.some((result) => !result.passed)).toBe(true);
      },
      60000,
    );
  }
});
