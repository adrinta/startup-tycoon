import type { QuestFileMap } from "@/content/quests/schema";
import { PHASE_2_QUESTS } from "@/content/quests/phase2";

/**
 * Solusi kanonik untuk pengujian otomatis (hanya digunakan oleh test,
 * TIDAK di-import oleh kode aplikasi sehingga tidak ikut ter-bundle
 * ke browser pengguna).
 *
 * Setiap solusi harus lulus SEMUA objective non-viewport misi yang
 * bersangkutan; objective ber-viewport (media query) diverifikasi di
 * browser sungguhan dan dicek keberadaan @media-nya oleh test.
 */

/* ------------------------------- Babak 1 (HTML) ------------------------------- */

const PHASE_1_SOLUTIONS: Record<string, QuestFileMap> = {
  "1.1": {
    "index.html": [
      "<!DOCTYPE html>",
      '<html lang="id">',
      "<head>",
      '  <meta charset="utf-8">',
      "  <title>Project X</title>",
      "</head>",
      "<body>",
      "  <h1>Project X</h1>",
      "</body>",
      "</html>",
    ].join("\n"),
  },
  "1.2": {
    "index.html": [
      "<!DOCTYPE html>",
      '<html lang="id">',
      "<head>",
      '  <meta charset="utf-8">',
      "  <title>Toko Kelontong Pak Budi</title>",
      "</head>",
      "<body>",
      "  <h1>Toko Kelontong Pak Budi</h1>",
      "  <p>Toko Kelontong Pak Budi menyediakan <strong>Sembako Lengkap</strong> dengan harga bersahabat.</p>",
      "  <p>Lokasinya strategis di <em>Depan Stasiun</em> dan buka setiap hari pukul 06.00 - 21.00.</p>",
      "  <p><mark>Diskon 10%</mark> untuk pembelian pertama pelanggan baru!</p>",
      "</body>",
      "</html>",
    ].join("\n"),
  },
  "1.3": {
    "index.html": [
      "<!DOCTYPE html>",
      '<html lang="id">',
      "<head>",
      '  <meta charset="utf-8">',
      "  <title>Toko Kelontong Pak Budi</title>",
      "</head>",
      "<body>",
      "  <h1>Toko Kelontong Pak Budi</h1>",
      "  <p>Toko menyediakan kebutuhan sehari-hari dengan harga bersahabat.</p>",
      '  <img src="https://example.com/beras.jpg" alt="Karung beras 5 kg">',
      '  <img src="https://example.com/minyak.jpg" alt="Botol minyak goreng 1 liter">',
      '  <a href="https://wa.me/6281234567890">Hubungi via WhatsApp</a>',
      "</body>",
      "</html>",
    ].join("\n"),
  },
  "1.4": {
    "index.html": [
      "<!DOCTYPE html>",
      '<html lang="id">',
      "<head>",
      '  <meta charset="utf-8">',
      "  <title>Laporan Keuangan Toko</title>",
      "</head>",
      "<body>",
      "  <h1>Laporan Arus Kas</h1>",
      "  <table>",
      '    <tr><th colspan="2">Laporan Arus Kas Bulan Ini</th></tr>',
      "    <tr><th>Kategori</th><th>Jumlah</th></tr>",
      '    <tr><td rowspan="2">Penjualan</td><td>Rp 2.500.000</td></tr>',
      "    <tr><td>Rp 1.200.000</td></tr>",
      "    <tr><td>Belanja Stok</td><td>Rp 3.000.000</td></tr>",
      "    <tr><td>Laba Bersih</td><td>Rp 700.000</td></tr>",
      "  </table>",
      "</body>",
      "</html>",
    ].join("\n"),
  },
  "1.5": {
    "index.html": [
      "<!DOCTYPE html>",
      '<html lang="id">',
      "<head>",
      '  <meta charset="utf-8">',
      "  <title>Pemesanan - Toko Kelontong Pak Budi</title>",
      "</head>",
      "<body>",
      "  <h1>Formulir Pemesanan Jasa Antar</h1>",
      "  <form>",
      '    <label for="nama">Nama Lengkap</label>',
      '    <input type="text" id="nama" name="nama">',
      '    <label for="email">Email</label>',
      '    <input type="email" id="email" name="email">',
      '    <label for="layanan">Jenis Layanan</label>',
      '    <select id="layanan" name="layanan">',
      '      <option value="antar">Antar Barang</option>',
      '      <option value="belanja">Titip Belanja</option>',
      "    </select>",
      "    <label>",
      '      <input type="checkbox" name="setuju"> Saya setuju dengan syarat dan ketentuan',
      "    </label>",
      '    <button type="submit">Kirim Pesanan</button>',
      "  </form>",
      "</body>",
      "</html>",
    ].join("\n"),
  },
  "1.6": {
    "index.html": [
      "<!DOCTYPE html>",
      '<html lang="id">',
      "<head>",
      '  <meta charset="utf-8">',
      "  <title>Project X</title>",
      "</head>",
      "<body>",
      "  <header>",
      '    <div class="logo">Project X</div>',
      "    <nav>",
      '      <a href="#beranda">Beranda</a>',
      '      <a href="#layanan">Layanan</a>',
      '      <a href="#kontak">Kontak</a>',
      "    </nav>",
      "  </header>",
      "  <main>",
      '    <section id="beranda">Kami membangun produk digital untuk UMKM.</section>',
      '    <section id="layanan">Layanan pengembangan web, katalog online, dan pembukuan.</section>',
      "  </main>",
      "  <footer>© 2026 Project X</footer>",
      "</body>",
      "</html>",
    ].join("\n"),
  },
  "1.7": {
    "index.html": [
      "<!DOCTYPE html>",
      '<html lang="id">',
      "<head>",
      '  <meta charset="utf-8">',
      "  <title>Project X — Platform UMKM Digital</title>",
      "</head>",
      "<body>",
      "  <header>",
      "    <h2>Project X</h2>",
      "    <nav>",
      '      <a href="#fitur">Fitur</a>',
      '      <a href="#kontak">Kontak</a>',
      "    </nav>",
      "  </header>",
      "  <main>",
      "    <section>",
      "      <h1>Bawa UMKM Indonesia ke Dunia Digital</h1>",
      "      <p>Project X membantu toko kelontong go digital dalam hitungan menit.</p>",
      "      <button>Mulai Gratis</button>",
      "    </section>",
      "    <section>",
      "      <h3>Katalog Online</h3>",
      "      <p>Etalase produk yang bisa diakses pelanggan kapan saja.</p>",
      "    </section>",
      "    <section>",
      "      <h3>Pembukuan Otomatis</h3>",
      "      <p>Catat arus kas tanpa buku besar manual.</p>",
      "    </section>",
      "    <section>",
      "      <h3>Pengiriman Terintegrasi</h3>",
      "      <p>Hubungkan pesanan dari WhatsApp ke kurir lokal.</p>",
      "    </section>",
      "    <section>",
      "      <h2>Hubungi Kami</h2>",
      "      <form>",
      '        <label for="email">Email Anda</label>',
      '        <input type="email" id="email" name="email">',
      '        <label for="pesan">Pesan</label>',
      '        <textarea id="pesan" name="pesan"></textarea>',
      '        <button type="submit">Kirim Pesan</button>',
      "      </form>",
      "    </section>",
      "  </main>",
      "  <footer>© 2026 Project X — Seluruh hak cipta dilindungi.</footer>",
      "</body>",
      "</html>",
    ].join("\n"),
  },
};

