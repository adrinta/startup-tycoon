import { buildCaptureScript, buildHarnessScript } from "@/features/sandbox/harness";

export type FileMap = Record<string, string>;

const EDITOR_PLACEHOLDER =
  "<p>Belum ada kode. Tulis HTML-mu di editor, lalu panel ini akan menampilkan hasilnya.</p>";

/**
 * Menyusun dokumen srcdoc untuk iframe sandbox.
 *
 * Urutan eksekusi di dalam frame:
 *   1. <style>  (style.css)
 *   2. script capture  (console + error hook)
 *   3. kode mahasiswa  (app.js)
 *   4. script harness  (evaluasi objektif + kirim "ready")
 */
export function buildSrcdoc(files: FileMap, nonce: string): string {
  const html = files["index.html"] ?? EDITOR_PLACEHOLDER;
  const css = files["style.css"] ?? "";
  const js = files["app.js"] ?? "";

  const captureScript = `<script>\n${buildCaptureScript(nonce)}\n</script>`;
  const userScript = js.trim() !== "" ? `<script>\n${escapeTagCloser(js, "script")}\n</script>` : "";
  const harnessScript = `<script>\n${buildHarnessScript(nonce)}\n</script>`;
  const styleTag = css.trim() !== "" ? `<style>\n${escapeTagCloser(css, "style")}\n</style>` : "";

  const scripts = [captureScript, userScript, harnessScript].filter(Boolean).join("\n");

  /*
   * Fragmen HTML (tanpa <html>) sengaja TIDAK dibungkus doctype/struktur
   * buatan: biarkan parser browser membuat struktur implisit. Dengan begitu
   * audit dokumen (doctype, title di head, dll.) menilai kode pengguna apa
   * adanya dan tidak menghasilkan kelulusan palsu. Dokumen tanpa doctype
   * dirender dalam quirks mode — memang konsekuensi dari kode yang belum
   * lengkap, dan justru mengajarkan pentingnya struktur dokumen.
   */
  if (!/<html[\s>]/i.test(html)) {
    return [styleTag, html, scripts].filter(Boolean).join("\n");
  }

  let output = html;
  if (styleTag !== "") {
    output =
      injectBefore(output, /<\/head>/i, styleTag) ??
      injectBefore(output, /<body[^>]*>/i, styleTag) ??
      styleTag + "\n" + output;
  }
  output = injectBefore(output, /<\/body>/i, scripts) ?? output + "\n" + scripts;
  return output;
}

function injectBefore(source: string, marker: RegExp, content: string): string | null {
  if (content === "") return source;
  const match = marker.exec(source);
  if (!match || match.index === undefined) return null;
  return source.slice(0, match.index) + content + "\n" + source.slice(match.index);
}

/**
 * Mencegah kode mahasiswa "kabur" dari tag script/style-nya sendiri.
 * `</script` di dalam string literal tetap valid setelah di-escape
 * karena `\/` sama dengan `/` di dalam string JavaScript.
 */
function escapeTagCloser(source: string, tag: "script" | "style"): string {
  return source.replace(new RegExp("</" + tag, "gi"), "<\\/" + tag);
}
