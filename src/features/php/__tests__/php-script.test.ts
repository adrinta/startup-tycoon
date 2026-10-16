import { describe, expect, it } from "vitest";
import {
  PHP_DB_MARKER,
  buildScenarioUrl,
  extractDbMarker,
  phpAdminScript,
  phpDbQueryScript,
  toBase64Ascii,
} from "@/features/php/php-script";
import type { PhpScenario } from "@/content/quests/schema";

describe("toBase64Ascii", () => {
  it("mengkodekan teks ASCII dengan benar", () => {
    expect(toBase64Ascii("abc")).toBe("YWJj");
    expect(toBase64Ascii("SELECT 1;")).toBe("U0VMRUNUIDE7");
    expect(toBase64Ascii("ab")).toBe("YWI=");
    expect(toBase64Ascii("a")).toBe("YQ==");
    expect(toBase64Ascii("")).toBe("");
  });

  it("cocok dengan Buffer sebagai referensi", () => {
    const samples = [
      "CREATE TABLE produk (nama TEXT);",
      "INSERT INTO x VALUES ('a', 1);",
      "SELECT * FROM produk WHERE nama = 'Kopi Arabika';",
    ];
    for (const sample of samples) {
      expect(toBase64Ascii(sample)).toBe(Buffer.from(sample, "ascii").toString("base64"));
    }
  });
});

describe("phpAdminScript", () => {
  it("reset database + session dan seed opsional", () => {
    const withoutSeed = phpAdminScript();
    expect(withoutSeed).toContain("@unlink('/tmp/app.sqlite')");
    expect(withoutSeed).toContain("glob(sys_get_temp_dir() . '/sess_*')");
    expect(withoutSeed).toContain("ADMIN_OK");
    expect(withoutSeed).not.toContain("new PDO");

    const withSeed = phpAdminScript("CREATE TABLE t (a);");
    expect(withSeed).toContain("new PDO('sqlite:/tmp/app.sqlite')");
    expect(withSeed).toContain("exec(base64_decode(");
    expect(withSeed).toContain(toBase64Ascii("CREATE TABLE t (a);"));
  });
});

describe("phpDbQueryScript & marker", () => {
  it("query dibungkus marker dan menghasilkan JSON rows", () => {
    const script = phpDbQueryScript("SELECT nama FROM produk");
    expect(script).toContain(PHP_DB_MARKER);
    expect(script).toContain("fetchAll(PDO::FETCH_ASSOC)");
    expect(script).toContain("json_encode");
  });

  it("extractDbMarker memisahkan output tampilan dan JSON DB", () => {
    const text = `<h1>Halo</h1>\n${PHP_DB_MARKER}[{"nama":"Teh Botol"}]${PHP_DB_MARKER}`;
    const { display, dbJson } = extractDbMarker(text);
    expect(display).toContain("<h1>Halo</h1>");
    expect(display).not.toContain(PHP_DB_MARKER);
    expect(dbJson).toBe('[{"nama":"Teh Botol"}]');
  });

  it("tanpa marker menghasilkan dbJson null", () => {
    const { display, dbJson } = extractDbMarker("<p>x</p>");
    expect(display).toBe("<p>x</p>");
    expect(dbJson).toBeNull();
  });
});

describe("buildScenarioUrl", () => {
  const base: PhpScenario = { id: "s", method: "GET" };

  it("default ke index.php", () => {
    expect(buildScenarioUrl(base)).toBe("index.php");
  });

  it("menggabungkan query params GET", () => {
    expect(buildScenarioUrl({ ...base, get: { action: "produk", page: "1" } })).toBe(
      "index.php?action=produk&page=1",
    );
  });

  it("menghargai url khusus", () => {
    expect(buildScenarioUrl({ ...base, url: "api.php", get: { q: "x" } })).toBe("api.php?q=x");
  });
});