/* ------------------------------- Babak 2 (CSS) -------------------------------- */

function starterOf(questId: string): QuestFileMap {
  const quest = PHASE_2_QUESTS.find((candidate) => candidate.id === questId);
  if (!quest) throw new Error(`Starter quest ${questId} tidak ditemukan`);
  return quest.starterFiles;
}

const CSS_IMPORT_FONT =
  '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap");';

const R_21 = [
  "body { background-color: #f1f5f9; }",
  "",
  ".brand { color: #6d28d9; }",
  "",
  "#hero { background-color: #ede9fe; }",
  "",
  "p { color: #475569; }",
].join("\n");

const R_22 = [
  R_21,
  "",
  ".card {",
  "  padding: 24px;",
  "  border: 1px solid #cbd5e1;",
  "  margin-bottom: 16px;",
  "  box-sizing: border-box;",
  "}",
  "",
  "#hero { padding: 48px 32px; }",
].join("\n");

const R_23 = [
  CSS_IMPORT_FONT,
  "",
  R_22,
  "",
  'body { font-family: "Inter", system-ui, sans-serif; }',
  "",
  "h1 { font-size: 40px; }",
  "",
  ".draft-note { display: none; }",
  "",
  ".badge { display: inline-block; text-transform: uppercase; }",
].join("\n");

