import type { Objective, ObjectiveResult, Rule } from "@/features/validation/types";

/**
 * PENTING — Aturan penulisan fungsi-fungsi di file ini:
 *
 * `evaluateObjectives` dan `createXrayRuntime` DIEKSEKUSI di dalam sandbox
 * iframe dengan cara `.toString()` disuntikkan sebagai script ke srcdoc.
 * Karena itu:
 *  - Hanya boleh mereferensikan parameternya sendiri dan API global browser.
 *  - Ditulis dengan gaya konservatif (var, function, loop indeks) agar
 *    aman dari transformasi/helper yang bisa di-hoist oleh minifier.
 *  - Versi yang sama dipakai unit test (jsdom) sehingga perilaku di sandbox
 *    dan di test identik.
 */
export function evaluateObjectives(doc: Document, objectives: Objective[]): ObjectiveResult[] {
  function getElements(selector: string): Element[] {
    const list = doc.querySelectorAll(selector);
    const out: Element[] = [];
    for (let i = 0; i < list.length; i += 1) out.push(list[i]);
    return out;
  }

  function normalize(value: string): string {
    return String(value === null || value === undefined ? "" : value)
      .replace(/\s+/g, " ")
      .trim();
  }

  function matchesValue(
    actual: string,
    checks: { equals?: string; contains?: string; ci?: boolean },
  ): boolean {
    const insensitive = checks.ci !== false;
    const haystack = insensitive ? actual.toLowerCase() : actual;
    if (checks.equals !== undefined) {
      const needle = insensitive ? String(checks.equals).toLowerCase() : String(checks.equals);
      if (haystack !== needle) return false;
    }
    if (checks.contains !== undefined) {
      const needle = insensitive ? String(checks.contains).toLowerCase() : String(checks.contains);
      if (haystack.indexOf(needle) === -1) return false;
    }
    return true;
  }

  /** #abc / #aabbcc -> rgb(r,g,b) tanpa spasi; format rgb() dinormalkan sama. */
  function normalizeCssValue(value: string): string {
    const raw = String(value === null || value === undefined ? "" : value).trim().toLowerCase();
    if (raw === "") return "";
    const shortHex = raw.match(/^#([0-9a-f]{3})$/);
    const longHex = raw.match(/^#([0-9a-f]{6})$/);
    if (shortHex !== null) {
      const h = shortHex[1];
      const r = parseInt(h.charAt(0) + h.charAt(0), 16);
      const g = parseInt(h.charAt(1) + h.charAt(1), 16);
      const b = parseInt(h.charAt(2) + h.charAt(2), 16);
      return "rgb(" + r + "," + g + "," + b + ")";
    }
    if (longHex !== null) {
      const h = longHex[1];
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return "rgb(" + r + "," + g + "," + b + ")";
    }
    if (raw.indexOf("rgb") === 0) {
      return raw.replace(/\s+/g, "");
    }
    // Durasi: 300ms <-> 0.3s
    const ms = raw.match(/^([0-9]*\.?[0-9]+)ms$/);
    if (ms !== null) {
      return String(parseFloat(ms[1]) / 1000) + "s";
    }
    const seconds = raw.match(/^([0-9]*\.?[0-9]+)s$/);
    if (seconds !== null) {
      return String(parseFloat(seconds[1])) + "s";
    }
    return raw;
  }

  /**
   * Membaca nilai computed; bila longhand masih bernilai default
   * (mis. jsdom tidak mengekspansi shorthand `gap`/`transition`),
   * jatuh ke properti shorthand terkait. Browser modern selalu
   * mengekspansi shorthand, sehingga fallback ini netral di sana.
   */
  function readComputedValue(
    computed: CSSStyleDeclaration,
    property: string,
  ): string {
    const direct = computed.getPropertyValue(property);
    const directString = direct === null || direct === undefined ? "" : String(direct).trim();
    const defaultValues: Record<string, string> = {
      "column-gap": "normal",
      "row-gap": "normal",
      "transition-duration": "0s",
    };
    const defaultValue = defaultValues[property];
    const lookLikeDefault =
      directString === "" ||
      (defaultValue !== undefined && directString === defaultValue);
    if (!lookLikeDefault) return directString;

    if (property === "column-gap" || property === "row-gap") {
      const gap = computed.getPropertyValue("gap");
      if (gap !== null && gap !== undefined && String(gap).trim() !== "") {
        const parts = String(gap).trim().split(/\s+/);
        if (parts.length >= 2) return property === "row-gap" ? parts[0] : parts[1];
        return parts[0];
      }
    }
    if (property === "transition-duration") {
      const shorthand = computed.getPropertyValue("transition");
      if (shorthand !== null && shorthand !== undefined && String(shorthand).trim() !== "") {
        const durations = String(shorthand).match(/[0-9]*\.?[0-9]+m?s/g);
        if (durations !== null && durations.length > 0) return durations[0];
      }
    }
    return directString;
  }

  /**
   * Menghitung jumlah track dari nilai computed seperti
   * "repeat(3,1fr)" (jsdom) atau "158px 158px 158px" (browser).
   */
  function countTracks(value: string): number {
    const raw = String(value === null || value === undefined ? "" : value).trim();
    if (raw === "" || raw.toLowerCase() === "none") return 0;
    const repeatMatch = raw.match(/repeat\(\s*(\d+)/i);
    if (repeatMatch !== null) return parseInt(repeatMatch[1], 10);
    const stripped = raw.replace(/\([^)]*\)/g, " ");
    const parts = stripped.split(/\s+/);
    let count = 0;
    for (let i = 0; i < parts.length; i += 1) {
      if (parts[i] !== "") count += 1;
    }
    return count;
  }

  function evaluateOne(rule: Rule): { passed: boolean; detail?: string } {
    try {
      if (rule.kind === "doctype") {
        const dt = doc.doctype;
        if (dt !== null && dt !== undefined && String(dt.name).toLowerCase() === "html") {
          return { passed: true };
        }
        return { passed: false, detail: "Deklarasi <!DOCTYPE html> belum ada di awal dokumen." };
      }

      if (rule.kind === "dom") {
        const count = getElements(rule.selector).length;
        const min = rule.min === undefined ? 1 : rule.min;
        const max = rule.max === undefined ? Number.POSITIVE_INFINITY : rule.max;
        if (count < min) {
          return {
            passed: false,
            detail: 'Ada ' + count + ' elemen "' + rule.selector + '", dibutuhkan minimal ' + min + ".",
          };
        }
        if (count > max) {
          return {
            passed: false,
            detail: 'Ada ' + count + ' elemen "' + rule.selector + '", maksimal ' + max + ".",
          };
        }
        return { passed: true };
      }

      if (rule.kind === "attr") {
        const elements = getElements(rule.selector);
        if (elements.length === 0) {
          return {
            passed: false,
            detail: 'Belum ada elemen "' + rule.selector + '" untuk diperiksa.',
          };
        }
        const needValue = rule.equals !== undefined || rule.contains !== undefined;
        const wantNonEmpty = rule.nonEmpty === undefined ? !needValue : rule.nonEmpty;
        let okCount = 0;
        let lastProblem = "";
        for (let i = 0; i < elements.length; i += 1) {
          const element = elements[i];
          const raw = element.getAttribute(rule.attr);
          let problem = "";
          if (raw === null) {
            problem = 'atribut "' + rule.attr + '" belum ada';
          } else {
            const value = String(raw);
            if (wantNonEmpty && normalize(value) === "") {
              problem = 'atribut "' + rule.attr + '" masih kosong';
            } else if (needValue && !matchesValue(value, rule)) {
              problem = 'nilai atribut "' + rule.attr + '" belum sesuai (saat ini: "' + value + '")';
            }
          }
          if (problem === "") {
            okCount += 1;
          } else {
            lastProblem = problem;
          }
        }
        const mode = rule.mode === "all" ? "all" : "some";
        if (mode === "all" ? okCount === elements.length : okCount > 0) {
          return { passed: true };
        }
        return {
          passed: false,
          detail: 'Elemen "' + rule.selector + '": ' + (lastProblem || "belum memenuhi syarat"),
        };
      }

      if (rule.kind === "text") {
        const elements = getElements(rule.selector);
        if (elements.length === 0) {
          return { passed: false, detail: 'Belum ada elemen "' + rule.selector + '".' };
        }
        let okCount = 0;
        for (let i = 0; i < elements.length; i += 1) {
          const content = normalize(elements[i].textContent === null ? "" : elements[i].textContent);
          if (matchesValue(content, rule)) okCount += 1;
        }
        const mode = rule.mode === "all" ? "all" : "some";
        if (mode === "all" ? okCount === elements.length : okCount > 0) {
          return { passed: true };
        }
        return {
          passed: false,
          detail: 'Teks di elemen "' + rule.selector + '" belum memuat kata yang diminta.',
        };
      }

      if (rule.kind === "childOf") {
        const elements = getElements(rule.selector);
        if (elements.length === 0) {
          return { passed: false, detail: 'Belum ada elemen "' + rule.selector + '".' };
        }
        for (let i = 0; i < elements.length; i += 1) {
          let node: Element | null = elements[i].parentElement;
          while (node !== null) {
            if (node.matches(rule.ancestor)) return { passed: true };
            node = node.parentElement;
          }
        }
        return {
          passed: false,
          detail: 'Elemen "' + rule.selector + '" belum berada di dalam "' + rule.ancestor + '".',
        };
      }

      if (rule.kind === "order") {
        const firstElements = getElements(rule.first);
        const thenElements = getElements(rule.then);
        if (firstElements.length === 0) {
          return { passed: false, detail: 'Belum ada elemen "' + rule.first + '".' };
        }
        if (thenElements.length === 0) {
          return { passed: false, detail: 'Belum ada elemen "' + rule.then + '".' };
        }
        // 4 = Node.DOCUMENT_POSITION_FOLLOWING (dikonstankan agar aman di jsdom/worker).
        const position = firstElements[0].compareDocumentPosition(thenElements[0]);
        if ((position & 4) !== 0) return { passed: true };
        return {
          passed: false,
          detail: 'Urutan salah: "' + rule.first + '" harus muncul sebelum "' + rule.then + '".',
        };
      }

      if (rule.kind === "computed") {
        const view = doc.defaultView;
        if (view === null || view === undefined || view.getComputedStyle === undefined) {
          return { passed: false, detail: "Pemeriksaan gaya tidak tersedia di lingkungan ini." };
        }
        const elements = getElements(rule.selector);
        if (elements.length === 0) {
          return {
            passed: false,
            detail: 'Belum ada elemen "' + rule.selector + '" untuk diperiksa gayanya.',
          };
        }
        const mode = rule.mode === "some" ? "some" : "all";
        let okCount = 0;
        let problem = "";
        for (let i = 0; i < elements.length; i += 1) {
          const computed = view.getComputedStyle(elements[i]);
          const actual = readComputedValue(computed, rule.property);
          if (rule.expectedCount !== undefined) {
            const count = countTracks(actual);
            if (count !== rule.expectedCount) {
              problem =
                'properti "' +
                rule.property +
                '" terdeteksi ' +
                count +
                ", diharapkan " +
                rule.expectedCount;
            }
          } else if (rule.expectedContains !== undefined) {
            if (actual.toLowerCase().indexOf(String(rule.expectedContains).toLowerCase()) === -1) {
              problem =
                'properti "' + rule.property + '" saat ini "' + (actual || "(kosong)") + '"';
            }
          } else if (rule.expected !== undefined) {
            if (normalizeCssValue(actual) !== normalizeCssValue(rule.expected)) {
              problem =
                'properti "' + rule.property + '" saat ini "' + (actual || "(kosong)") + '"';
            }
          } else {
            problem = 'aturan "computed" tidak lengkap';
          }
          if (problem === "") okCount += 1;
        }
        if (mode === "all" ? okCount === elements.length : okCount > 0) {
          return { passed: true };
        }
        return { passed: false, detail: 'Elemen "' + rule.selector + '" → ' + problem };
      }

      if (rule.kind === "allOf") {
        for (let i = 0; i < rule.rules.length; i += 1) {
          const sub = evaluateOne(rule.rules[i]);
          if (!sub.passed) return sub;
        }
        return { passed: true };
      }

      return { passed: false, detail: "Aturan validasi tidak dikenali." };
    } catch (error) {
      return {
        passed: false,
        detail: "Pemeriksaan gagal: " + (error instanceof Error ? error.message : String(error)),
      };
    }
  }

  const results: ObjectiveResult[] = [];
  for (let i = 0; i < objectives.length; i += 1) {
    const objective = objectives[i];
    const outcome = evaluateOne(objective.rule);
    results.push({ id: objective.id, passed: outcome.passed, detail: outcome.detail });
  }
  return results;
}

/* ------------------------------ X-Ray Box Model ------------------------------ */

export interface XrayController {
  setEnabled(enabled: boolean): void;
}

/**
 * Overlay X-Ray Box Model (ala DevTools): mewarnai area margin (oranye),
 * border (kuning), padding (hijau), dan content (biru) pada setiap elemen
 * yang memiliki box tidak nol. Dipakai lewat pesan postMessage
 * { type: "xray", enabled }.
 */
export function createXrayRuntime(doc: Document): XrayController {
  const win = doc.defaultView;
  let enabled = false;
  let container: HTMLDivElement | null = null;
  let timer: number | null = null;
  const MAX_ELEMENTS = 200;
  const REFRESH_MS = 180;

  const COLORS = {
    margin: { fill: "rgba(246, 178, 107, 0.32)", line: "rgba(203, 120, 41, 0.95)" },
    border: { fill: "rgba(255, 229, 153, 0.5)", line: "rgba(176, 146, 16, 0.95)" },
    padding: { fill: "rgba(147, 196, 125, 0.38)", line: "rgba(85, 130, 60, 0.9)" },
    content: { fill: "rgba(111, 168, 220, 0.35)", line: "rgba(54, 105, 168, 0.9)" },
  };

  function px(value: string): number {
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  function ensureContainer(): void {
    if (container !== null) return;
    container = doc.createElement("div");
    container.setAttribute("data-st-xray", "1");
    container.style.position = "fixed";
    container.style.left = "0";
    container.style.top = "0";
    container.style.right = "0";
    container.style.bottom = "0";
    container.style.zIndex = "2147483646";
    container.style.pointerEvents = "none";
    (doc.body !== null ? doc.body : doc.documentElement).appendChild(container);
  }

  function addRect(
    x: number,
    y: number,
    w: number,
    h: number,
    color: { fill: string; line: string },
  ): void {
    if (container === null || w < 1 || h < 1) return;
    const layer = doc.createElement("div");
    layer.style.position = "absolute";
    layer.style.left = x + "px";
    layer.style.top = y + "px";
    layer.style.width = w + "px";
    layer.style.height = h + "px";
    layer.style.background = color.fill;
    layer.style.outline = "1px dashed " + color.line;
    layer.style.outlineOffset = "-1px";
    container.appendChild(layer);
  }

  function paint(): void {
    if (!enabled || win === null || container === null) return;
    container.textContent = "";
    const body = doc.body;
    if (body === null) return;
    const all = body.querySelectorAll("*");
    let painted = 0;
    for (let i = 0; i < all.length && painted < MAX_ELEMENTS; i += 1) {
      const el = all[i] as HTMLElement;
      const tag = el.tagName;
      if (
        tag === "SCRIPT" ||
        tag === "STYLE" ||
        tag === "LINK" ||
        tag === "META" ||
        tag === "NOSCRIPT" ||
        tag === "BR"
      ) {
        continue;
      }
      const rect = el.getBoundingClientRect();
      const cs = win.getComputedStyle(el);
      const mt = px(cs.marginTop);
      const mr = px(cs.marginRight);
      const mb = px(cs.marginBottom);
      const ml = px(cs.marginLeft);
      const bt = px(cs.borderTopWidth);
      const brr = px(cs.borderRightWidth);
      const bb = px(cs.borderBottomWidth);
      const bl = px(cs.borderLeftWidth);
      const pt = px(cs.paddingTop);
      const pr = px(cs.paddingRight);
      const pb = px(cs.paddingBottom);
      const pl = px(cs.paddingLeft);
      if (mt + mr + mb + ml + bt + brr + bb + bl + pt + pr + pb + pl <= 0) continue;
      if (rect.width < 1 && rect.height < 1) continue;
      painted += 1;

      addRect(rect.left - ml, rect.top - mt, rect.width + ml + mr, rect.height + mt + mb, COLORS.margin);
      addRect(rect.left, rect.top, rect.width, rect.height, COLORS.border);
      addRect(
        rect.left + bl,
        rect.top + bt,
        rect.width - bl - brr,
        rect.height - bt - bb,
        COLORS.padding,
      );
      addRect(
        rect.left + bl + pl,
        rect.top + bt + pt,
        rect.width - bl - brr - pl - pr,
        rect.height - bt - bb - pt - pb,
        COLORS.content,
      );
    }
  }

  function stop(): void {
    if (timer !== null && win !== null) {
      win.clearInterval(timer);
      timer = null;
    }
    if (win !== null) {
      win.removeEventListener("scroll", paint, true);
      win.removeEventListener("resize", paint);
    }
    if (container !== null) container.textContent = "";
  }

  return {
    setEnabled: function (next: boolean): void {
      enabled = !!(next && win !== null);
      if (!enabled) {
        stop();
        return;
      }
      ensureContainer();
      paint();
      if (win !== null) {
        timer = win.setInterval(paint, REFRESH_MS);
        win.addEventListener("scroll", paint, true);
        win.addEventListener("resize", paint);
      }
    },
  };
}

/* --------------------------------- Scripts --------------------------------- */

/** Script capture console + error hook. Disuntik SEBELUM kode mahasiswa. */
export function buildCaptureScript(nonce: string): string {
  const serializedNonce = JSON.stringify(nonce);
  return [
    "(function () {",
    "  var NONCE = " + serializedNonce + ";",
    "  var LOG_COUNT = 0;",
    "  var MAX_LOGS = 200;",
    "  function safeToString(value) {",
    "    if (typeof value === 'string') return value;",
    "    if (value === null) return 'null';",
    "    if (value === undefined) return 'undefined';",
    "    if (typeof value === 'function') return '[Function ' + (value.name || 'anonymous') + ']';",
    "    if (typeof value === 'object') {",
    "      try { return JSON.stringify(value); } catch (e) { return Object.prototype.toString.call(value); }",
    "    }",
    "    return String(value);",
    "  }",
    "  window.__stSend = function (message) {",
    "    message.__st = true;",
    "    message.nonce = NONCE;",
    "    try { parent.postMessage(message, '*'); } catch (e) {}",
    "  };",
    "  var levels = ['log', 'info', 'warn', 'error', 'debug'];",
    "  for (var i = 0; i < levels.length; i += 1) {",
    "    (function (level) {",
    "      var original = console[level] ? console[level].bind(console) : function () {};",
    "      console[level] = function () {",
    "        var parts = [];",
    "        for (var j = 0; j < arguments.length; j += 1) parts.push(safeToString(arguments[j]));",
    "        if (LOG_COUNT < MAX_LOGS) {",
    "          LOG_COUNT += 1;",
    "          window.__stSend({ type: 'console', level: level, text: parts.join(' ') });",
    "        }",
    "        original.apply(null, arguments);",
    "      };",
    "    })(levels[i]);",
    "  }",
    "  window.addEventListener('error', function (event) {",
    "    var text = event && event.message ? event.message : String(event);",
    "    window.__stSend({ type: 'runtime-error', message: text });",
    "  });",
    "  window.addEventListener('unhandledrejection', function (event) {",
    "    var reason = event && event.reason ? event.reason : event;",
    "    var text = reason && reason.message ? reason.message : String(reason);",
    "    window.__stSend({ type: 'runtime-error', message: 'Promise ditolak: ' + text });",
    "  });",
    "})();",
  ].join("\n");
}

/** Script harness evaluasi + X-Ray. Disuntik SETELAH kode mahasiswa. */
export function buildHarnessScript(nonce: string): string {
  void nonce; // nonce sudah dipasang oleh capture script melalui window.__stSend.
  return [
    "(function () {",
    "  var EVALUATE = " + evaluateObjectives.toString() + ";",
    "  var XRAY = " + createXrayRuntime.toString() + "(document);",
    "  window.addEventListener('message', function (event) {",
    "    var data = event ? event.data : null;",
    "    if (!data) return;",
    "    if (data.type === 'xray') {",
    "      try { XRAY.setEnabled(!!data.enabled); } catch (e) {}",
    "      return;",
    "    }",
    "    if (data.type !== 'validate') return;",
    "    var results = [];",
    "    try {",
    "      results = EVALUATE(document, data.objectives || []);",
    "    } catch (error) {",
    "      results = [];",
    "    }",
    "    if (!results || results.length === 0) {",
    "      var objectives = data.objectives || [];",
    "      results = [];",
    "      for (var i = 0; i < objectives.length; i += 1) {",
    "        results.push({",
    "          id: objectives[i].id,",
    "          passed: false,",
    "          detail: 'Evaluator gagal dimuat di sandbox. Coba deploy ulang.',",
    "        });",
    "      }",
    "    }",
    "    window.__stSend({ type: 'validation-result', requestId: data.requestId, results: results });",
    "  });",
    "  window.__stSend({ type: 'ready' });",
    "})();",
  ].join("\n");
}
