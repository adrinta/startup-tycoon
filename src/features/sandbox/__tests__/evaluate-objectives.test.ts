import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import type { Objective } from "@/content/quests/schema";
import { createXrayRuntime, evaluateObjectives } from "@/features/sandbox/harness";

function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

function evaluate(html: string, objective: Objective) {
  const [result] = evaluateObjectives(parseHtml(html), [objective]);
  return result;
}

function objective(rule: Objective["rule"]): Objective {
  return { id: "test", label: "test", rule };
}

describe("rule: doctype", () => {
  it("lolos bila ada <!DOCTYPE html>", () => {
    const result = evaluate("<!DOCTYPE html><html><body></body></html>", objective({ kind: "doctype" }));
    expect(result.passed).toBe(true);
  });

  it("gagal bila doctype tidak ada", () => {
    const result = evaluate("<html><body></body></html>", objective({ kind: "doctype" }));
    expect(result.passed).toBe(false);
    expect(result.detail).toBeTruthy();
  });
});

describe("rule: dom", () => {
  it("menghitung kemunculan elemen dengan batas min", () => {
    const result = evaluate("<p>a</p><p>b</p>", objective({ kind: "dom", selector: "p", min: 3 }));
    expect(result.passed).toBe(false);
    expect(result.detail).toContain("2");
  });

  it("lolos bila jumlah elemen memenuhi rentang", () => {
    const result = evaluate("<p>a</p><p>b</p>", objective({ kind: "dom", selector: "p", min: 2, max: 4 }));
    expect(result.passed).toBe(true);
  });
});

describe("rule: attr", () => {
  it("mode all mewajibkan semua elemen memiliki atribut terisi", () => {
    const html = '<img src="a.jpg" alt=""><img src="b.jpg" alt="beras">';
    const result = evaluate(html, objective({ kind: "attr", selector: "img", attr: "alt", mode: "all" }));
    expect(result.passed).toBe(false);
    expect(result.detail).toContain("kosong");
  });

  it("mode all lolos bila semua alt terisi", () => {
    const html = '<img src="a.jpg" alt="beras"><img src="b.jpg" alt="minyak">';
    const result = evaluate(html, objective({ kind: "attr", selector: "img", attr: "alt", mode: "all" }));
    expect(result.passed).toBe(true);
  });

  it("mode some cukup satu elemen memenuhi contains", () => {
    const html = '<a href="https://google.com">x</a><a href="https://wa.me/62">Hubungi</a>';
    const result = evaluate(html, objective({ kind: "attr", selector: "a", attr: "href", contains: "wa.me" }));
    expect(result.passed).toBe(true);
  });

  it("equals case-insensitive secara default", () => {
    const html = '<table><tr><td colspan="2">x</td></tr></table>';
    const result = evaluate(html, objective({ kind: "attr", selector: "td", attr: "colspan", equals: "2" }));
    expect(result.passed).toBe(true);
  });
});

describe("rule: text", () => {
  it("contains mengabaikan besar-kecil huruf secara default", () => {
    const result = evaluate("<h1>toko kelontong pak budi</h1>", objective({ kind: "text", selector: "h1", contains: "Toko Kelontong Pak Budi" }));
    expect(result.passed).toBe(true);
  });

  it("normalisasi spasi berlebih", () => {
    const result = evaluate("<p>Diskon   10%\nuntuk kamu</p>", objective({ kind: "text", selector: "p", contains: "Diskon 10% untuk" }));
    expect(result.passed).toBe(true);
  });

  it("gagal bila teks tidak memuat kata kunci", () => {
    const result = evaluate("<mark>Promo spesial</mark>", objective({ kind: "text", selector: "mark", contains: "Diskon 10%" }));
    expect(result.passed).toBe(false);
  });
});