const R_24 = [
  R_23,
  "",
  ".site-header { position: sticky; top: 0; }",
  "",
  ".card { position: relative; }",
  "",
  ".card .badge { position: absolute; top: 8px; right: 8px; z-index: 2; }",
  "",
  ".help-bubble { position: fixed; bottom: 16px; right: 16px; }",
].join("\n");

const R_25 = [
  R_24,
  "",
  ".feature-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; }",
  "",
  ".product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }",
].join("\n");

const R_26 = [
  R_25,
  "",
  ".product-card { transition: transform 0.3s ease; }",
  "",
  "@media (max-width: 768px) {",
  "  .feature-row { flex-direction: column; }",
  "  .product-grid { grid-template-columns: 1fr; }",
  "  h1 { font-size: 32px; }",
  "  #hero { padding: 32px 24px; }",
  "}",
].join("\n");

const BOSS_CSS = [
  "body { background-color: #f8fafc; }",
  "",
  ".brand { color: #6d28d9; }",
  "",
  ".site-header { position: sticky; top: 0; }",
  "",
  "h1 { font-size: 48px; }",
  "",
  ".features { display: flex; gap: 24px; }",
  "",
  ".pricing { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }",
  "",
  ".price-card { padding: 24px; border-radius: 16px; }",
  "",
  ".cta { transition: background-color 0.2s ease; }",
  "",
  "@media (max-width: 768px) {",
  "  h1 { font-size: 32px; }",
  "  .features { flex-direction: column; }",
  "  .pricing { grid-template-columns: 1fr; }",
  "}",
].join("\n");

const PHASE_2_SOLUTIONS: Record<string, QuestFileMap> = {
  "2.1": { ...starterOf("2.1"), "style.css": R_21 },
  "2.2": { ...starterOf("2.2"), "style.css": R_22 },
  "2.3": { ...starterOf("2.3"), "style.css": R_23 },
  "2.4": { ...starterOf("2.4"), "style.css": R_24 },
  "2.5": { ...starterOf("2.5"), "style.css": R_25 },
  "2.6": { ...starterOf("2.6"), "style.css": R_26 },
  "2.7": { ...starterOf("2.7"), "style.css": BOSS_CSS },
};

export const QUEST_SOLUTIONS: Record<string, QuestFileMap> = {
  ...PHASE_1_SOLUTIONS,
  ...PHASE_2_SOLUTIONS,
};

/** Varian rusak untuk memastikan validator menangkap kesalahan. */
export const QUEST_BROKEN_SAMPLES: Record<
  string,
  { files: QuestFileMap; expectFailed: string }
> = {
  "1.1": {
    files: { "index.html": "<html><head><title>Project X</title></head><body><h1>Hi</h1></body></html>" },
    expectFailed: "doctype",
  },
  "1.3": {
    files: {
      "index.html": [
        "<!DOCTYPE html>",
        "<html><body>",
        '<img src="a.jpg" alt="">',
        '<img src="b.jpg" alt="">',
        '<a href="https://wa.me/628">Hubungi via WhatsApp</a>',
        "</body></html>",
      ].join("\n"),
    },
    expectFailed: "img-alt",
  },
  "1.6": {
    files: {
      "index.html": [
        "<!DOCTYPE html>",
        "<html><body>",
        '<div class="atas">Menu</div>',
        '<div class="isi">Isi</div>',
        '<div class="bawah">© 2026 Project X</div>',
        "</body></html>",
      ].join("\n"),
    },
    expectFailed: "header-exists",
  },
  "2.2": {
    files: { ...starterOf("2.2"), "style.css": R_21 },
    expectFailed: "card-padding",
  },
  "2.3": {
    files: { ...starterOf("2.3"), "style.css": R_22 },
    expectFailed: "font-inter",
  },
  "2.5": {
    files: { ...starterOf("2.5"), "style.css": R_24 },
    expectFailed: "feature-flex",
  },
};
