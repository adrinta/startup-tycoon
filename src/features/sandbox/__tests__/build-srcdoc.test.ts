import { describe, expect, it } from "vitest";
import { buildSrcdoc } from "@/features/sandbox/build-srcdoc";
import { buildCaptureScript, buildHarnessScript } from "@/features/sandbox/harness";

describe("buildSrcdoc", () => {
  it("fragmen HTML tidak dibungkus doctype buatan agar audit jujur", () => {
    const output = buildSrcdoc({ "index.html": "<h1>Halo Dunia</h1>" }, "nonce-123");
    // Capture script boleh berada di paling awal, tetapi konten pengguna
    // tidak boleh dibungkus struktur (doctype/html) buatan.
    expect(output.trimStart().startsWith("<script>")).toBe(true);
    expect(output).toContain("<h1>Halo Dunia</h1>");
    expect(output).not.toContain("<html");
    expect(output).toContain("nonce-123");
    expect(output).toContain("validation-result");
  });

  it("tidak menduplikasi doctype pada dokumen lengkap milik pengguna", () => {
    const fullDoc = [
      "<!DOCTYPE html>",
      '<html lang="id"><head><title>Project X</title></head>',
      "<body><h1>Isi</h1></body></html>",
    ].join("\n");
    const output = buildSrcdoc({ "index.html": fullDoc }, "nonce-abc");
    // Hanya periksa area dokumen pengguna (sebelum script suntikan),
    // karena script harness memuat literal "<!DOCTYPE" di pesan evaluator.
    const userRegion = output.slice(0, output.indexOf("<script>"));
    const doctypeCount = (userRegion.match(/<!DOCTYPE/gi) ?? []).length;
    expect(doctypeCount).toBe(1);
  });

  it("menyuntikkan style ke dalam head, capture paling awal, dan script ke akhir body", () => {
    const fullDoc =
      '<!DOCTYPE html><html><head><title>X</title></head><body><h1>Y</h1></body></html>';
    const output = buildSrcdoc(
      { "index.html": fullDoc, "style.css": "body { color: red; }", "app.js": "console.log(1)" },
      "n1",
    );
    expect(output.indexOf("<style>")).toBeGreaterThan(-1);
    expect(output.indexOf("<style>")).toBeLessThan(output.indexOf("</head>"));
    expect(output.indexOf("console.log(1)")).toBeLessThan(output.indexOf("</body>"));
    // Harness evaluasi harus dieksekusi paling akhir.
    expect(output.indexOf("validation-result")).toBeLessThan(output.indexOf("</body>"));
    expect(output.indexOf("console.log(1)")).toBeLessThan(output.indexOf("EVALUATE"));
    // Capture (console hook) harus aktif sebelum kode mahasiswa mana pun.
    expect(output.indexOf("__stSend")).toBeGreaterThan(-1);
    expect(output.indexOf("__stSend")).toBeLessThan(output.indexOf("console.log(1)"));
  });

  it("meng-escape </script> di dalam kode pengguna", () => {
    const output = buildSrcdoc(
      {
        "index.html": "<!DOCTYPE html><html><body></body></html>",
        "app.js": 'const s = "</script>";',
      },
      "n2",
    );
    expect(output).toContain("<\\/script>");
  });

  it("tanpa index.html tetap menghasilkan srcdoc yang aman", () => {
    const output = buildSrcdoc({}, "n3");
    expect(output).toContain("Belum ada kode");
    expect(output).toContain("n3");
    expect(output).toContain("validation-result");
  });
});

describe("script capture & harness", () => {
  it("capture script memuat nonce dan hook console", () => {
    const script = buildCaptureScript("xy-nonce");
    expect(script).toContain('"xy-nonce"');
    expect(script).toContain("__stSend");
    expect(script).toContain("unhandledrejection");
  });

  it("harness menyertakan evaluator dan pesan hasil validasi", () => {
    const script = buildHarnessScript("xy-nonce");
    expect(script).toContain("validation-result");
    expect(script).toContain("ready");
    expect(script).toContain("EVALUATE");
  });
});