describe("rule: childOf", () => {
  it("lolos bila elemen berada di dalam ancestor", () => {
    const html = "<header><nav><a href='#'>x</a></nav></header>";
    const result = evaluate(html, objective({ kind: "childOf", selector: "nav", ancestor: "header" }));
    expect(result.passed).toBe(true);
  });

  it("gagal bila elemen berada di luar ancestor", () => {
    const html = "<header></header><nav><a href='#'>x</a></nav>";
    const result = evaluate(html, objective({ kind: "childOf", selector: "nav", ancestor: "header" }));
    expect(result.passed).toBe(false);
  });
});

describe("rule: order", () => {
  it("lolos bila elemen pertama muncul lebih dulu", () => {
    const html = "<header>h</header><main>m</main><footer>f</footer>";
    const result = evaluate(html, objective({ kind: "order", first: "header", then: "main" }));
    expect(result.passed).toBe(true);
  });

  it("gagal bila urutan terbalik", () => {
    const html = "<main>m</main><header>h</header>";
    const result = evaluate(html, objective({ kind: "order", first: "header", then: "main" }));
    expect(result.passed).toBe(false);
  });
});

describe("ketahanan evaluator", () => {
  it("selektor tidak valid tidak membuat crash", () => {
    const result = evaluate("<p>x</p>", objective({ kind: "dom", selector: ">>>rusak" }));
    expect(result.passed).toBe(false);
    expect(result.detail).toBeTruthy();
  });

  it("evaluasi banyak objective sekaligus mengembalikan hasil per id", () => {
    const objectives: Objective[] = [
      { id: "a", label: "a", rule: { kind: "dom", selector: "h1" } },
      { id: "b", label: "b", rule: { kind: "dom", selector: "table" } },
    ];
    const results = evaluateObjectives(parseHtml("<h1>x</h1>"), objectives);
    expect(results.map((result) => [result.id, result.passed])).toEqual([
      ["a", true],
      ["b", false],
    ]);
  });
});

/* ------------------------------ Aturan computed ------------------------------ */

function evaluateWithStyle(
  html: string,
  style: string,
  objective: Objective,
): { passed: boolean; detail?: string } {
  const dom = new JSDOM(`<!DOCTYPE html><html><head><style>${style}</style></head><body>${html}</body></html>`);
  const [result] = evaluateObjectives(dom.window.document, [objective]);
  return result;
}

