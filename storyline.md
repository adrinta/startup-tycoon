# Master Game Blueprint: STARTUP TYCOON (Web-Dev Learning Game)

---

## 1. Narasi Utama (Plot Cerita)

Pemain berperan sebagai seorang lulusan IT idealis yang menemukan *server* peninggalan programer legenda bernama **"Cipher"**. Di dalamnya tersimpan cetak biru aplikasi revolusioner bernama **"Project X"** yang belum selesai.

Pemain memutuskan untuk membangun kembali *Project X* dari nol, mendirikan *startup*, melayani berbagai klien, merekrut tim, dan melakukan *pitching* ke investor. Perjalanan dimulai dari sebuah garasi sempit hingga bertransformasi menjadi perusahaan *Unicorn* bernilai triliunan rupiah dengan kantor puncak pencakar langit.

```
[ GARASI BERDEBU ] ──> [ CO-WORKING SPACE ] ──> [ HIGH-RISE TOWER ] ──> [ DATA CENTER PENTHOUSE ]
  (HTML: Fondasi)         (CSS: UI/UX)            (JS: Interaktivitas)       (PHP/DB: Backend)

```

---

## 2. Mekanisme Utama Gameplay

### Interface Tiga Panel (The Command Center)

Layar permainan dibagi menjadi tiga bagian utama yang saling terintegrasi secara *real-time*:

* **Layar Kiri (Visual Game Engine - Phaser.js):** Menampilkan animasi 2D Isometrik ruangan kantor, karakter pemain, NPC karyawan, dan infrastruktur fisik yang tumbuh seiring penyelesaian materi.
* **Layar Tengah (In-Game Editor - Monaco Editor):** Tempat pemain menulis kode HTML, CSS, JS, dan PHP secara langsung.
* **Layar Kanan (Live Preview & Holo-Codex):** *Iframe Sandbox* yang menayangkan hasil *render* kode pemain secara langsung, dilengkapi tab **Holo-Codex** (ensiklopedia materi ala W3Schools).

### Alur Siklus Permainan (Game Loop)

1. **Tiket Masuk (Ticket/Bounty):** Klien atau divisi internal memberikan tugas (*quest*) berupa masalah teknis web.
2. **Eksplorasi Teori:** Pemain membaca dokumentasi singkat dan contoh interaktif di **Holo-Codex**.
3. **Eksekusi Kode:** Pemain mengetik solusi kode di Monaco Editor.
4. **Validasi & Feed Visual:** Saat tombol **"Deploy Code"** ditekan:
* **Jika Kode Benar:** Animasi kantor diperbarui, metrik *Revenue* (Uang) dan *Active Users* (XP) meningkat.
* **Jika Kode Error:** Karakter *Bug* (serangga digital) muncul di layar game, dan terminal memberikan umpan balik logis tanpa *spoiler* jawaban.



### Ekonomi & Upgrade Sistem

* **Revenue (Uang Virtual):** Diperoleh dari penyelesaian tiket koding. Digunakan untuk membeli dekorasi kantor (kursi *ergonomis*, mesin *espresso*, tanaman hias) yang memberikan efek pasif (*buff*), seperti mempercepat validasi kode atau memberikan petunjuk tambahan saat *debugging*.
* **User Count (XP Level):** Menentukan reputasi perusahaan dan membuka babak baru serta jenis klien yang lebih besar.

### Karakter Companion (NPC)

* **Ada (Lead Engineer):** Mentor teknis yang membimbing struktur HTML dan logika JavaScript.
* **Zane (Head of Design):** Desainer perfeksionis yang memberikan tantangan CSS, responsivitas, dan estetika.
* **Mr. Root (Systems Architect):** Ahli keamanan siber yang membimbing arsitektur PHP, *session*, dan *database*.
* **Venture Capitalist (Boss Fight NPC):** Investor yang menguji kemampuan penuh pemain di akhir setiap babak.

---

## 3. Silabus & Detail Babak Permainan

### Babak 1: The Bootstrap

* **Lokasi Game:** Garasi Berdebu
* **Fokus Materi:** **HTML (Structure & Semantics)**
* **Tujuan Bisnis:** Membangun fondasi web dasar dan melayani UMKM lokal untuk mengumpulkan modal pertama.

| Misi | Nama Quest | Topik W3Schools | Instruksi Koding & Respons Visual Game |
| --- | --- | --- | --- |
| **1.1** | *Power On System* | Basic Structure (`<!DOCTYPE>`, `<html>`, `<head>`, `<body>`, `<title>`) | **Koding:** Menyusun dokumen HTML pertama untuk menyalakan komputer tua.<br>

<br>**Visual:** Monitor CRT tua di garasi menyala dan menampilkan terminal hijau. |
| **1.2** | *Profil Toko Kelontong* | Headings (`<h1>`-`<h6>`), Paragraphs (`<p>`), Formatting (`<b>`, `<i>`, `<mark>`) | **Koding:** Membuat judul usaha, deskripsi, dan menyoroti teks promo toko Pak Budi.<br>

