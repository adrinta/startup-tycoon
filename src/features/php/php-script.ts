import type { PhpScenario } from "@/content/quests/schema";

/**
 * Helper murni untuk menjalankan skenario PHP di PHP-WASM:
 *  - reset basis data + session (admin script)
 *  - inspeksi isi database via marker tersembunyi di output
 *  - penyusunan URL request (documentRoot virtual "/app")
 * Semua nilai pengguna dimasukkan lewat base64 agar bebas masalah escaping.
 */

export const PHP_DOCUMENT_ROOT = "/app";
export const PHP_DB_MARKER = "__STDB__";

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Base64 untuk teks ASCII (cukup untuk SQL & query misi; tanpa Buffer/btoa). */
export function toBase64Ascii(input: string): string {
  let output = "";
  for (let i = 0; i < input.length; i += 3) {
    const c1 = input.charCodeAt(i);
    const c2 = i + 1 < input.length ? input.charCodeAt(i + 1) : NaN;
    const c3 = i + 2 < input.length ? input.charCodeAt(i + 2) : NaN;
    const byte1 = c1 >> 2;
    const byte2 = ((c1 & 3) << 4) | (Number.isNaN(c2) ? 0 : c2 >> 4);
    const byte3 = Number.isNaN(c2) ? 64 : ((c2 & 15) << 2) | (Number.isNaN(c3) ? 0 : c3 >> 6);
    const byte4 = Number.isNaN(c3) ? 64 : c3 & 63;
    output += BASE64_CHARS.charAt(byte1);
    output += BASE64_CHARS.charAt(byte2);
    output += byte3 === 64 ? "=" : BASE64_CHARS.charAt(byte3);
    output += byte4 === 64 ? "=" : BASE64_CHARS.charAt(byte4);
  }
  return output;
}

/** Script admin: hapus database & session, lalu seed SQL (opsional). */
export function phpAdminScript(seedSql?: string): string {
  const lines = [
    "<?php",
    "@unlink('/tmp/app.sqlite');",
    "foreach (glob(sys_get_temp_dir() . '/sess_*') as $file) { @unlink($file); }",
  ];
  if (seedSql !== undefined && seedSql !== "") {
    lines.push(`$__pdo = new PDO('sqlite:/tmp/app.sqlite');`);
    lines.push(`$__pdo->exec(base64_decode('${toBase64Ascii(seedSql)}'));`);
    lines.push("$__pdo = null;");
  }
  lines.push("echo 'ADMIN_OK';");
  return lines.join("\n");
}

/** Script inspeksi database: tulis hasil query sebagai marker di output. */
export function phpDbQueryScript(query: string): string {
  return [
    "<?php",
    "try {",
    "  $__pdo = new PDO('sqlite:/tmp/app.sqlite');",
    `  $__rows = $__pdo->query(base64_decode('${toBase64Ascii(query)}'))->fetchAll(PDO::FETCH_ASSOC);`,
    `  echo '${PHP_DB_MARKER}' . json_encode($__rows) . '${PHP_DB_MARKER}';`,
    "} catch (Throwable $__e) {",
    `  echo '${PHP_DB_MARKER}[]${PHP_DB_MARKER}';`,
    "}",
  ].join("\n");
}

/** Memisahkan marker DB dari output tampilan. */
export function extractDbMarker(text: string): { display: string; dbJson: string | null } {
  const pattern = new RegExp(PHP_DB_MARKER + "([\\s\\S]*?)" + PHP_DB_MARKER, "m");
  const match = text.match(pattern);
  if (!match) return { display: text, dbJson: null };
  const display = text.replace(match[0], "");
  return { display, dbJson: match[1] };
}

/** URL request relatif documentRoot, termasuk query params GET. */
export function buildScenarioUrl(scenario: PhpScenario): string {
  const base = scenario.url ?? "index.php";
  const params = new URLSearchParams(scenario.get ?? {}).toString();
  return params === "" ? base : `${base}?${params}`;
}