describe("rule: computed", () => {
  it("membaca nilai dari cascade stylesheet (padding)", () => {
    const result = evaluateWithStyle(
      '<div class="card">x</div>',
      ".card { padding: 24px; }",
      objective({ kind: "computed", selector: ".card", property: "padding-top", expected: "24px" }),
    );
    expect(result.passed).toBe(true);
  });

  it("menormalkan warna HEX <-> rgb", () => {
    const viaHex = evaluateWithStyle(
      '<span class="brand">x</span>',
      ".brand { color: #6d28d9; }",
      objective({ kind: "computed", selector: ".brand", property: "color", expected: "#6d28d9" }),
    );
    const viaRgb = evaluateWithStyle(
      '<span class="brand">x</span>',
      ".brand { color: #6d28d9; }",
      objective({
        kind: "computed",
        selector: ".brand",
        property: "color",
        expected: "rgb(109, 40, 217)",
      }),
    );
    expect(viaHex.passed).toBe(true);
    expect(viaRgb.passed).toBe(true);
  });

  it("gagal dengan detail yang informatif saat warna berbeda", () => {
    const result = evaluateWithStyle(
      '<span class="brand">x</span>',
      ".brand { color: #ff0000; }",
      objective({ kind: "computed", selector: ".brand", property: "color", expected: "#6d28d9" }),
    );
    expect(result.passed).toBe(false);
    expect(result.detail).toContain("color");
  });

  it("menghitung jumlah kolom grid dari repeat()", () => {
    const result = evaluateWithStyle(
      '<div class="grid"><i>1</i><i>2</i><i>3</i></div>',
      ".grid { display: grid; grid-template-columns: repeat(3, 1fr); }",
      objective({
        kind: "computed",
        selector: ".grid",
        property: "grid-template-columns",
        expectedCount: 3,
      }),
    );
    expect(result.passed).toBe(true);
  });

  it("menghitung jumlah kolom dari daftar nilai eksplisit", () => {
    const result = evaluateWithStyle(
      '<div class="grid">x</div>',
      ".grid { grid-template-columns: 1fr 1fr; }",
      objective({
        kind: "computed",
        selector: ".grid",
        property: "grid-template-columns",
        expectedCount: 2,
      }),
    );
    expect(result.passed).toBe(true);
  });

  it("menolak jumlah kolom yang salah dengan detail terdeteksi", () => {
    const result = evaluateWithStyle(
      '<div class="grid">x</div>',
      ".grid { grid-template-columns: repeat(2, 1fr); }",
      objective({
        kind: "computed",
        selector: ".grid",
        property: "grid-template-columns",
        expectedCount: 3,
      }),
    );
    expect(result.passed).toBe(false);
    expect(result.detail).toContain("terdeteksi 2");
  });

  it("mode all (default) menuntut semua elemen memenuhi", () => {
    const html = '<div class="card">a</div><div class="card">b</div>';
    const strict = evaluateWithStyle(
      html,
      ".card { padding: 24px; } .card:last-child { padding: 8px; }",
      objective({ kind: "computed", selector: ".card", property: "padding-top", expected: "24px" }),
    );
    const lenient = evaluateWithStyle(
      html,
      ".card { padding: 24px; } .card:last-child { padding: 8px; }",
      objective({
        kind: "computed",
        selector: ".card",
        property: "padding-top",
        expected: "24px",
        mode: "some",
      }),
    );
    expect(strict.passed).toBe(false);
    expect(lenient.passed).toBe(true);
  });

  it("gagal ramah bila elemen tidak ditemukan", () => {
    const result = evaluateWithStyle(
      "<p>x</p>",
      "",
      objective({ kind: "computed", selector: ".tidak-ada", property: "display", expected: "flex" }),
    );
    expect(result.passed).toBe(false);
    expect(result.detail).toContain(".tidak-ada");
  });
});

describe("rule: allOf", () => {
  it("lulus hanya bila seluruh sub-aturan lulus", () => {
    const pass = evaluateWithStyle(
      '<div class="row">x</div>',
      ".row { display: flex; justify-content: space-between; }",
      objective({
        kind: "allOf",
        rules: [
          { kind: "computed", selector: ".row", property: "display", expected: "flex" },
          {
            kind: "computed",
            selector: ".row",
            property: "justify-content",
            expected: "space-between",
          },
        ],
      }),
    );
    expect(pass.passed).toBe(true);

    const fail = evaluateWithStyle(
      '<div class="row">x</div>',
      ".row { display: flex; }",
      objective({
        kind: "allOf",
        rules: [
          { kind: "computed", selector: ".row", property: "display", expected: "flex" },
          {
            kind: "computed",
            selector: ".row",
            property: "justify-content",
            expected: "space-between",
          },
        ],
      }),
    );
    expect(fail.passed).toBe(false);
    expect(fail.detail).toContain("justify-content");
  });

  it("mendukung aturan DOM di dalam allOf", () => {
    const result = evaluateWithStyle(
      "<header>a</header><main>b</main><footer>c</footer>",
      "",
      objective({
        kind: "allOf",
        rules: [
          { kind: "dom", selector: "header" },
          { kind: "dom", selector: "main" },
          { kind: "dom", selector: "footer" },
        ],
      }),
    );
    expect(result.passed).toBe(true);
  });
});

describe("runtime X-Ray", () => {
  it("menambah dan membersihkan lapisan overlay", () => {
    const dom = new JSDOM("<!DOCTYPE html><html><body><div style='padding: 12px'>x</div></body></html>");
    const controller = createXrayRuntime(dom.window.document);

    controller.setEnabled(true);
    const overlay = dom.window.document.querySelector("[data-st-xray]");
    expect(overlay).not.toBeNull();

    controller.setEnabled(false);
    expect(overlay?.childElementCount ?? 0).toBe(0);
  });
});
