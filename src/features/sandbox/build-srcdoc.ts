import {
  buildCaptureScript,
  buildHarnessScript,
  buildMockFetchScript,
  type MockApiDefinition,
} from "@/features/sandbox/harness";

export type FileMap = Record<string, string>;

export interface BuildSrcdocOptions {
  /** Endpoint API tiruan yang dipasang ke window.fetch sebelum kode mahasiswa. */
  mocks?: MockApiDefinition[];
}

const EDITOR_PLACEHOLDER =
  "<p>Belum ada kode. Tulis HTML-mu di editor, lalu panel ini akan menampilkan hasilnya.</p>";

/**
 * Menyusun dokumen srcdoc untuk iframe sandbox.
 *
 * Urutan eksekusi di dalam frame:
 *   1. script capture  (console + error hook) — PALING AWAL, dieksekusi
 *      sebelum kode mahasiswa mana pun sehingga console.log dari tag
 *      <script> inline milik mahasiswa juga tertangkap.
 *   2. <style>  (style.css)
 *   3. kode mahasiswa  (index.html + app.js)
 *   4. script harness  (evaluasi objektif + kirim "ready")
 */
export function buildSrcdoc(
  files: FileMap,
  nonce: string,
  options: BuildSrcdocOptions = {},
): string {
  const html = files["index.html"] ?? EDITOR_PLACEHOLDER;
  const css = files["style.css"] ?? "";
  const js = files["app.js"] ?? "";

  const captureScript = `<script>\n${buildCaptureScript(nonce)}\n</script>`;
  const mockScript =
    options.mocks && options.mocks.length > 0
      ? `<script>\n${buildMockFetchScript(options.mocks)}\n</script>`
      : "";
  const userScript = js.trim() !== "" ? `<script>\n${escapeTagCloser(js, "script")}\n</script>` : "";
  const harnessScript = `<script>\n${buildHarnessScript(nonce)}\n</script>`;
  const styleTag = css.trim() !== "" ? `<style>\n${escapeTagCloser(css, "style")}\n</style>` : "";

  const tailScripts = [mockScript, userScript, harnessScript].filter(Boolean).join("\n");

  /*
   * Fragmen HTML (tanpa <html>) sengaja TIDAK dibungkus doctype/struktur
   * buatan: biarkan parser browser membuat struktur implisit. Dengan begitu
   * audit dokumen (doctype, title di head, dll.) menilai kode pengguna apa
   * adanya dan tidak menghasilkan kelulusan palsu. Dokumen tanpa doctype
   * dirender dalam quirks mode — memang konsekuensi dari kode yang belum
   * lengkap, dan justru mengajarkan pentingnya struktur dokumen.
   */
  if (!/<html[\s>]/i.test(html)) {
    return [captureScript, styleTag, html, tailScripts].filter(Boolean).join("\n");
  }

  let output = html;

  // Capture harus berjalan paling awal: setelah <head> bila ada, jika tidak
  // setelah <!DOCTYPE>, dan sebagai upaya terakhir di paling atas dokumen.
  output =
    injectAfter(output, /<head[^>]*>/i, captureScript) ??
    injectAfter(output, /<!DOCTYPE[^>]*>/i, captureScript) ??
    captureScript + "\n" + output;

  if (styleTag !== "") {
    output =
      injectBefore(output, /<\/head>/i, styleTag) ??
      injectBefore(output, /<body[^>]*>/i, styleTag) ??
      styleTag + "\n" + output;
  }
  output = injectBefore(output, /<\/body>/i, tailScripts) ?? output + "\n" + tailScripts;
  return output;
}

function injectBefore(source: string, marker: RegExp, content: string): string | null {
  if (content === "") return source;
  const match = marker.exec(source);
  if (!match || match.index === undefined) return null;
  return source.slice(0, match.index) + content + "\n" + source.slice(match.index);
}

function injectAfter(source: string, marker: RegExp, content: string): string | null {
  if (content === "") return source;
  const match = marker.exec(source);
  if (!match || match.index === undefined) return null;
  const end = match.index + match[0].length;
  return source.slice(0, end) + "\n" + content + source.slice(end);
}

/**
 * Mencegah kode mahasiswa "kabur" dari tag script/style-nya sendiri.
 * `</script` di dalam string literal tetap valid setelah di-escape
 * karena `\/` sama dengan `/` di dalam string JavaScript.
 */
function escapeTagCloser(source: string, tag: "script" | "style"): string {
  return source.replace(new RegExp("</" + tag, "gi"), "<\\/" + tag);
}
