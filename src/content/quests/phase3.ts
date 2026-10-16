import type { Quest } from "@/content/quests/schema";

const ADA = {
  name: "Ada",
  role: "Lead Engineer · Mentor Teknis",
  avatar: "👩‍💻",
};

const MR_ROOT = {
  name: "Mr. Root",
  role: "Systems Architect",
  avatar: "🛡️",
};

const ZANE = {
  name: "Zane",
  role: "Head of Design",
  avatar: "🎨",
};

const DASHBOARD_HTML = [
  "<!DOCTYPE html>",
  '<html lang="id">',
  "<head>",
  '  <meta charset="utf-8">',
  "  <title>Project X — Dasbor Internal</title>",
  "</head>",
  "<body>",
  "  <h1>Dasbor Internal</h1>",
  '  <p id="catatan">Umpan balik muncul di panel Audit dan Console di bawah preview.</p>',
  "</body>",
  "</html>",
  "",
].join("\n");

/**
 * Babak 3 — Growth Hack (High-Rise Tower · Lantai 15)
 * Materi: JavaScript (logika, DOM, asynchronous).
 */
export const PHASE_3_QUESTS: Quest[] = [
  {
    id: "3.1",
    order: 15,
    phase: 3,
    chapter: "Babak 3: Growth Hack",
    location: "High-Rise Tower · Lantai 15",
    isBoss: false,
    title: "Kalkulator Pendapatan",
    client: ADA,
    brief:
      "Selamat datang di lantai 15, Founder! Sekarang waktunya logika: dasbor pendapatan harus menghitung otomatis. Mulai dari variabel dan function dasar — aku sudah menyiapkan kerangkanya di tab app.js.",
    hint: 'Function mengembalikan nilai dengan `return`. `toLocaleString("id-ID")` memberi titik ribuan: 15000 menjadi "15.000". Kerjakan satu TODO demi satu, lalu Deploy untuk memeriksa.',
    instructions: [
      "Buat konstanta `PAJAK` bernilai `0.11`.",
      "Buat function `hitungTotal(harga, jumlah)` yang mengembalikan `harga * jumlah`.",
      "Buat function `hitungLaba(total, biaya)` yang mengembalikan `total - biaya`.",
      'Buat function `formatRupiah(nilai)` yang mengembalikan `"Rp " + nilai.toLocaleString("id-ID")`.',
      "Deploy untuk menguji fungsimu dengan berbagai angka.",
    ],
    codexRefs: ["js-variabel"],
    starterFiles: {
      "index.html": DASHBOARD_HTML,
      "app.js": [
        "/* app.js — kode JavaScript dijalankan setelah halaman dirender. */",
        "",
        "// TODO 1: konstanta PAJAK bernilai 0.11",
        "",
        "",
        "// TODO 2: function hitungTotal(harga, jumlah) -> harga * jumlah",
        "",
        "",
        "// TODO 3: function hitungLaba(total, biaya) -> total - biaya",
        "",
        "",
        '// TODO 4: function formatRupiah(nilai) -> "Rp " + nilai.toLocaleString("id-ID")',
        "",
        "",
      ].join("\n"),
    },
    objectives: [
      {
        id: "hitung-total-ada",
        label: "Function hitungTotal tersedia",
        rule: {
          kind: "js",
          test: 'typeof hitungTotal === "function" || "Function hitungTotal belum dibuat"',
        },
      },
      {
        id: "hitung-total-benar",
        label: "hitungTotal(10000, 3) menghasilkan 30000",
        rule: {
          kind: "js",
          test: 'hitungTotal(10000, 3) === 30000 || "hasilnya " + hitungTotal(10000, 3)',
        },
      },
      {
        id: "hitung-laba-benar",
        label: "hitungLaba(30000, 18000) menghasilkan 12000",
        rule: {
          kind: "js",
          test: 'hitungLaba(30000, 18000) === 12000 || "hasilnya " + hitungLaba(30000, 18000)',
        },
      },
      {
        id: "format-rupiah-benar",
        label: 'formatRupiah(15000) menghasilkan "Rp 15.000"',
        rule: {
          kind: "js",
          test:
            'formatRupiah(15000) === "Rp 15.000" || "hasilnya " + formatRupiah(15000)',
        },
      },
      {
        id: "fungsi-gabungan",
        label: "Fungsi bekerja pada angka lain (10000 + 3000)",
        rule: {
          kind: "js",
          test:
            'hitungTotal(2500, 4) + hitungLaba(12000, 9000) === 13000 || "hasil gabungan belum tepat"',
        },
      },
    ],
    rewards: { coins: 240, xp: 120 },
    visualHook: "tower.dashboard",
    responsivePreview: false,
    visualNote: "Dasbor angka pendapatan menyala — angka berputar cepat di dinding kantor.",
  },
  {
    id: "3.2",
    order: 16,
    phase: 3,
    chapter: "Babak 3: Growth Hack",
    location: "High-Rise Tower · Lantai 15",
    isBoss: false,
    title: "Sistem Alarm Otomatis",
    client: ADA,
    brief:
      "Operasional butuh kewaspadaan: stok menipis, kuota hampir penuh, denda keterlambatan. Tulis logika bercabang — if/else dan switch — untuk menyalakan alarm yang tepat sasaran.",
    hint: 'Alur if/else diperiksa dari atas ke bawah — taruh kondisi paling mendesak lebih dulu. `switch` cocok untuk rentang diskrit; `hitungDenda` pakai if/else bertingkat: 0 hari, 1-3 hari, dan lebih dari 3 hari.',
    instructions: [
      'Buat function `cekStok(stok, batas)`: kembalikan `"Kritis"` jika stok di bawah batas, selain itu `"Aman"`.',
      'Buat function `statusKuota(persentase)` memakai `switch`/if: ≥90 → `"kritis"`, ≥75 → `"peringatan"`, sisanya `"normal"`.',
      "Buat function `hitungDenda(hariTerlambat)`: 0 hari → 0; 1–3 hari → `hari * 1000`; lebih dari 3 hari → `hari * 3000`.",
    ],
    codexRefs: ["js-kondisi"],
    starterFiles: {
      "index.html": DASHBOARD_HTML,
      "app.js": [
        "/* app.js — logika alarm operasional. */",
        "",
        '// TODO 1: cekStok(stok, batas) -> "Kritis" / "Aman"',
        "",
        "",
        '// TODO 2: statusKuota(persentase) -> "kritis" / "peringatan" / "normal"',
        "",
        "",
        "// TODO 3: hitungDenda(hariTerlambat) -> 0 / hari*1000 / hari*3000",
        "",
        "",
      ].join("\n"),
    },
    objectives: [
      {
        id: "cek-stok",
        label: 'Alarm stok: "Kritis" di bawah batas, "Aman" jika cukup',
        rule: {
          kind: "js",
          test:
            '(cekStok(3, 5) === "Kritis" && cekStok(9, 5) === "Aman") || "hasil: " + cekStok(3, 5) + " / " + cekStok(9, 5)',
        },
      },
      {
        id: "status-kuota",
        label: "Status kuota bertingkat: 95→kritis, 80→peringatan, 20→normal",
        rule: {
          kind: "js",
          test:
            '(statusKuota(95) === "kritis" && statusKuota(80) === "peringatan" && statusKuota(20) === "normal") || "hasil: " + statusKuota(95) + " / " + statusKuota(80) + " / " + statusKuota(20)',
        },
      },
      {
        id: "hitung-denda",
        label: "Denda bertingkat: 0 hari gratis, 2 hari 2.000, 5 hari 15.000",
        rule: {
          kind: "js",
          test:
            '(hitungDenda(0) === 0 && hitungDenda(2) === 2000 && hitungDenda(5) === 15000) || "hasil: " + hitungDenda(0) + " / " + hitungDenda(2) + " / " + hitungDenda(5)',
        },
      },
    ],
    rewards: { coins: 260, xp: 130 },
    visualHook: "tower.alarm",
    responsivePreview: false,
    visualNote: "Lampu darurat terpasang — menyala merah lembut memantau operasional.",
  },
  {
    id: "3.3",
    order: 17,
    phase: 3,
    chapter: "Babak 3: Growth Hack",
    location: "High-Rise Tower · Lantai 15",
    isBoss: false,
    title: "Analisis Massal",
    client: ADA,
    brief:
      "Data pelanggan menumpuk di ban berjalan. Olah dengan array dan loop: saring yang aktif, cari orang tertentu, dan rangkum statistiknya. Data contoh sudah kusiapkan di app.js.",
    hint: "`filter` menyaring, `map` mengubah bentuk, `find` mencari satu item (null bila tak ada), dan loop `for` classic bisa menghitung ringkasan. Jangan mengubah array `pelanggan` — buat fungsi yang MENGEMBALIKAN hasil baru.",
    instructions: [
      "`totalPelanggan(daftar)` → jumlah pelanggan.",
      '`daftarAktif(daftar)` → array nama yang aktif saja, urut asli (contoh: ["Ani", "Budi", "Citra"]).',
      "`cariPelanggan(daftar, nama)` → object pelanggan tersebut, atau `null` bila tidak ada.",
      "`ringkasan(daftar)` → object `{ aktif: <jumlah>, nonaktif: <jumlah> }` (urutan properti seperti itu).",
    ],
    codexRefs: ["js-array"],
    starterFiles: {
      "index.html": DASHBOARD_HTML,
      "app.js": [
        "/* app.js — analisis data pelanggan. */",
        "",
        "const pelanggan = [",
        '  { nama: "Ani", aktif: true },',
        '  { nama: "Budi", aktif: true },',
        '  { nama: "Citra", aktif: true },',
        '  { nama: "Dewi", aktif: false },',
        '  { nama: "Eko", aktif: false },',
        "];",
        "",
        "// TODO 1: totalPelanggan(daftar)",
        "",
        "",
        "// TODO 2: daftarAktif(daftar) -> array nama yang aktif",
        "",
        "",
        "// TODO 3: cariPelanggan(daftar, nama) -> object atau null",
        "",
        "",
        "// TODO 4: ringkasan(daftar) -> { aktif: ..., nonaktif: ... }",
        "",
        "",
      ].join("\n"),
    },
    objectives: [
      {
        id: "total-pelanggan",
        label: "totalPelanggan menghitung 5 pelanggan",
        rule: {
          kind: "js",
          test: 'totalPelanggan(pelanggan) === 5 || "hasilnya " + totalPelanggan(pelanggan)',
        },
      },
      {
        id: "daftar-aktif",
        label: 'daftarAktif menghasilkan ["Ani","Budi","Citra"]',
        rule: {
          kind: "js",
          test:
            'JSON.stringify(daftarAktif(pelanggan)) === \'["Ani","Budi","Citra"]\' || "hasilnya " + JSON.stringify(daftarAktif(pelanggan))',
        },
      },
      {
        id: "cari-pelanggan",
        label: "cariPelanggan menemukan Budi dan null untuk yang tidak ada",
        rule: {
          kind: "js",
          test:
            '(cariPelanggan(pelanggan, "Budi") && cariPelanggan(pelanggan, "Budi").aktif === true && cariPelanggan(pelanggan, "Zed") === null) || "pencarian belum tepat"',
        },
      },
      {
        id: "ringkasan",
        label: "ringkasan menghasilkan {aktif: 3, nonaktif: 2}",
        rule: {
          kind: "js",
          test:
            'JSON.stringify(ringkasan(pelanggan)) === \'{"aktif":3,"nonaktif":2}\' || "hasilnya " + JSON.stringify(ringkasan(pelanggan))',
        },
      },
    ],
    rewards: { coins: 280, xp: 140 },
    visualHook: "tower.conveyor",
    responsivePreview: false,
    visualNote: "Ban berjalan aktif memilah berkas data — kecepatan analisis naik drastis.",
  },
  {
    id: "3.4",
    order: 18,
    phase: 3,
    chapter: "Babak 3: Growth Hack",
    location: "High-Rise Tower · Lantai 15",
    isBoss: false,
    title: "Interaksi Pengguna",
    client: ZANE,
    brief:
      "Desain tanpa interaksi itu diam. Aku butuh dua hal: tombol yang mengubah teks saat diklik, dan daftar kehadiran yang bertambah setiap kali tombolnya ditekan — persis seperti pengguna sungguhan.",
    hint: 'Ambil elemen dengan `document.querySelector("#id")`, lalu `addEventListener("click", ...)`. Untuk menambah item: `createElement("li")` + `textContent` + `appendChild`.',
    instructions: [
      'Saat `#tombol-klik` diklik: ubah teks `#sapaan` menjadi mengandung kata "Halo".',
      'Saat `#tambah-kehadiran` diklik: tambahkan `<li>` baru ke `#daftar-hadir`.',
      'Isi setiap `<li>` adalah `"Tamu <nomor>"` — klik pertama menghasilkan "Tamu 1", berikutnya "Tamu 2".',
    ],
    codexRefs: ["js-dom"],
    starterFiles: {
      "index.html": [
        "<!DOCTYPE html>",
        '<html lang="id">',
        "<head>",
        '  <meta charset="utf-8">',
        "  <title>Project X — Interaksi</title>",
        "</head>",
        "<body>",
        "  <h1>Simulasi Antarmuka</h1>",
        '  <button id="tombol-klik">Kirim Salam</button>',
        '  <p id="sapaan">Menunggu...</p>',
        "  <hr>",
        '  <button id="tambah-kehadiran">Tambah Kehadiran</button>',
        '  <ul id="daftar-hadir"></ul>',
        "</body>",
        "</html>",
        "",
      ].join("\n"),
      "style.css": [
        "body { font-family: system-ui, sans-serif; padding: 16px; }",
        "button { padding: 8px 14px; margin-right: 8px; cursor: pointer; }",
        "#sapaan { font-weight: 600; color: #6d28d9; }",
        "li { padding: 4px 0; }",
        "",
      ].join("\n"),
      "app.js": [
        "/* app.js — pasang semua interaksi. */",
        "",
        '// TODO 1: klik #tombol-klik -> #sapaan berubah (mengandung "Halo")',
        "",
        "",
        '// TODO 2: klik #tambah-kehadiran -> tambah <li> "Tamu <nomor>" ke #daftar-hadir',
        "",
        "",
      ].join("\n"),
    },
    objectives: [
      {
        id: "salam-klik",
        label: 'Klik "Kirim Salam" mengubah teks sapaan',
        rule: {
          kind: "allOf",
          rules: [
            { kind: "click", selector: "#tombol-klik" },
            { kind: "text", selector: "#sapaan", contains: "Halo" },
          ],
        },
      },
      {
        id: "tamu-pertama",
        label: 'Klik pertama menambah "Tamu 1" ke daftar',
        rule: {
          kind: "allOf",
          rules: [
            { kind: "click", selector: "#tambah-kehadiran" },
            { kind: "dom", selector: "#daftar-hadir li", min: 1 },
            { kind: "text", selector: "#daftar-hadir li", contains: "Tamu 1" },
          ],
        },
      },
      {
        id: "tamu-berikutnya",
        label: 'Klik berikutnya menambah "Tamu 2" (bukan menimpa)',
        rule: {
          kind: "allOf",
          rules: [
            { kind: "click", selector: "#tambah-kehadiran" },
            { kind: "dom", selector: "#daftar-hadir li", min: 2 },
            {
              kind: "text",
              selector: "#daftar-hadir li:nth-child(2)",
              contains: "Tamu 2",
            },
          ],
        },
      },
    ],
    rewards: { coins: 300, xp: 150 },
    visualHook: "tower.ticker",
    responsivePreview: false,
    visualNote: "Pengguna virtual berdatangan — papan kehadiran berkedip mencatat mereka.",
  },
  {
    id: "3.5",
    order: 19,
    phase: 3,
    chapter: "Babak 3: Growth Hack",
    location: "High-Rise Tower · Lantai 15",
    isBoss: false,
    title: "Filter Keamanan Form",
    client: MR_ROOT,
    brief:
      "Data kotor adalah pintu masuk serangan. Sebelum formulir menyentuh server, validasi dulu di sisi klien: email kosong, format ngawur, dan konversi nilai yang aman. Robot penjaga pintu akan menguji kerjamu.",
    hint: "`event.preventDefault()` mencegah halaman reload. Cek `email.includes(\"@\")` dan `email.includes(\".\")`. Untuk konversi aman: `Number(teks)` lalu periksa `Number.isNaN(angka)` dan lempar error di dalam `try`. ",
    instructions: [
      'Saat `#form-daftar` di-submit (jangan sampai reload): ambil nilai email, lalu set teks `#pesan`.',
      'Email kosong → pesan mengandung "wajib".',
      'Email tanpa "@" atau "." → pesan mengandung "Format".',
      'Email valid → pesan mengandung "berhasil".',
      '`bersihkanNama("  Budi  ")` → `"budi"` (trim + lowercase).',
      '`parseUang("1500")` → `1500`; `parseUang("abc")` → `null` (pakai try-catch).',
    ],
    codexRefs: ["js-validasi"],
    starterFiles: {
      "index.html": [
        "<!DOCTYPE html>",
        '<html lang="id">',
        "<head>",
        '  <meta charset="utf-8">',
        "  <title>Project X — Pendaftaran</title>",
        "</head>",
        "<body>",
        "  <h1>Pendaftaran Beta Tester</h1>",
        '  <form id="form-daftar">',
        '    <input id="email" type="email" placeholder="Email kamu">',
        '    <button type="submit">Daftar</button>',
        "  </form>",
        '  <p id="pesan">Belum ada pengiriman.</p>',
        "</body>",
        "</html>",
        "",
      ].join("\n"),
      "style.css": [
        "body { font-family: system-ui, sans-serif; padding: 16px; }",
        "input { padding: 8px; margin-right: 8px; }",
        "button { padding: 8px 14px; cursor: pointer; }",
        "#pesan { font-weight: 600; }",
        "",
      ].join("\n"),
      "app.js": [
        "/* app.js — validasi & keamanan input. */",
        "",
        '// TODO 1: submit #form-daftar -> validasi email, tulis hasilnya ke #pesan',
        "",
        "",
        "// TODO 2: bersihkanNama(teks) -> trim + lowercase",
        "",
        "",
        "// TODO 3: parseUang(teks) -> Number aman, null bila gagal (try-catch)",
        "",
        "",
      ].join("\n"),
    },
    objectives: [
      {
        id: "email-kosong",
        label: 'Email kosong ditolak dengan pesan "wajib"',
        rule: {
          kind: "allOf",
          rules: [
            { kind: "input", selector: "#email", value: "" },
            { kind: "submit", selector: "#form-daftar" },
            { kind: "text", selector: "#pesan", contains: "wajib" },
          ],
        },
      },
      {
        id: "email-salah",
        label: 'Format email ngawur ditolak dengan pesan "Format"',
        rule: {
          kind: "allOf",
          rules: [
            { kind: "input", selector: "#email", value: "salah" },
            { kind: "submit", selector: "#form-daftar" },
            { kind: "text", selector: "#pesan", contains: "Format" },
          ],
        },
      },
      {
        id: "email-valid",
        label: 'Email valid diterima dengan pesan "berhasil"',
        rule: {
          kind: "allOf",
          rules: [
            { kind: "input", selector: "#email", value: "founder@projectx.id" },
            { kind: "submit", selector: "#form-daftar" },
            { kind: "text", selector: "#pesan", contains: "berhasil" },
          ],
        },
      },
      {
        id: "bersihkan-nama",
        label: 'bersihkanNama("  Budi  ") menghasilkan "budi"',
        rule: {
          kind: "js",
          test:
            'bersihkanNama("  Budi  ") === "budi" || "hasilnya [" + bersihkanNama("  Budi  ") + "]"',
        },
      },
      {
        id: "parse-uang",
        label: "parseUang aman: 1500 valid, \"abc\" → null",
        rule: {
          kind: "js",
          test:
            '(parseUang("1500") === 1500 && parseUang("abc") === null) || "hasil: " + parseUang("1500") + " / " + parseUang("abc")',
        },
      },
    ],
    rewards: { coins: 320, xp: 160 },
    visualHook: "tower.robot",
    responsivePreview: false,
    visualNote: "Robot penjaga pintu aktif — memindai setiap berkas yang masuk.",
  },
  {
    id: "3.6",
    order: 20,
    phase: 3,
    chapter: "Babak 3: Growth Hack",
    location: "High-Rise Tower · Lantai 15",
    isBoss: false,
    title: "Koneksi Server Luar",
    client: ADA,
    brief:
      "Data paling berharga tidak tinggal di rumah — ia datang dari server lain. Ambil kurs mata uang dari API secara asynchronous, tampilkan di layar, dan tangani saat servernya sedang sibuk. Nyalakan panel Event Loop di preview untuk melihat prosesnya!",
    hint: "`fetch(url)` mengembalikan Promise. Rantai dengan `.then(res => res.json())` atau pakai `async/await`. Selalu periksa `res.ok` untuk menangani kegagalan dengan pesan yang ramah.",
    instructions: [
      'Saat `#muat` diklik: `fetch("https://api.projectx.test/kurs")`, lalu tampilkan di `#nilai-kurs`: `"1 USD = Rp " + data.usd.toLocaleString("id-ID")`.',
      'Saat `#muat-gagal` diklik: fetch `https://api.projectx.test/kurs-gagal`; bila `res.ok` bernilai false, tampilkan "Gagal memuat kurs. Coba lagi nanti."',
      "Buka panel Event Loop di toolbar preview untuk melihat Promise & callback bekerja.",
    ],
    codexRefs: ["js-async"],
    starterFiles: {
      "index.html": [
        "<!DOCTYPE html>",
        '<html lang="id">',
        "<head>",
        '  <meta charset="utf-8">',
        "  <title>Project X — Live Feed</title>",
        "</head>",
        "<body>",
        "  <h1>Live Feed Kurs</h1>",
        '  <button id="muat">Muat Kurs</button>',
        '  <button id="muat-gagal">Muat dari Server Sibuk</button>',
        '  <p id="nilai-kurs">Menunggu data...</p>',
        "</body>",
        "</html>",
        "",
      ].join("\n"),
      "style.css": [
        "body { font-family: system-ui, sans-serif; padding: 16px; }",
        "button { padding: 8px 14px; margin-right: 8px; cursor: pointer; }",
        "#nilai-kurs { font-weight: 700; color: #0ea5e9; }",
        "",
      ].join("\n"),
      "app.js": [
        "/* app.js — koneksi ke server luar (API tiruan sudah disiapkan). */",
        "",
        '// TODO 1: klik #muat -> fetch kurs, tampilkan "1 USD = Rp ..."',
        "",
        "",
        '// TODO 2: klik #muat-gagal -> cek res.ok, tampilkan pesan "Gagal memuat kurs..."',
        "",
        "",
      ].join("\n"),
    },
    mocks: [
      { url: "api.projectx.test/kurs-gagal", json: { error: "server sibuk" }, status: 500, delayMs: 150 },
      { url: "api.projectx.test/kurs", json: { usd: 16250 }, delayMs: 150 },
    ],
    objectives: [
      {
        id: "klik-muat",
        label: 'Tombol "Muat Kurs" diklik (simulasi)',
        rule: { kind: "click", selector: "#muat" },
      },
      {
        id: "kurs-tampil",
        label: "Data kurs dari server tampil setelah fetch",
        rule: {
          kind: "waitFor",
          timeoutMs: 2500,
          test:
            'document.querySelector("#nilai-kurs").textContent.indexOf("16.250") !== -1 || "belum tampil (sekarang: \\"" + document.querySelector("#nilai-kurs").textContent + "\\")"',
        },
      },
      {
        id: "klik-gagal",
        label: "Tombol server sibuk diklik (simulasi)",
        rule: { kind: "click", selector: "#muat-gagal" },
      },
      {
        id: "gagal-ditangani",
        label: "Kegagalan fetch ditangani dengan pesan ramah",
        rule: {
          kind: "waitFor",
          timeoutMs: 2500,
          test:
            'document.querySelector("#nilai-kurs").textContent.indexOf("Gagal") !== -1 || "pesan kegagalan belum tampil"',
        },
      },
    ],
    rewards: { coins: 340, xp: 170 },
    visualHook: "tower.antenna",
    responsivePreview: false,
    visualNote: "Antena parabola berputar — grafik live feed dari luar menyala di monitor.",
  },
  {
    id: "3.7",
    order: 21,
    phase: 3,
    chapter: "Babak 3: Growth Hack",
    location: "High-Rise Tower · Lantai 15",
    isBoss: true,
    title: "Cyber Attack Defense",
    client: {
      name: "Mr. Root",
      role: "Systems Architect · Boss Fight",
      avatar: "🛡️",
    },
    brief:
      "Waktunya ujian. Aku melepas gelombang bug ke jaringanmu — acak, terus-menerus, tanpa ampun. Tulis pertahanan lengkap: interval serangan, hitung mundur, event klik untuk menembak, dan kondisi menang. Selamatkan server sebelum waktu habis. Audit penuh berjalan ±15 detik.",
    hint: "Gunakan DUA setInterval: satu untuk memunculkan bug acak (classList.add(\"bug\")), satu untuk hitung mundur. Klik sektor ber-bug: hapus class, tambah skor. Saat skor ≥ 3 tulis \"Menang!\" di #status dan hentikan interval dengan clearInterval.",
    instructions: [
      'Klik `#mulai` memulai pertahanan: reset skor 0, waktu 8, dan pasang `setInterval` serangan (bug acak di `.sector` memakai class "bug").',
      "Bug baru muncul paling lambat 2,5 detik setelah dimulai.",
      "Klik sektor ber-bug menghapusnya dan menambah `#skor` sebanyak 1.",
      "Hitung mundur `#waktu` berkurang tiap detik (mulai dari 8).",
      'Saat skor mencapai 3: tulis "Menang!" pada `#status` dan hentikan serangan; saat waktu habis tulis pesan kalah.',
      "Deploy = audit penuh (mensimulasikan serangan) — tunggu hingga ±15 detik.",
    ],
    codexRefs: ["js-dom", "js-kondisi"],
    starterFiles: {
      "index.html": [
        "<!DOCTYPE html>",
        '<html lang="id">',
        "<head>",
        '  <meta charset="utf-8">',
        "  <title>Project X — Pertahanan Cyber</title>",
        "</head>",
        "<body>",
        "  <h1>Pertahanan Cyber</h1>",
        '  <p>Skor: <strong id="skor">0</strong> · Waktu: <strong id="waktu">8</strong> detik</p>',
        '  <button id="mulai">Mulai Pertahanan</button>',
        '  <p id="status">Sistem siap. Tunggu perintah mulai.</p>',
        '  <div id="grid">',
        '    <button class="sector" data-sector="1">1</button>',
        '    <button class="sector" data-sector="2">2</button>',
        '    <button class="sector" data-sector="3">3</button>',
        '    <button class="sector" data-sector="4">4</button>',
        '    <button class="sector" data-sector="5">5</button>',
        '    <button class="sector" data-sector="6">6</button>',
        '    <button class="sector" data-sector="7">7</button>',
        '    <button class="sector" data-sector="8">8</button>',
        '    <button class="sector" data-sector="9">9</button>',
        "  </div>",
        "</body>",
        "</html>",
        "",
      ].join("\n"),
      "style.css": [
        "body { font-family: system-ui, sans-serif; padding: 16px; }",
        "#grid {",
        "  display: grid;",
        "  grid-template-columns: repeat(3, 72px);",
        "  gap: 8px;",
        "  margin-top: 12px;",
        "}",
        ".sector {",
        "  height: 56px;",
        "  border: 2px solid #cbd5e1;",
        "  border-radius: 10px;",
        "  background: #f8fafc;",
        "  font-size: 18px;",
        "  cursor: pointer;",
        "  transition: background-color 0.15s ease;",
        "}",
        ".sector.bug {",
        "  background: #ef4444;",
        "  border-color: #b91c1c;",
        "  color: white;",
        "}",
        "",
      ].join("\n"),
      "app.js": [
        "/* app.js — pertahanan cyber. Susun logika lengkap di sini. */",
        "",
        "let skor = 0;",
        "let waktu = 8;",
        "",
        "// TODO 1: klik #mulai -> reset, setInterval serangan bug acak + setInterval hitung mundur",
        "",
        "",
        "// TODO 2: klik .sector -> bila classList memiliki 'bug', hapus & tambah skor",
        "",
        "",
        '// TODO 3: skor >= 3 -> #status berisi "Menang!", clearInterval semuanya',
        "",
        "",
        '// TODO 4: waktu <= 0 -> #status pesan kalah, stop semua interval',
        "",
        "",
      ].join("\n"),
    },
    objectives: [
      {
        id: "mulai-diklik",
        label: 'Tombol "Mulai Pertahanan" diklik (simulasi)',
        rule: { kind: "click", selector: "#mulai" },
      },
      {
        id: "serangan-mulai",
        label: "Bug mulai bermunculan acak setelah dimulai",
        rule: {
          kind: "waitFor",
          timeoutMs: 2500,
          test:
            'document.querySelectorAll(".sector.bug").length > 0 || "belum ada bug masuk — apakah setInterval serangan sudah berjalan?"',
        },
      },
      {
        id: "tembak-bug",
        label: "Menembak bug menambah skor",
        rule: {
          kind: "js",
          test:
            '(function () { var bug = document.querySelector(".sector.bug"); if (!bug) return "tidak ada bug aktif untuk ditembak"; var sebelum = Number(document.querySelector("#skor").textContent); bug.click(); var sesudah = Number(document.querySelector("#skor").textContent); return sesudah > sebelum || "skor tidak bertambah (tetap " + sesudah + ")"; })()',
        },
      },
      {
        id: "hitung-mundur",
        label: "Hitung mundur waktu berjalan (mulai dari 8)",
        rule: {
          kind: "waitFor",
          timeoutMs: 2500,
          test:
            'Number(document.querySelector("#waktu").textContent) < 8 || "hitung mundur belum berjalan"',
        },
      },
      {
        id: "kondisi-menang",
        label: '3 bug ditembak → "Menang!" tampil di status',
        rule: {
          kind: "waitFor",
          timeoutMs: 6500,
          test:
            '(function () { var bugs = document.querySelectorAll(".sector.bug"); for (var i = 0; i < bugs.length; i += 1) bugs[i].click(); var status = document.querySelector("#status").textContent; return status.indexOf("Menang") !== -1 || "skor sekarang " + document.querySelector("#skor").textContent + " — tembak 3 bug untuk menang"; })()',
        },
      },
    ],
    rewards: { coins: 550, xp: 300 },
    visualHook: "tower.dome",
    responsivePreview: false,
    visualNote: "Kubah perisai energi menyelimuti tower — serangan berhasil dipatahkan!",
    validationTimeoutMs: 15000,
  },
];
