import { describe, expect, it } from "vitest";
import type { Objective } from "@/content/quests/schema";
import { evaluateObjectives } from "@/features/sandbox/harness";

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