<br>**Visual:** Banner fisik Toko Kelontong terpasang di papan simulasi garasi. |
| **1.3** | *Katalog & Media* | Attributes (`src`, `alt`, `href`), Images (`<img>`), Links (`<a>`) | **Koding:** Memasukkan gambar produk dan link kontak WhatsApp.<br>

<br>**Visual:** Rak garasi terisi sampel produk dan kabel jaringan terhubung. |
| **1.4** | *Laporan Keuangan* | Tables (`<table>`, `<tr>`, `<th>`, `<td>`, `colspan`, `rowspan`) | **Koding:** Membuat tabel pembukuan arus kas sederhana dengan penggabungan sel.<br>

<br>**Visual:** Papan tulis garasi terisi grafik keuangan dan catatan transaksi. |
| **1.5** | *Formulir Klien* | Forms (`<form>`), Inputs (`text`, `email`, `select`, `checkbox`, `button`) | **Koding:** Membangun form pemesanan jasa dengan berbagai tipe input data.<br>

<br>**Visual:** Mesin cetak di garasi mengeluarkan lembaran kertas pesanan baru. |
| **1.6** | *Restrukturisasi DOM* | Semantic HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`) | **Koding:** Merapikan tag acak menjadi struktur *semantic* yang rapi.<br>

<br>**Visual:** Garasi yang berantakan mendadak terorganisir rapi dengan zona kerja khusus. |

* **Boss Fight Babak 1 (Audit Investor Pertama):** Pemain harus membangun halaman *Landing Page* utuh untuk produk *Startup* dari dokumen instruksi tanpa ada kesalahan tag yang tidak tertutup (*unclosed tags*).

---

### Babak 2: Seed Funding

* **Lokasi Game:** Co-Working Space
* **Fokus Materi:** **CSS (Styling, Layout & Responsive Design)**
* **Tujuan Bisnis:** Merombak tampilan produk agar menarik minat *Angel Investor* dan meningkatkan retensi pengguna.

| Misi | Nama Quest | Topik W3Schools | Instruksi Koding & Respons Visual Game |
| --- | --- | --- | --- |
| **2.1** | *Identity Rebranding* | CSS Selectors (Element, Class, ID), Colors (HEX, RGB), Backgrounds | **Koding:** Mengubah warna latar, teks, dan memberi identitas visual menggunakan *class* dan *id*.<br>

<br>**Visual:** Cat dinding *co-working space* berubah dan logo perusahaan menyala. |
| **2.2** | *Ergonomi Ruangan* | CSS Box Model (`content`, `padding`, `border`, `margin`, `box-sizing`) | **Koding:** Mengatur jarak antar elemen agar tampilan tidak menumpuk.<br>

<br>**Visual:** Animasi X-Ray memperlihatkan area *padding/margin* gedung yang merenggang. |
| **2.3** | *Tipografi Modern* | Fonts, Text Styling, Google Fonts, `display` (`block`, `inline`, `none`) | **Koding:** Mengimpor *font* kustom dan menyembunyikan elemen dekorasi yang mengganggu.<br>

<br>**Visual:** Papan petunjuk kantor berubah menjadi tipografi modern yang elegan. |
| **2.4** | *Penataan Antarmuka* | CSS Position (`static`, `relative`, `absolute`, `fixed`, `sticky`), `z-index` | **Koding:** Mengunci posisi *navigation bar* di atas layar dan mengatur layer.<br>

<br>**Visual:** Aset meja kerja dan komputer melayang dan mengunci di posisi presisi. |
| **2.5** | *Pabrik Produk* | Flexbox (`flex-direction`, `justify-content`, `align-items`) & CSS Grid | **Koding:** Menyusun kartu produk secara sejajar dan meretangkan layout sesuai grid.<br>

<br>**Visual:** Rak kargo barang di kantor tersusun rapi secara otomatis. |
| **2.6** | *Pitch Deck Mobile* | Media Queries (`@media`), Responsive Web Design, Transitions & Animations | **Koding:** Membuat tampilan menyesuaikan layar HP dan menambahkan efek *hover* halus.<br>

<br>**Visual:** Investor mencoba aplikasi di tablet; nilai investasi naik. |

* **Boss Fight Babak 2 (Pitching Day):** Pemain diberi waktu untuk mengubah halaman web statis menjadi *web responsif* yang tampil sempurna di layar *desktop*, *tablet*, maupun *mobile*.

---

### Babak 3: Growth Hack

* **Lokasi Game:** Gedung Pencakar Langit (Lantai 15)
* **Fokus Materi:** **JavaScript (Logic, DOM & Asynchronous)**
* **Tujuan Bisnis:** Membangun logika interaktif, mengolah data pengguna secara *real-time*, dan mengalahkan kompetitor.

| Misi | Nama Quest | Topik W3Schools | Instruksi Koding & Respons Visual Game |
| --- | --- | --- | --- |
| **3.1** | *Kalkulator Pendapatan* | JS Variables (`let`, `const`), Data Types, Operators, Functions | **Koding:** Membuat fungsi perhitungan matematika untuk menghitung total pendapatan.<br>

<br>**Visual:** Dasbor angka pendapatan di dinding kantor berhitung cepat secara otomatis. |
| **3.2** | *Sistem Alarm Otomatis* | Conditionals (`if-else`, `switch`), Control Flow | **Koding:** Menulis logika untuk mendeteksi stok habis atau batas kuota penggunaan.<br>

<br>**Visual:** Lampu darurat kantor menyala merah jika data simulasi bernilai *error*. |
| **3.3** | *Analisis Massal* | Arrays, Loops (`for`, `forEach`, `map`), Objects | **Koding:** Memproses daftar email pengguna dan memfilter pengguna aktif.<br>

<br>**Visual:** Ban berjalan (*conveyor belt*) memilah berkas data pengguna dengan cepat. |
| **3.4** | *Interaksi Pengguna* | DOM Manipulation (`getElementById`, `querySelector`), Event Listeners (`click`, `submit`) | **Koding:** Mengubah teks halaman dan memicu aksi saat tombol diklik pengguna.<br>

<br>**Visual:** Avatar pengguna virtual berdatangan dan menekan tombol di dalam game. |
| **3.5** | *Filter Keamanan Form* | Form Validation, String Methods, Error Handling (`try-catch`) | **Koding:** Memeriksa format email dan mencegah pengiriman form jika data kosong.<br>

<br>**Visual:** Robot *gatekeeper* di pintu masuk kantor menghadang berkas yang rusak. |
| **3.6** | *Koneksi Server Luar* | Asynchronous JS, Promises, `async/await`, Fetch API, JSON | **Koding:** Mengambil data cuaca/kurs mata uang dari API eksternal secara *async*.<br>

<br>**Visual:** Layar monitor kantor menampilkan grafik *live feed* data dari luar server. |

* **Boss Fight Babak 3 (Cyber Attack Defense):** Pemain harus menggunakan manipulasi DOM dan *event handling* untuk mematikan gelombang serangan *bug* yang masuk secara acak sebelum waktu habis.

---

### Babak 4: The Unicorn

* **Lokasi Game:** Data Center & Executive Penthouse
* **Fokus Materi:** **PHP & Database (Backend Development via PHP-WASM)**
* **Tujuan Bisnis:** Membangun *backend* tangguh, sistem akun aman, dan mengelola *database* skala besar menuju IPO.

| Misi | Nama Quest | Topik W3Schools | Instruksi Koding & Respons Visual Game |
| --- | --- | --- | --- |
| **4.1** | *Inisialisasi Server* | PHP Syntax, Echo, Variables, Strings, Array Handling | **Koding:** Menulis skrip PHP pertama untuk me-render konten dinamis dari server.<br>

<br>**Visual:** Ruangan *Server Rack* raksasa menyala dengan deretan lampu LED hijau. |
| **4.2** | *Pengolahan Transaksi* | PHP Superglobals (`$_GET`, `$_POST`), Form Handling, Data Sanitization | **Koding:** Menangkap data dari formulir HTML dan membersihkan karakter berbahaya.<br>

<br>**Visual:** Pipa data transparan mengalirkan paket informasi dari luar ke dalam server. |
| **4.3** | *Brankas Sesi* | PHP Sessions (`$_SESSION`), Cookies (`$_COOKIE`), Password Hashing | **Koding:** Membuat sistem *login*, menyimpan sesi pengguna, dan mengenkripsi kata sandi.<br>

<br>**Visual:** Pintu baja brankas kantor terkunci otomatis dengan sistem pemindai retina. |
| **4.4** | *Gudang Data Digital* | Database Connection (PDO/MySQLi), CRUD (Create, Read, Update, Delete) | **Koding:** Menhubungkan skrip PHP ke database dan menjalankan perintah SQL dasar.<br>

<br>**Visual:** Robot gudang mengambil dan menyusun kotak-kotak data dari rak SQL. |
| **4.5** | *Perisai SQL Injection* | Prepared Statements, Parameter Binding, File Upload Handling | **Koding:** Mengubah query biasa menjadi *Prepared Statements* untuk mencegah peretasan.<br>

<br>**Visual:** Lapisan perisai energi biru menyelimuti seluruh server gedung penthouse. |
| **4.6** | *Integrasi Full-Stack* | Full-Stack Integration (HTML + CSS + JS Fetch + PHP Backend) | **Koding:** Menghubungkan *frontend* JS dengan *backend* PHP secara utuh tanpa *reload*.<br>

<br>**Visual:** Gedung *Startup* berubah menjadi menara *Unicorn* berteknologi tinggi. |

* **Boss Fight Babak 4 (Penawaran Saham Perdana / IPO):** Pemain membangun aplikasi web *Full-Stack* mini (Sistem Registrasi/Login + Database Produk + Dynamic Render + UI Responsif). Keberhasilan meluluskan aplikasi ini akan memicu adegan akhir (*Ending Cinematic*) di mana saham perusahaan resmi melantai di bursa efek global.