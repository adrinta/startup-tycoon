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

const HTML_ARTICLES: CodexArticle[] = [
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

const CSS_ARTICLES: CodexArticle[] = [
  {
    id: "css-selectors",
    title: "Selector, Warna & Latar belakang",
    summary: "Memilih elemen CSS dengan tepat: element, class, dan id.",
    tags: ["css", "dasar", "selector", "warna"],
    sections: [
      {
        heading: "Anatomi aturan CSS",
        body:
          "Satu aturan CSS terdiri dari selector (target) dan declaration block (properti + nilai di dalam kurung kurawal). Setiap declaration diakhiri titik koma.",
        code: "selector {\n  properti: nilai;\n}\n\n/* contoh */\np { color: #475569; }",
      },
      {
        heading: "Element, class, dan id",
        body:
          "Selector element menarget semua tag tersebut (`p`, `h1`). Kelas dipakai berulang ditandai titik (`.brand`) dan bisa dipasang ke banyak elemen. Id unik ditandai pagar (`#hero`) dan hanya boleh satu di satu halaman. Kelas + id lebih spesifik daripada element.",
        code: 'body { background-color: #f1f5f9; }\n\n.brand { color: #6d28d9; }\n\n#hero { background-color: #ede9fe; }',
      },
      {
        heading: "Warna: HEX, RGB, dan nama",
        body:
          "Warna bisa ditulis `#rrggbb`, `rgb(red, green, blue)`, atau nama seperti `navy`. HEX `#6d28d9` berarti ungu tua. Untuk latar gunakan `background-color`, untuk teks gunakan `color`.",
        code: ".badge {\n  background-color: #ede9fe; /* latar */\n  color: #6d28d9;            /* teks  */\n}",
      },
    ],
  },
  {
    id: "css-boxmodel",
    title: "Box Model & box-sizing",
    summary: "Rahasia tata letak rapi: content, padding, border, dan margin.",
    tags: ["css", "box model", "layout"],
    sections: [
      {
        heading: "Empat lapis kotak",
        body:
          "Di CSS, setiap elemen adalah kotak berlapis: **content** (isi), **padding** (ruang dalam), **border** (garis tepi), dan **margin** (jarak ke elemen lain). Padding memberi napas ke dalam; margin memberi jarak ke luar.",
        code: ".card {\n  padding: 24px;          /* ruang dalam */\n  border: 1px solid #cbd5e1; /* garis tepi */\n  margin-bottom: 16px;     /* jarak ke luar */\n}",
      },
      {
        heading: "Shorthand: satu baris untuk empat sisi",
        body:
          "`padding: 24px;` berarti keempat sisi 24px. Dua nilai berarti atas-bawah dan kiri-kanan: `padding: 48px 32px;` → atas/bawah 48px, kiri/kanan 32px. Urutan penuh empat nilai: atas, kanan, bawah, kiri (searah jarum jam).",
        code: "padding: 24px;          /* semua sisi */\npadding: 48px 32px;     /* atas-bawah | kiri-kanan */\npadding: 8px 16px 8px 16px; /* atas kanan bawah kiri */",
      },
      {
        heading: "box-sizing: border-box",
        body:
          "Secara default lebar elemen dihitung dari content saja, sehingga padding/border menambah ukuran total. `box-sizing: border-box` membuat padding & border ikut dihitung di dalam lebar — ukuran elemen jadi stabil dan prediktabel.",
        code: ".card {\n  box-sizing: border-box;\n}",
      },
    ],
  },
  {
    id: "css-typography",
    title: "Font, Teks & Display",
    summary: "Tipografi modern: import font, ukuran, hingga menyembunyikan elemen.",
    tags: ["css", "font", "tipografi"],
    sections: [
      {
        heading: "Mengimpor font (Google Fonts)",
        body:
          "@import harus berada di baris paling atas file CSS. Setelah diimpor, pasang `font-family` dengan nama fontnya, sertakan cadangan (fallback) setelah koma.",
        code: '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap");\n\nbody {\n  font-family: "Inter", sans-serif;\n}',
      },
      {
        heading: "Ukuran dan gaya teks",
        body:
          "`font-size` mengatur besar teks (px atau rem; 1rem = 16px). `font-weight` mengatur ketebalan. `text-transform: uppercase` mengubah tampilan jadi HURUF BESAR tanpa mengubah isi aslinya.",
        code: "h1 { font-size: 40px; font-weight: 800; }\n.badge { text-transform: uppercase; }",
      },
      {
        heading: "display: block, inline-block, none",
        body:
          "`block` selalu mulai di baris baru dan memenuhi lebar. `inline-block` tersusun sejajar tapi bisa diberi padding/ukuran. `none` menghilangkan elemen dari tata letak (tidak memakan ruang) — beda dengan `visibility: hidden` yang tetap menyisakan ruang.",
        code: ".badge { display: inline-block; }\n.draft-note { display: none; }",
      },
    ],
  },
  {
    id: "css-position",
    title: "Position, Sticky & z-index",
    summary: "Mengunci elemen persis di tempat yang kamu inginkan.",
    tags: ["css", "position", "layout"],
    sections: [
      {
        heading: "Lima nilai position",
        body:
          "`static` = aliran normal (default). `relative` = digeser dari posisi normalnya, dan menjadi acuan anak `absolute`. `absolute` = menempel pada induk terdekat yang ber-position. `fixed` = menempel pada jendela browser (tidak ikut digulir). `sticky` = aliran normal, tapi mengunci saat mencapai ambang (mis. `top: 0`).",
        code: ".site-header {\n  position: sticky;\n  top: 0;\n}\n\n.card { position: relative; }\n.card .badge { position: absolute; top: 8px; right: 8px; }\n.help-bubble { position: fixed; bottom: 16px; right: 16px; }",
      },
      {
        heading: "z-index: siapa di atas?",
        body:
          "Elemen ber-position bisa saling menumpuk. `z-index` lebih besar berarti lebih dekat ke mata. z-index hanya bekerja pada elemen non-static.",
        code: ".card .badge {\n  position: absolute;\n  z-index: 2; /* di atas konten kartu */\n}",
      },
    ],
  },
  {
    id: "css-flex-grid",
    title: "Flexbox & CSS Grid",
    summary: "Dua mesin tata letak modern: sebaris fleksibel dan grid kolom.",
    tags: ["css", "flexbox", "grid", "layout"],
    sections: [
      {
        heading: "Flexbox untuk baris",
        body:
          "`display: flex` mengubah anak-anak elemen menjadi item fleksibel dalam satu baris. `justify-content` mengatur sebaran horizontal, `align-items` perataan vertikal, dan `gap` jarak antar item.",
        code: ".feature-row {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 16px;\n}",
      },
      {
        heading: "CSS Grid untuk kolom presisi",
        body:
          "`display: grid` bekerja dengan mendefinisikan kolom. `repeat(3, 1fr)` berarti tiga kolom sama rata (1fr = satu bagian bebas). `gap: 16px` memberi jarak antar kolom dan baris sekaligus.",
        code: ".product-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}",
      },
    ],
  },
  {
    id: "css-responsive",
    title: "Media Queries & Transitions",
    summary: "Satu halaman untuk semua layar — plus efek halus saat interaksi.",
    tags: ["css", "responsive", "media query", "animasi"],
    sections: [
      {
        heading: "Media query: aturan bersyarat",
        body:
          "`@media (max-width: 768px)` membungkus aturan yang hanya aktif saat lebar viewport ≤ 768px. Tulis aturan desktop terlebih dahulu, lalu penyesuaian mobile di dalam media query (mobile-last).",
        code: ".feature-row { display: flex; }\n\n@media (max-width: 768px) {\n  .feature-row { flex-direction: column; }\n  h1 { font-size: 32px; }\n}",
      },
      {
        heading: "Menumpuk di mobile",
        body:
          "Trik responsive paling sering: flex-direction dari `row` menjadi `column`, dan grid dari `repeat(3, 1fr)` menjadi `1fr`. Gunakan tombol viewport Mobile di panel preview untuk memeriksa hasilnya.",
      },
      {
        heading: "Transitions untuk interaksi halus",
        body:
          "`transition` membuat perubahan properti (mis. warna saat hover) berjalan mulus, bukan melompat. `transition: transform 0.3s ease;` berarti durasi 0,3 detik dengan kurva ease.",
        code: ".product-card {\n  transition: transform 0.3s ease;\n}\n\n.product-card:hover {\n  transform: translateY(-4px);\n}",
      },
    ],
  },
];

export const CODEX_ARTICLES: CodexArticle[] = [...HTML_ARTICLES, ...CSS_ARTICLES];

export function getCodexArticle(id: string): CodexArticle | undefined {
  return CODEX_ARTICLES.find((article) => article.id === id);
}
