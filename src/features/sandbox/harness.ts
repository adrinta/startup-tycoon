import type { Objective, ObjectiveResult, Rule } from "@/features/validation/types";

/**
 * PENTING — Aturan penulisan fungsi ini:
 *
 * `evaluateObjectives` DIEKSEKUSI di dalam sandbox iframe dengan cara
 * `evaluateObjectives.toString()` disuntikkan sebagai script ke srcdoc.
 * Karena itu:
 *  - Hanya boleh mereferensikan parameternya sendiri dan API global browser.
 *  - Ditulis dengan gaya konservatif (var, function, loop indeks) agar
 *    aman dari transformasi/helper yang bisa di-hoist oleh minifier.
 *  - Jangan mengubah signature: (doc, objectives) => ObjectiveResult[].
 *
 * Versi yang sama dipakai unit test (jsdom) sehingga perilaku di sandbox
 * dan di test identik.
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

/** Script harness evaluasi. Disuntik SETELAH kode mahasiswa. */
export function buildHarnessScript(nonce: string): string {
  void nonce; // nonce sudah dipasang oleh capture script melalui window.__stSend.
  return [
    "(function () {",
    "  var EVALUATE = " + evaluateObjectives.toString() + ";",
    "  window.addEventListener('message', function (event) {",
    "    var data = event ? event.data : null;",
    "    if (!data || data.type !== 'validate') return;",
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
