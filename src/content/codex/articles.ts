export interface CodexSection {
  heading: string;
  body: string;
  code?: string;
}

export interface CodexArticle {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  sections: CodexSection[];
}

/**
 * Holo-Codex Babak 1 — materi HTML bergaya ensiklopedia singkat
 * (ala W3Schools) dengan contoh kode interaktif.
 */
export const CODEX_ARTICLES: CodexArticle[] = [
  {
    id: "html-basic",
    title: "Struktur Dasar Dokumen HTML",
    summary:
      "Kerangka wajib setiap halaman web: deklarasi dokumen, elemen html, head, dan body.",
    tags: ["html", "dasar", "struktur"],
    sections: [
      {
        heading: "Deklarasi <!DOCTYPE html>",
        body:
          "Baris pertama sebuah dokumen HTML adalah deklarasi doctype. Aturan HTML5 hanya membutuhkan satu baris sederhana ini untuk memberi tahu browser bahwa dokumen menggunakan standar HTML modern.",
        code: "<!DOCTYPE html>",
      },
      {
        heading: "Elemen <html>, <head>, dan <body>",
        body:
          "Seluruh dokumen dibungkus elemen <html>. Di dalamnya ada dua bagian besar: <head> menyimpan metadata seperti <title> (judul di tab browser) dan karakter encoding, sedangkan <body> menyimpan semua konten yang terlihat pengguna.",
        code: [
          "<!DOCTYPE html>",
          '<html lang="id">',
          "  <head>",
          '    <meta charset="utf-8">',
          "    <title>Judul Halaman</title>",
          "  </head>",
          "  <body>",
          "    <h1>Konten yang terlihat</h1>",
          "  </body>",
          "</html>",
        ].join("\n"),
      },
      {
        heading: "Elemen, tag, dan nesting",
        body:
          "Elemen terdiri dari tag pembuka dan penutup, misal <p>...</p>. Elemen boleh bersarang (nested) di dalam elemen lain, tetapi tidak boleh saling menyilang. Tag yang tidak ditutup dapat membuat browser menebak-nebak struktur dan merusak tata letak.",
      },
    ],
  },
  {
    id: "html-text",
    title: "Heading, Paragraf & Formatting Teks",
    summary: "Menyusun hierarki judul dan memberi penekanan pada teks penting.",
    tags: ["html", "teks", "heading", "paragraf"],
    sections: [
      {
        heading: "Heading <h1> sampai <h6>",
        body:
          "<h1> adalah judul paling utama dan hanya boleh satu per halaman agar struktur jelas. Level heading menurun berurutan (<h2>, <h3>, ...) membentuk kerangka konten yang mudah dibaca mesin pencari dan pembaca layar.",
        code: "<h1>Judul Utama</h1>\n<h2>Sub Bagian</h2>\n<h3>Sub-sub Bagian</h3>",
      },
      {
        heading: "Paragraf <p>",
        body:
          "Teks paragraf ditulis di dalam elemen <p>. Browser menambahkan jarak antar paragraf secara otomatis. Jangan gunakan <br> berulang-ulang untuk memisahkan paragraf.",
        code: "<p>Deskripsi singkat tentang produk kami.</p>\n<p>Paragraf kedua berisi informasi lain.</p>",
      },
      {
        heading: "Formatting: <b>, <strong>, <i>, <em>, <mark>",
        body:
          "<strong> menandai teks penting (biasanya tebal) dan <em> menandai penekanan (biasanya miring). <b> dan <i> hanya mengubah tampilan tanpa makna semantik. <mark> menyorot teks seperti stabilo — cocok untuk promo atau kata kunci.",
        code: "<p><strong>Sembako Lengkap</strong> dengan harga <em>bersahabat</em>.</p>\n<p><mark>Diskon 10%</mark> minggu ini!</p>",
      },
    ],
  },
  {
    id: "html-links-media",
    title: "Atribut, Gambar & Tautan",
    summary: "Menghubungkan halaman dengan gambar produk dan tautan kontak.",
    tags: ["html", "img", "a", "atribut"],
    sections: [
      {
        heading: "Anatomi atribut",
        body:
          "Atribut memberi informasi tambahan pada elemen dan ditulis di dalam tag pembuka dengan format nama=\"nilai\". Contoh: <img src=\"produk.jpg\"> memiliki atribut src berisi alamat file gambar.",
        code: '<img src="produk.jpg" alt="Foto produk">',
      },
      {
        heading: "Gambar <img> dan atribut alt",
        body:
          "Elemen <img> tidak memiliki tag penutup. Atribut src wajib berisi alamat gambar; atribut alt berisi deskripsi gambar. Alt dipakai pembaca layar dan muncul saat gambar gagal dimuat — jadi jangan pernah dikosongkan.",
        code: '<img src="beras.jpg" alt="Karung beras 5 kg">\n<img src="minyak.jpg" alt="Botol minyak goreng 1 liter">',
      },
      {
        heading: "Tautan <a> dan atribut href",
        body:
          "Elemen <a> membuat tautan. Atribut href menampung tujuan: alamat lengkap (https://...), alamat relatif (kontak.html), anchor dalam halaman (#kontak), atau skema khusus seperti wa.me dan tel: untuk kontak langsung.",
        code: '<a href="https://wa.me/6281234567890">Hubungi via WhatsApp</a>\n<a href="#kontak">Lihat kontak</a>',
      },
    ],
  },
  {
    id: "html-tables",
    title: "Tabel & Penggabungan Sel",
    summary: "Menyajikan data tabular seperti laporan keuangan toko.",
    tags: ["html", "table", "colspan", "rowspan"],
    sections: [
      {
        heading: "Struktur dasar tabel",
        body:
          "Tabel dibangun dari elemen <table> yang berisi baris <tr>. Di dalam baris, <th> adalah sel header (otomatis tebal & rata tengah) dan <td> adalah sel data biasa.",
        code: [
          "<table>",
          "  <tr>",
          "    <th>Menu</th>",
          "    <th>Harga</th>",
          "  </tr>",
          "  <tr>",
          "    <td>Kopi</td>",
          "    <td>Rp 15.000</td>",
          "  </tr>",
          "</table>",
        ].join("\n"),
      },
      {
        heading: "colspan dan rowspan",
        body:
          "Atribut colspan menggabungkan beberapa kolom secara horizontal, sedangkan rowspan menggabungkan beberapa baris secara vertikal. Nilai keduanya adalah jumlah sel yang digabung, misal colspan=\"2\" berarti dua kolom.",
        code: [
          "<table>",
          '  <tr><th colspan="2">Laporan Arus Kas</th></tr>',
          "  <tr>",
          '    <td rowspan="2">Penjualan</td>',
          "    <td>Rp 2.500.000</td>",
          "  </tr>",
          "  <tr><td>Rp 1.200.000</td></tr>",
          "</table>",
        ].join("\n"),
      },
    ],
  },
  {
    id: "html-forms",
    title: "Formulir & Input Data",
    summary: "Menangkap data pengguna untuk pemesanan, survei, dan kontak.",
    tags: ["html", "form", "input", "select", "checkbox"],
    sections: [
      {
        heading: "Elemen <form>",
        body:
          "Formulir dibungkus elemen <form>. Semua kontrol input di dalamnya akan dikirim saat pengguna menekan tombol submit. Atribut action dan method mengatur ke mana dan bagaimana data dikirim (dalam gim ini diproses oleh sandbox).",
        code: '<form action="/pesan" method="post">\n</form>',
      },
      {
        heading: "Berbagai tipe <input>",
        body:
          "Input memiliki banyak tipe sesuai data yang diharapkan: text untuk nama, email dengan validasi format otomatis, checkbox untuk persetujuan, radio untuk pilihan tunggal, dan number untuk angka. Gunakan atribut name agar data terbaca saat dikirim.",
        code: '<input type="text" name="nama">\n<input type="email" name="email">\n<input type="checkbox" name="setuju">',
      },
      {
        heading: "Dropdown <select> dan tombol",
        body:
          "<select> membuat daftar pilihan yang berisi <option>. Satu option dapat ditandai sebagai pilihan awal. Tombol <button> dengan type=\"submit\" mengirim seluruh formulir.",
        code: [
          '<select name="layanan">',
          '  <option value="antar">Antar Barang</option>',
          '  <option value="belanja">Titip Belanja</option>',
          "</select>",
          "",
          '<button type="submit">Kirim</button>',
        ].join("\n"),
      },
      {
        heading: "Label untuk aksesibilitas",
        body:
          "Elemen <label> menghubungkan teks keterangan dengan input melalui atribut for (sama dengan id input). Membungkus input di dalam label juga sah. Label membantu pengguna pembaca layar dan membuat area klik lebih luas.",
        code: '<label for="nama">Nama Lengkap</label>\n<input type="text" id="nama">',
      },
    ],
  },
  {
    id: "html-semantic",
    title: "HTML Semantics & Kode yang Rapi",
    summary:
      "Mengganti tumpukan <div> dengan elemen bermakna: header, nav, main, section, footer.",
    tags: ["html", "semantic", "struktur"],
    sections: [
      {
        heading: "Kenapa elemen semantik?",
        body:
          "Elemen seperti <header> dan <footer> memberi tahu browser, mesin pencari, dan pembaca layar peran setiap bagian halaman. Halaman dengan struktur semantik lebih mudah dirawat dan lebih baik untuk SEO.",
      },
      {
        heading: "Kamus elemen layout",
        body:
          "<header> berisi pembuka seperti logo dan judul. <nav> berisi kumpulan tautan navigasi (umumnya di dalam header). <main> membungkus konten utama dan hanya boleh ada satu per halaman. <section> memisahkan bagian konten bertema sama. <footer> berisi penutup seperti hak cipta dan kontak.",
        code: [
          "<body>",
          "  <header>",
          "    <h1>Project X</h1>",
          "    <nav>",
          '      <a href="#fitur">Fitur</a>',
          "    </nav>",
          "  </header>",
          "  <main>",
          "    <section>Konten utama...</section>",
          "  </main>",
          "  <footer>© 2026 Project X</footer>",
          "</body>",
        ].join("\n"),
      },
      {
        heading: "Urutan yang masuk akal",
        body:
          "Susun halaman mengikuti alur baca pengguna: header di atas, main di tengah, footer di bawah. Validator gim memeriksa hubungan induk-anak elemen ini secara langsung pada DOM tree.",
      },
    ],
  },
  {
    id: "html-debug",
    title: "Membaca Umpan Balik Validator",
    summary: "Cara memahami pesan terminal saat kode belum lolos audit.",
    tags: ["html", "debug", "terminal"],
    sections: [
      {
        heading: "Objektif vs jawaban",
        body:
          "Daun merah berarti belum lolos dan pesan detailnya menjelaskan MASALAH, bukan jawaban. Contoh: 'atribut \"alt\" masih kosong' berarti kamu perlu mengisi deskripsi gambar, tetapi isi deskripsinya kamu yang menentukan.",
      },
      {
        heading: "Kesalahan tersembunyi: tag tidak tertutup",
        body:
          "Tag yang tidak ditutup sering tidak memunculkan error di browser — browser menutupnya otomatis secara menebak. Akibatnya elemen berikutnya bisa 'nyasar' menjadi anak elemen sebelumnya, dan pemeriksaan childOf/order akan gagal. Periksa kembali pasangan setiap tag pembuka.",
      },
      {
        heading: "Console panel",
        body:
          "Tab Console menampilkan console.log, warning, dan error JavaScript dari kode-mu. Gunakan console.log untuk memeriksa nilai variabel, dan baca pesan error dengan teliti sebelum mengubah kode.",
      },
    ],
  },
];

export function getCodexArticle(id: string): CodexArticle | undefined {
  return CODEX_ARTICLES.find((article) => article.id === id);
}
