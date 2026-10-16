"use client";

import type { PhpScenario } from "@/content/quests/schema";
import {
  PHP_DOCUMENT_ROOT,
  buildScenarioUrl,
  extractDbMarker,
  phpAdminScript,
  phpDbQueryScript,
} from "@/features/php/php-script";
import type { PhpScenarioOutput } from "@/features/php/php-evaluate";

/**
 * Mesin PHP-WASM (browser). Runtime berjalan di Web Worker internal paket;
 * dimuat sekali (lazy) saat pemain pertama kali membuka misi Babak 4.
 *
 * Webpack/alias: hanya build PHP 8.3 yang ikut ter-bundle (lihat resolveAlias
 * di next.config.ts) — versi PHP lain dialihkan ke paket 8.3.
 */

export interface PhpRequestOptions {
  method: "GET" | "POST";
  url: string;
  post?: Record<string, string>;
}

export interface PhpEngine {
  /** Menulis berkas ke filesystem virtual (mis. /app/index.php). */
  writeFiles(files: Record<string, string>): void;
  /** Menjalankan satu request HTTP-like ke documentRoot. */
  request(options: PhpRequestOptions): Promise<PhpScenarioOutput>;
  /** Reset database & session + seed, lalu mengganti cookie jar. */
  reset(seedSql?: string): Promise<void>;
  /** Jalankan semua skenario quest & kumpulkan outputnya. */
  runScenarios(files: Record<string, string>, scenarios: PhpScenario[]): Promise<PhpScenarioOutput[]>;
}

let enginePromise: Promise<PhpEngine> | null = null;

export function getPhpEngine(): Promise<PhpEngine> {
  if (!enginePromise) {
    enginePromise = boot().catch((error) => {
      // Izinkan percobaan ulang setelah gagal (mis. jaringan putus).
      enginePromise = null;
      throw error;
    });
  }
  return enginePromise;
}

async function boot(): Promise<PhpEngine> {
  const { PHP, PHPRequestHandler } = await import("@php-wasm/universal");
  const { loadWebRuntime } = await import("@php-wasm/web");

  const runtimeId = await loadWebRuntime("8.3");
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

  async function performRequest(options: PhpRequestOptions): Promise<PhpScenarioOutput> {
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

  const engine: PhpEngine = {
    writeFiles(files) {
      for (const [name, contents] of Object.entries(files)) {
        php.writeFile(`${PHP_DOCUMENT_ROOT}/${name}`, contents);
      }
    },

    async request(options) {
      return performRequest(options);
    },

    async reset(seedSql) {
      php.writeFile(`${PHP_DOCUMENT_ROOT}/__admin.php`, phpAdminScript(seedSql));
      await handler.request({ method: "GET", url: "__admin.php" });
      php.writeFile(`${PHP_DOCUMENT_ROOT}/__admin.php`, "<?php");
      // Cookie jar baru (session sebelumnya tidak berlaku).
      handler = new PHPRequestHandler({
        phpFactory: async () => php,
        documentRoot: PHP_DOCUMENT_ROOT,
      });
    },

    async runScenarios(files, scenarios) {
      engine.writeFiles(files);
      php.writeFile(`${PHP_DOCUMENT_ROOT}/__dbq.php`, "<?php");
      const outputs: PhpScenarioOutput[] = [];

      for (const scenario of scenarios) {
        if (scenario.reset) {
          await engine.reset(scenario.seedSql);
        }

        let dbJson: string | null = null;
        if (scenario.dbQuery !== undefined) {
          php.writeFile(`${PHP_DOCUMENT_ROOT}/__dbq.php`, phpDbQueryScript(scenario.dbQuery));
        }

        const result = await performRequest({
          method: scenario.method,
          url: buildScenarioUrl(scenario),
          post: scenario.post,
        });

        if (scenario.dbQuery !== undefined) {
          const dbResult = await performRequest({ method: "GET", url: "__dbq.php" });
          dbJson = dbResult.dbJson;
        }

        outputs.push({ ...result, id: scenario.id, dbJson });
      }

      return outputs;
    },
  };

  return engine;
}
