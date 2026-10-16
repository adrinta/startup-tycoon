import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import type { Objective } from "@/content/quests/schema";
import { createXrayRuntime, evaluateObjectives } from "@/features/sandbox/harness";

function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

function objective(rule: Objective["rule"]): Objective {
  return { id: "test", label: "test", rule };
}

async function evaluate(html: string, rule: Objective["rule"]) {
  const [result] = await evaluateObjectives(parseHtml(html), [objective(rule)]);
  return result;
}

function evaluateWithStyle(html: string, style: string, rule: Objective["rule"]) {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><head><style>${style}</style></head><body>${html}</body></html>`,
  );
  return evaluateObjectives(dom.window.document, [objective(rule)]).then(
    ([result]) => result,
  );
}

/** Dokumen dengan script yang benar-benar dieksekusi (untuk aturan js/click/dll). */
function evaluateWithScripts(html: string, rule: Objective["rule"]) {
  const dom = new JSDOM(`<!DOCTYPE html><html><body>${html}</body></html>`, {
    runScripts: "dangerously",
  });
  return evaluateObjectives(dom.window.document, [objective(rule)]).then(
    ([result]) => result,
  );
}

describe("rule: doctype", () => {
  it("lolos bila ada <!DOCTYPE html>", async () => {
    const result = await evaluate(
      "<!DOCTYPE html><html><body></body></html>",
      { kind: "doctype" },
    );
    expect(result.passed).toBe(true);
  });

  it("gagal bila doctype tidak ada", async () => {
    const result = await evaluate("<html><body></body></html>", { kind: "doctype" });
    expect(result.passed).toBe(false);
    expect(result.detail).toBeTruthy();
  });
});

describe("rule: dom", () => {
  it("menghitung kemunculan elemen dengan batas min", async () => {
    const result = await evaluate("<p>a</p><p>b</p>", { kind: "dom", selector: "p", min: 3 });
    expect(result.passed).toBe(false);
    expect(result.detail).toContain("2");
  });

  it("lolos bila jumlah elemen memenuhi rentang", async () => {
    const result = await evaluate("<p>a</p><p>b</p>", {
      kind: "dom",
      selector: "p",
      min: 2,
      max: 4,
    });
    expect(result.passed).toBe(true);
  });
});

describe("rule: attr", () => {
  it("mode all mewajibkan semua elemen memiliki atribut terisi", async () => {
    const html = '<img src="a.jpg" alt=""><img src="b.jpg" alt="beras">';
    const result = await evaluate(html, {
      kind: "attr",
      selector: "img",
      attr: "alt",
      mode: "all",
    });
    expect(result.passed).toBe(false);
    expect(result.detail).toContain("kosong");
  });

  it("mode all lolos bila semua alt terisi", async () => {
    const html = '<img src="a.jpg" alt="beras"><img src="b.jpg" alt="minyak">';
    const result = await evaluate(html, {
      kind: "attr",
      selector: "img",
      attr: "alt",
      mode: "all",
    });
    expect(result.passed).toBe(true);
  });

  it("mode some cukup satu elemen memenuhi contains", async () => {
    const html = '<a href="https://google.com">x</a><a href="https://wa.me/62">Hubungi</a>';
    const result = await evaluate(html, {
      kind: "attr",
      selector: "a",
      attr: "href",
      contains: "wa.me",
    });
    expect(result.passed).toBe(true);
  });

  it("equals case-insensitive secara default", async () => {
    const html = '<table><tr><td colspan="2">x</td></tr></table>';
    const result = await evaluate(html, {
      kind: "attr",
      selector: "td",
      attr: "colspan",
      equals: "2",
    });
    expect(result.passed).toBe(true);
  });
});

describe("rule: text", () => {
  it("contains mengabaikan besar-kecil huruf secara default", async () => {
    const result = await evaluate("<h1>toko kelontong pak budi</h1>", {
      kind: "text",
      selector: "h1",
      contains: "Toko Kelontong Pak Budi",
    });
    expect(result.passed).toBe(true);
  });

  it("normalisasi spasi berlebih", async () => {
    const result = await evaluate("<p>Diskon   10%\nuntuk kamu</p>", {
      kind: "text",
      selector: "p",
      contains: "Diskon 10% untuk",
    });
    expect(result.passed).toBe(true);
  });

  it("gagal bila teks tidak memuat kata kunci", async () => {
    const result = await evaluate("<mark>Promo spesial</mark>", {
      kind: "text",
      selector: "mark",
      contains: "Diskon 10%",
    });
    expect(result.passed).toBe(false);
  });
});

describe("rule: childOf", () => {
  it("lolos bila elemen berada di dalam ancestor", async () => {
    const html = "<header><nav><a href='#'>x</a></nav></header>";
    const result = await evaluate(html, { kind: "childOf", selector: "nav", ancestor: "header" });
    expect(result.passed).toBe(true);
  });

  it("gagal bila elemen berada di luar ancestor", async () => {
    const html = "<header></header><nav><a href='#'>x</a></nav>";
    const result = await evaluate(html, { kind: "childOf", selector: "nav", ancestor: "header" });
    expect(result.passed).toBe(false);
  });
});

describe("rule: order", () => {
  it("lolos bila elemen pertama muncul lebih dulu", async () => {
    const html = "<header>h</header><main>m</main><footer>f</footer>";
    const result = await evaluate(html, { kind: "order", first: "header", then: "main" });
    expect(result.passed).toBe(true);
  });

  it("gagal bila urutan terbalik", async () => {
    const html = "<main>m</main><header>h</header>";
    const result = await evaluate(html, { kind: "order", first: "header", then: "main" });
    expect(result.passed).toBe(false);
  });
});

describe("ketahanan evaluator", () => {
  it("selektor tidak valid tidak membuat crash", async () => {
    const result = await evaluate("<p>x</p>", { kind: "dom", selector: ">>>rusak" });
    expect(result.passed).toBe(false);
    expect(result.detail).toBeTruthy();
  });

  it("evaluasi banyak objective sekaligus mengembalikan hasil per id", async () => {
    const objectives: Objective[] = [
      { id: "a", label: "a", rule: { kind: "dom", selector: "h1" } },
      { id: "b", label: "b", rule: { kind: "dom", selector: "table" } },
    ];
    const results = await evaluateObjectives(parseHtml("<h1>x</h1>"), objectives);
    expect(results.map((result) => [result.id, result.passed])).toEqual([
      ["a", true],
      ["b", false],
    ]);
  });
});

/* ------------------------------ Aturan computed ------------------------------ */

describe("rule: computed", () => {
  it("membaca nilai dari cascade stylesheet (padding)", async () => {
    const result = await evaluateWithStyle(
      '<div class="card">x</div>',
      ".card { padding: 24px; }",
      { kind: "computed", selector: ".card", property: "padding-top", expected: "24px" },
    );
    expect(result.passed).toBe(true);
  });

  it("menormalkan warna HEX <-> rgb", async () => {
    const viaHex = await evaluateWithStyle(
      '<span class="brand">x</span>',
      ".brand { color: #6d28d9; }",
      { kind: "computed", selector: ".brand", property: "color", expected: "#6d28d9" },
    );
    const viaRgb = await evaluateWithStyle(
      '<span class="brand">x</span>',
      ".brand { color: #6d28d9; }",
      {
        kind: "computed",
        selector: ".brand",
        property: "color",
        expected: "rgb(109, 40, 217)",
      },
    );
    expect(viaHex.passed).toBe(true);
    expect(viaRgb.passed).toBe(true);
  });

  it("gagal dengan detail yang informatif saat warna berbeda", async () => {
    const result = await evaluateWithStyle(
      '<span class="brand">x</span>',
      ".brand { color: #ff0000; }",
      { kind: "computed", selector: ".brand", property: "color", expected: "#6d28d9" },
    );
    expect(result.passed).toBe(false);
    expect(result.detail).toContain("color");
  });

  it("menghitung jumlah kolom grid dari repeat()", async () => {
    const result = await evaluateWithStyle(
      '<div class="grid"><i>1</i><i>2</i><i>3</i></div>',
      ".grid { display: grid; grid-template-columns: repeat(3, 1fr); }",
      {
        kind: "computed",
        selector: ".grid",
        property: "grid-template-columns",
        expectedCount: 3,
      },
    );
    expect(result.passed).toBe(true);
  });

  it("menghitung jumlah kolom dari daftar nilai eksplisit", async () => {
    const result = await evaluateWithStyle(
      '<div class="grid">x</div>',
      ".grid { grid-template-columns: 1fr 1fr; }",
      {
        kind: "computed",
        selector: ".grid",
        property: "grid-template-columns",
        expectedCount: 2,
      },
    );
    expect(result.passed).toBe(true);
  });

  it("menolak jumlah kolom yang salah dengan detail terdeteksi", async () => {
    const result = await evaluateWithStyle(
      '<div class="grid">x</div>',
      ".grid { grid-template-columns: repeat(2, 1fr); }",
      {
        kind: "computed",
        selector: ".grid",
        property: "grid-template-columns",
        expectedCount: 3,
      },
    );
    expect(result.passed).toBe(false);
    expect(result.detail).toContain("terdeteksi 2");
  });

  it("mode all (default) menuntut semua elemen memenuhi", async () => {
    const html = '<div class="card">a</div><div class="card">b</div>';
    const strict = await evaluateWithStyle(
      html,
      ".card { padding: 24px; } .card:last-child { padding: 8px; }",
      { kind: "computed", selector: ".card", property: "padding-top", expected: "24px" },
    );
    const lenient = await evaluateWithStyle(
      html,
      ".card { padding: 24px; } .card:last-child { padding: 8px; }",
      {
        kind: "computed",
        selector: ".card",
        property: "padding-top",
        expected: "24px",
        mode: "some",
      },
    );
    expect(strict.passed).toBe(false);
    expect(lenient.passed).toBe(true);
  });

  it("gagal ramah bila elemen tidak ditemukan", async () => {
    const result = await evaluateWithStyle("<p>x</p>", "", {
      kind: "computed",
      selector: ".tidak-ada",
      property: "display",
      expected: "flex",
    });
    expect(result.passed).toBe(false);
    expect(result.detail).toContain(".tidak-ada");
  });
});

describe("rule: allOf", () => {
  it("lulus hanya bila seluruh sub-aturan lulus", async () => {
    const pass = await evaluateWithStyle(
      '<div class="row">x</div>',
      ".row { display: flex; justify-content: space-between; }",
      {
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
      },
    );
    expect(pass.passed).toBe(true);

    const fail = await evaluateWithStyle(
      '<div class="row">x</div>',
      ".row { display: flex; }",
      {
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
      },
    );
    expect(fail.passed).toBe(false);
    expect(fail.detail).toContain("justify-content");
  });

  it("mendukung aturan DOM di dalam allOf", async () => {
    const result = await evaluate("<header>a</header><main>b</main><footer>c</footer>", {
      kind: "allOf",
      rules: [
        { kind: "dom", selector: "header" },
        { kind: "dom", selector: "main" },
        { kind: "dom", selector: "footer" },
      ],
    });
    expect(result.passed).toBe(true);
  });
});

/* -------------------------------- Aturan JS ---------------------------------- */

describe("rule: js", () => {
  it("truthy lulus, string menjadi pesan gagal, error dilaporkan", async () => {
    const jsPass = await evaluateWithScripts("<p>x</p>", {
      kind: "js",
      test: "1 + 1 === 2",
    });
    expect(jsPass.passed).toBe(true);

    const jsString = await evaluateWithScripts("<p>x</p>", {
      kind: "js",
      test: 'false || "pesan khusus"',
    });
    expect(jsString.passed).toBe(false);
    expect(jsString.detail).toBe("pesan khusus");

    const jsError = await evaluateWithScripts("<p>x</p>", {
      kind: "js",
      test: "tidakAdaFungsi()",
    });
    expect(jsError.passed).toBe(false);
    expect(jsError.detail).toContain("tidakAdaFungsi");
  });

  it("mengakses fungsi yang didefinisikan kode mahasiswa", async () => {
    const result = await evaluateWithScripts(
      "<script>function hitungTotal(h, j) { return h * j; }</script>",
      { kind: "js", test: "hitungTotal(3, 4) === 12 || \"hasil: \" + hitungTotal(3, 4)" },
    );
    expect(result.passed).toBe(true);
  });
});

describe("rule: click / input / submit", () => {
  it("click memicu event listener dan mengubah DOM", async () => {
    const result = await evaluateWithScripts(
      [
        '<button id="b">x</button><p id="out">diam</p>',
        "<script>",
        'document.querySelector("#b").addEventListener("click", function () {',
        '  document.querySelector("#out").textContent = "Halo";',
        "});",
        "</script>",
      ].join(""),
      {
        kind: "allOf",
        rules: [
          { kind: "click", selector: "#b" },
          { kind: "text", selector: "#out", contains: "Halo" },
        ],
      },
    );
    expect(result.passed).toBe(true);
  });

  it("click gagal ramah bila tombol tidak ada", async () => {
    const result = await evaluateWithScripts("<p>x</p>", { kind: "click", selector: "#tidak-ada" });
    expect(result.passed).toBe(false);
    expect(result.detail).toContain("#tidak-ada");
  });

  it("input + submit menjalankan validasi form", async () => {
    const html = [
      '<form id="f"><input id="email"><button type="submit">Kirim</button></form>',
      '<p id="msg">Belum ada.</p>',
      "<script>",
      'document.querySelector("#f").addEventListener("submit", function (event) {',
      "  event.preventDefault();",
      '  var email = document.querySelector("#email").value.trim();',
      '  if (!email.includes("@")) { document.querySelector("#msg").textContent = "Format salah"; }',
      '  else { document.querySelector("#msg").textContent = "Berhasil"; }',
      "});",
      "</script>",
    ].join("");
    const invalid = await evaluateWithScripts(html, {
      kind: "allOf",
      rules: [
        { kind: "input", selector: "#email", value: "salah" },
        { kind: "submit", selector: "#f" },
        { kind: "text", selector: "#msg", contains: "Format salah" },
      ],
    });
    expect(invalid.passed).toBe(true);

    const valid = await evaluateWithScripts(html, {
      kind: "allOf",
      rules: [
        { kind: "input", selector: "#email", value: "founder@projectx.id" },
        { kind: "submit", selector: "#f" },
        { kind: "text", selector: "#msg", contains: "Berhasil" },
      ],
    });
    expect(valid.passed).toBe(true);
  });
});

describe("rule: waitFor", () => {
  it("menunggu kondisi async terpenuhi", async () => {
    const result = await evaluateWithScripts(
      "<script>window.siap = false; window.setTimeout(function () { window.siap = true; }, 120);</script>",
      { kind: "waitFor", timeoutMs: 1000, test: "window.siap === true" },
    );
    expect(result.passed).toBe(true);
  });

  it("gagal dengan pesan waktu bila kondisi tidak pernah terpenuhi", async () => {
    const result = await evaluateWithScripts("<p>x</p>", {
      kind: "waitFor",
      timeoutMs: 250,
      test: 'false || "tidak akan pernah"',
    });
    expect(result.passed).toBe(false);
    expect(result.detail).toBe("tidak akan pernah");
  });

  it("gagal dengan pesan timeout bila ekspresi selalu falsy", async () => {
    const result = await evaluateWithScripts("<p>x</p>", {
      kind: "waitFor",
      timeoutMs: 250,
      test: "false",
    });
    expect(result.passed).toBe(false);
    expect(result.detail).toContain("250 ms");
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
