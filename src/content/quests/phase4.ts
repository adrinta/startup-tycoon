import type { Quest } from "@/content/quests/schema";

const MR_ROOT = {
  name: "Mr. Root",
  role: "Systems Architect",
  avatar: "🛡️",
};

const ADA = {
  name: "Ada",
  role: "Lead Engineer · Mentor Teknis",
  avatar: "👩‍💻",
};

const SEED_PRODUK =
  "CREATE TABLE produk (id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT, harga INTEGER);" +
  "INSERT INTO produk (nama, harga) VALUES ('Kopi Arabika', 95000), ('Teh Premium', 42000);";

const SEED_PRODUK_UMKM =
  "CREATE TABLE produk (id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT, harga INTEGER);" +
  "INSERT INTO produk (nama, harga) VALUES ('Beras Premium', 68000), ('Minyak Goreng', 21000), ('Gula Pasir', 15500);";

const SEED_PENGGUNA =
  "CREATE TABLE pengguna (id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT, email TEXT, sandi TEXT);" +
  "CREATE TABLE produk (id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT, harga INTEGER);" +
  "INSERT INTO produk (nama, harga) VALUES ('Kopi Arabika', 95000), ('Teh Premium', 42000);";

/**
 * Babak 4 — The Unicorn (Data Center & Executive Penthouse)
 * Materi: PHP & Database via PHP-WASM. Semua ujian dijalankan sebagai
 * request HTTP sungguhan melalui PHPRequestHandler (GET/POST, session, SQLite).
 */
export const PHASE_4_QUESTS: Quest[] = [
  {
    id: "4.1",
    order: 22,
    phase: 4,
    chapter: "Babak 4: The Unicorn",
    location: "Data Center · Executive Penthouse",
    isBoss: false,
    title: "Inisialisasi Server",
    client: MR_ROOT,
    brief:
      "Selamat datang di ruang server, Founder. Semua yang kamu tulis di tab index.php kini dieksekusi oleh mesin PHP sungguhan di browser. Mulai dari dasar: variabel, array, echo, dan loop untuk merender konten dinamis.",
    hint: 'PHP selalu dibuka dengan `<?php`. Array ditulis `$produk = ["a", "b"];`. Loop `foreach ($produk as $item) { echo "<li>$item</li>"; }` — perhatikan bahwa PHP MENYISIPKAN nilai ke string di dalam kutip ganda.',
    instructions: [
      'Buat array `$produk` berisi "Katalog", "Pembukuan", "Pengiriman".',
      'Echo heading `<h1>Project X</h1>`.',
      "Loop `foreach` untuk mencetak `<li>` tiap item produk.",
      'Cetak jumlah fitur dengan `count($produk)` dalam teks "3 fitur aktif" (angka dihitung otomatis).',
    ],
    codexRefs: ["php-dasar"],
    starterFiles: {
      "index.php": [
        "<?php",
        "// TODO 1: array $produk berisi tiga nama fitur",
        "",
        "",
        "// TODO 2: echo <h1>Project X</h1>",
        "",
        "",
        "// TODO 3: loop foreach mencetak <li> untuk tiap produk",
        "",
        "",
        '// TODO 4: teks "N fitur aktif" memakai count($produk)',
        "",
      ].join("\n"),
    },
    phpScenarios: [{ id: "utama", method: "GET" }],
    objectives: [
      {
        id: "render-project-x",
        label: "Server merender heading Project X",
        rule: { kind: "php", scenario: "utama", expectOutputContains: ["<h1>Project X</h1>"] },
      },
      {
        id: "loop-produk",
        label: "Loop mencetak ketiga fitur sebagai <li>",
        rule: {
          kind: "php",
          scenario: "utama",
          expectOutputContains: ["<li>Katalog</li>", "<li>Pembukuan</li>", "<li>Pengiriman</li>"],
        },
      },
      {
        id: "hitung-fitur",
        label: "Jumlah fitur dihitung dengan count() (3 fitur aktif)",
        rule: { kind: "php", scenario: "utama", expectOutputContains: ["3 fitur aktif"] },
      },
      {
        id: "tidak-bocor",
        label: "Kode PHP mentah tidak bocor ke output",
        rule: { kind: "php", scenario: "utama", expectOutputNotContains: ["<?php"] },
      },
    ],
    rewards: { coins: 380, xp: 190 },
    visualHook: "penthouse.rack",
    visualNote: "Rak server raksasa menyala — deretan lampu LED hijau memenuhi ruangan.",
    responsivePreview: false,
  },
  {
    id: "4.2",
    order: 23,
    phase: 4,
    chapter: "Babak 4: The Unicorn",
    location: "Data Center · Executive Penthouse",
    isBoss: false,
    title: "Pengolahan Transaksi",
    client: MR_ROOT,
    brief:
      "Data dari dunia luar masuk sebagai request. Tangkap data formulir via $_POST, bersihkan sebelum ditampilkan (htmlspecialchars), dan render ulang halaman. Coba kirim form di preview — paket datanya akan kulihat mengalir ke server.",
    hint: "Cek `$_SERVER['REQUEST_METHOD'] === 'POST'` untuk membedakan kiriman form. Ambil nilai dengan `$_POST['nama'] ?? ''`. Selalu bungkus output pengguna dengan `htmlspecialchars()` agar tag berbahaya ditampilkan sebagai teks, bukan dieksekusi.",
    instructions: [
      'Tampilkan `<form method="post">` dengan input `name="nama"` dan tombol kirim saat halaman dibuka (GET).',
      "Saat POST: ambil `$_POST['nama']`, bersihkan dengan `htmlspecialchars`, lalu tampilkan.",
      'Input berbahaya seperti `<b>Budi</b>` harus muncul sebagai teks (`&lt;b&gt;Budi`), bukan HTML tebal.',
    ],
    codexRefs: ["php-form"],
    starterFiles: {
      "index.php": [
        "<?php",
        "// TODO 1: bila GET, tampilkan <form method=\"post\"> berisi input name=\"nama\" + tombol",
        "",
        "",
        "// TODO 2: bila POST, ambil $_POST['nama'], bersihkan dengan htmlspecialchars, tampilkan",
        "",
      ].join("\n"),
    },
    phpScenarios: [
      { id: "form", method: "GET" },
      { id: "kirim-aman", method: "POST", post: { nama: "Andi" } },
      { id: "kirim-bahaya", method: "POST", post: { nama: "<b>Budi</b>" } },
    ],
    objectives: [
      {
        id: "form-tampil",
        label: "Formulir pemesanan tampil saat halaman dibuka",
        rule: { kind: "php", scenario: "form", expectSelector: "form" },
      },
      {
        id: "data-tampil",
        label: "Nama dari form tampil setelah dikirim (POST)",
        rule: { kind: "php", scenario: "kirim-aman", expectOutputContains: ["Andi"] },
      },
      {
        id: "input-berbahaya",
        label: "Input berbahaya di-escape menjadi teks",
        rule: {
          kind: "php",
          scenario: "kirim-bahaya",
          expectOutputContains: ["&lt;b&gt;Budi"],
          expectOutputNotContains: ["<b>Budi"],
        },
      },
    ],
    rewards: { coins: 400, xp: 200 },
    visualHook: "penthouse.pipes",
    visualNote: "Pipa data transparan mengalirkan paket informasi ke dalam server.",
    responsivePreview: false,
  },
  {
    id: "4.3",
    order: 24,
    phase: 4,
    chapter: "Babak 4: The Unicorn",
    location: "Data Center · Executive Penthouse",
    isBoss: false,
    title: "Brankas Sesi",
    client: MR_ROOT,
    brief:
      "Server harus mengingat siapa yang sudah login tanpa mengirim password berulang kali. Pelajari session: kunci brankas digital kita. Password sendiri tidak boleh disimpan mentah — hash dengan password_hash.",
    hint: "Mulai dengan `session_start()`. Simpan penanda login di `$_SESSION['login']`. Saat password benar: `$_SESSION['hash'] = password_hash($sandi, PASSWORD_DEFAULT);` dan tampilkan \"Login berhasil\". Request GET berikutnya akan otomatis membaca session yang sama.",
    instructions: [
      "Panggil `session_start()` di awal skrip.",
      'Jika `$_POST[\'sandi\']` sama dengan "rahasia123": simpan `$_SESSION["login"] = true` dan tampilkan "Login berhasil".',
      "Jika password salah: tampilkan pesan mengandung \"Salah\".",
      'Saat halaman dibuka ulang (GET) dan sesi masih aktif: tampilkan "Halo".',
      "Password mentah tidak boleh muncul di halaman.",
    ],
    codexRefs: ["php-session"],
    starterFiles: {
      "index.php": [
        "<?php",
        "// TODO 1: session_start()",
        "",
        "",
        '// TODO 2: POST -> cek $_POST["sandi"]; benar: $_SESSION["login"] = true + "Login berhasil"',
        "",
        "",
        '// TODO 3: POST salah -> "Salah"',
        "",
        "",
        '// TODO 4: GET saat $_SESSION["login"] aktif -> "Halo"',
        "",
      ].join("\n"),
    },
    phpScenarios: [
      { id: "login", method: "POST", post: { sandi: "rahasia123" }, reset: true },
      { id: "sesi-berlanjut", method: "GET" },
      { id: "salah", method: "POST", post: { sandi: "salah" }, reset: true },
    ],
    objectives: [
      {
        id: "login-berhasil",
        label: "Password benar diterima & login berhasil",
        rule: { kind: "php", scenario: "login", expectOutputContains: ["Login berhasil"] },
      },
      {
        id: "sandi-tidak-bocor",
        label: "Password mentah tidak pernah tampil di halaman",
        rule: { kind: "php", scenario: "login", expectOutputNotContains: ["rahasia123"] },
      },
      {
        id: "sesi-bertahan",
        label: "Session bertahan di request berikutnya (Halo Founder)",
        rule: { kind: "php", scenario: "sesi-berlanjut", expectOutputContains: ["Halo"] },
      },
      {
        id: "sandi-salah",
        label: "Password salah ditolak dengan pesan yang tepat",
        rule: { kind: "php", scenario: "salah", expectOutputContains: ["Salah"] },
      },
    ],
    rewards: { coins: 420, xp: 210 },
    visualHook: "penthouse.vault",
    visualNote: "Pintu brankas baja bergerak menutup — pemindai retina aktif.",
    responsivePreview: false,
  },
  {
    id: "4.4",
    order: 25,
    phase: 4,
    chapter: "Babak 4: The Unicorn",
    location: "Data Center · Executive Penthouse",
    isBoss: false,
    title: "Gudang Data Digital",
    client: MR_ROOT,
    brief:
      "Sudah waktunya data hidup permanen. Sambungkan PHP ke database SQLite lewat PDO: baca isi gudang, tampilkan dalam tabel, dan simpan produk baru dari form. Robot gudang siap bekerja.",
    hint: 'Koneksi: `$pdo = new PDO("sqlite:/tmp/app.sqlite");`. Baca: `$pdo->query("SELECT ...")->fetchAll(PDO::FETCH_ASSOC)`. Simpan: siapkan `$pdo->prepare("INSERT ...")` lalu `execute([...])`.',
    instructions: [
      'Sambungkan ke database dengan `new PDO("sqlite:/tmp/app.sqlite")`.',
      "Tampilkan semua produk dalam `<table>` (kolom Produk & Harga).",
      'Form POST untuk menambah produk: simpan dengan prepared statement `INSERT INTO produk (nama, harga) VALUES (?, ?)`.',
      "Setelah ditambah, produk baru harus tampil di tabel dan tercatat permanen.",
    ],
    codexRefs: ["php-pdo"],
    starterFiles: {
      "index.php": [
        "<?php",
        '// TODO 1: koneksi $pdo = new PDO("sqlite:/tmp/app.sqlite")',
        "",
        "",
        "// TODO 2: bila POST, simpan produk baru (nama + harga) dengan prepared statement",
        "",
        "",
        "// TODO 3: baca semua produk & tampilkan dalam <table>",
        "",
      ].join("\n"),
    },
    phpScenarios: [
      { id: "gudang", method: "GET", reset: true, seedSql: SEED_PRODUK_UMKM },
      {
        id: "tambah",
        method: "POST",
        post: { nama: "Teh Botol", harga: "5000" },
        dbQuery: "SELECT nama FROM produk",
      },
    ],
    objectives: [
      {
        id: "tabel-produk",
        label: "Produk dari database tampil dalam tabel",
        rule: {
          kind: "php",
          scenario: "gudang",
          expectSelector: "table",
          expectOutputContains: ["Beras Premium", "Minyak Goreng", "Gula Pasir"],
        },
      },
      {
        id: "tambah-tampil",
        label: "Produk baru tampil setelah disimpan",
        rule: { kind: "php", scenario: "tambah", expectOutputContains: ["Teh Botol"] },
      },
      {
        id: "tambah-tersimpan",
        label: "Produk baru tercatat permanen di database",
        rule: { kind: "php", scenario: "tambah", expectDbContains: ['"nama":"Teh Botol"'] },
      },
    ],
    rewards: { coins: 440, xp: 220 },
    visualHook: "penthouse.shelf",
    visualNote: "Robot gudang menyusun kotak-kotak data di rak SQL.",
    responsivePreview: false,
  },
  {
    id: "4.5",
    order: 26,
    phase: 4,
    chapter: "Babak 4: The Unicorn",
    location: "Data Center · Executive Penthouse",
    isBoss: false,
    title: "Perisai SQL Injection",
    client: MR_ROOT,
    brief:
      "Ini ujian keamanan paling penting: query yang menyisipkan input secara langsung bisa DIBAJAK. Aku akan menyerangmu dengan `admin' OR '1'='1`. Ubah query rentan menjadi prepared statement agar seranganku gagal.",
    hint: 'Query rentan: `$pdo->query("... WHERE nama = \'$nama\'")`. Ubah menjadi: `$stmt = $pdo->prepare("SELECT nama FROM pengguna WHERE nama = ? AND sandi = ?"); $stmt->execute([$nama, $sandi]);` — tanda `?` membuat input TIDAK PERNAH dibaca sebagai perintah SQL.',
    instructions: [
      'Pada kode login rentan di starter, ganti query menjadi prepared statement dengan parameter binding (`?`).',
      'Login benar (admin / admin123) tetap harus berhasil menampilkan "Selamat datang".',
      "Serangan `admin' OR '1'='1` harus GAGAL (tidak ada \"Selamat datang\") dan menampilkan pesan gagal.",
    ],
    codexRefs: ["php-keamanan"],
    starterFiles: {
      "index.php": [
        "<?php",
        "$pdo = new PDO('sqlite:/tmp/app.sqlite');",
        "$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);",
        "",
        "$pesan = '';",
        "if ($_SERVER['REQUEST_METHOD'] === 'POST') {",
        "  $nama = $_POST['nama'] ?? '';",
        "  $sandi = $_POST['sandi'] ?? '';",
        "  // RENTAN: input disisipkan langsung ke query — ubah ke prepared statement!",
        "  $hasil = $pdo->query(\"SELECT nama FROM pengguna WHERE nama = '$nama' AND sandi = '$sandi'\")->fetch();",
        "  $pesan = $hasil ? 'Selamat datang, ' . htmlspecialchars($hasil['nama']) . '!' : 'Login gagal.';",
        "}",
        "?>",
        "<!DOCTYPE html>",
        '<html lang="id">',
        "<head><meta charset=\"utf-8\"><title>Panel Admin</title></head>",
        "<body>",
        "  <h1>Panel Admin</h1>",
        '  <form method="post">',
        '    <input name="nama" placeholder="Nama">',
        '    <input name="sandi" placeholder="Sandi">',
        '    <button type="submit">Masuk</button>',
        "  </form>",
        '  <p id="pesan"><?php echo $pesan; ?></p>',
        "</body>",
        "</html>",
        "",
      ].join("\n"),
    },
    phpScenarios: [
      { id: "login-benar", method: "POST", post: { nama: "admin", sandi: "admin123" }, reset: true,
        seedSql: "CREATE TABLE pengguna (id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT, email TEXT, sandi TEXT); INSERT INTO pengguna (nama, email, sandi) VALUES ('admin', 'admin@pixel.id', 'admin123');" },
      { id: "serangan", method: "POST", post: { nama: "admin' OR '1'='1", sandi: "x" }, reset: true,
        seedSql: "CREATE TABLE pengguna (id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT, email TEXT, sandi TEXT); INSERT INTO pengguna (nama, email, sandi) VALUES ('admin', 'admin@pixel.id', 'admin123');" },
    ],
    objectives: [
      {
        id: "login-normal",
        label: "Login sah (admin/admin123) tetap berhasil",
        rule: { kind: "php", scenario: "login-benar", expectOutputContains: ["Selamat datang"] },
      },
      {
        id: "injeksi-gagal",
        label: "Serangan `admin' OR '1'='1` gagal menembus perisai",
        rule: {
          kind: "php",
          scenario: "serangan",
          expectOutputNotContains: ["Selamat datang"],
          expectOutputContains: ["gagal"],
        },
      },
    ],
    rewards: { coins: 460, xp: 230 },
    visualHook: "penthouse.shield",
    visualNote: "Lapisan perisai energi biru menyelimuti seluruh server penthouse.",
    responsivePreview: false,
  },
  {
    id: "4.6",
    order: 27,
    phase: 4,
    chapter: "Babak 4: The Unicorn",
    location: "Data Center · Executive Penthouse",
    isBoss: false,
    title: "Integrasi Full-Stack",
    client: ADA,
    brief:
      "Frontend dan backend harus bicara! Buat halaman yang mengambil data produk dari server via fetch TANPA reload — endpoint JSON dari PHP yang sama. Klik tombolnya di preview dan lihat daftar produk muncul dari server.",
    hint: 'Endpoint JSON: `if ($_GET["action"] === "produk") { header("Content-Type: application/json"); echo json_encode($data); exit; }`. Di sisi JS: `fetch("index.php?action=produk").then(res => res.json())` lalu render hasilnya ke DOM.',
    instructions: [
      'Bila `$_GET["action"] === "produk"`: kirim JSON data produk (`json_encode`) lalu `exit` — tanpa HTML pembungkus.',
      'Halaman utama: tombol `#muat` + panel `#daftar-produk`.',
      'Saat tombol diklik: `fetch("index.php?action=produk")`, parse JSON, render tiap produk menjadi paragraf di `#daftar-produk`.',
    ],
    codexRefs: ["php-fullstack"],
    starterFiles: {
      "index.php": [
        "<?php",
        '$pdo = new PDO(\'sqlite:/tmp/app.sqlite\');',
        "",
        "// TODO 1: bila GET action=produk -> header JSON + echo json_encode(produk) + exit",
        "",
        "",
        "// TODO 2: halaman utama dengan tombol #muat dan div #daftar-produk",
        "",
        "",
        "// TODO 3: skrip JS fetch('index.php?action=produk') lalu render ke #daftar-produk",
        "",
      ].join("\n"),
    },
    phpScenarios: [
      { id: "halaman", method: "GET", reset: true, seedSql: SEED_PRODUK },
      { id: "api", method: "GET", get: { action: "produk" } },
    ],
    objectives: [
      {
        id: "panel-daftar",
        label: "Panel #daftar-produk tersedia di halaman",
        rule: { kind: "php", scenario: "halaman", expectSelector: "#daftar-produk" },
      },
      {
        id: "skrip-fetch",
        label: "Skrip memanggil API lewat fetch & action=produk",
        rule: {
          kind: "php",
          scenario: "halaman",
          expectOutputContains: ["fetch(", "action=produk"],
        },
      },
      {
        id: "api-json",
        label: "Endpoint API mengembalikan JSON produk",
        rule: {
          kind: "php",
          scenario: "api",
          expectOutputContains: ['"nama":"Kopi Arabika"', '"harga":95000'],
        },
      },
      {
        id: "api-bersih",
        label: "Endpoint API hanya JSON, tanpa pembungkus HTML",
        rule: { kind: "php", scenario: "api", expectOutputNotContains: ["<html"] },
      },
    ],
    rewards: { coins: 480, xp: 240 },
    visualHook: "penthouse.beacon",
    visualNote: "Suar unicorn menyala di puncak gedung — sinyal menyala ke seluruh dunia.",
    responsivePreview: false,
  },
  {
    id: "4.7",
    order: 28,
    phase: 4,
    chapter: "Babak 4: The Unicorn",
    location: "Data Center · Executive Penthouse",
    isBoss: true,
    title: "Penawaran Saham Perdana (IPO)",
    client: {
      name: "Vera",
      role: "Venture Capitalist · Boss Fight",
      avatar: "🦈",
    },
    brief:
      "Inilah momen terakhir, Founder. Sebelum saham Project X melantai di bursa, aku perlu melihat aplikasi full-stack nyata: registrasi dengan sandi ter-hash, login dengan session, dan API produk. Tunjukkan bahwa kamu bisa menyatukan SEMUA materi yang telah dipelajari. Audit penuh berjalan beberapa saat.",
    hint: "Susun bertahap: (1) session_start + koneksi PDO; (2) endpoint `?action=produk` JSON; (3) aksi `register` dengan password_hash + prepared INSERT; (4) aksi `login` dengan SELECT prepared + password_verify + $_SESSION. Render pesan dan form di halaman.",
    instructions: [
      "Halaman menampilkan form registrasi (minimal `<form>`).",
      "POST aksi `register` (nama, email, sandi): simpan dengan `password_hash` + prepared statement, tampilkan pesan memuat \"berhasil\".",
      "Akun baru benar-benar tersimpan di tabel `pengguna` (sandi tersimpan sebagai hash 60 karakter, bukan teks mentah).",
      "POST aksi `login` dengan kredensial benar: gunakan `password_verify` + `$_SESSION`, tampilkan \"Selamat datang\".",
      "Login dengan sandi salah ditolak (pesan memuat \"salah\").",
      'Endpoint `?action=produk` mengembalikan JSON produk.',
    ],
    codexRefs: ["php-dasar", "php-form", "php-session", "php-pdo", "php-keamanan", "php-fullstack"],
    starterFiles: {
      "index.php": [
        "<?php",
        "// TODO 1: session_start() + koneksi PDO",
        "",
        "",
        "// TODO 2: endpoint ?action=produk -> JSON + exit",
        "",
        "",
        "// TODO 3: aksi register -> password_hash + prepared INSERT + pesan berhasil",
        "",
        "",
        "// TODO 4: aksi login -> SELECT prepared + password_verify + $_SESSION['login']",
        "",
        "",
        "// TODO 5: render halaman: form register, form login, pesan, dan sapaan bila login",
        "",
      ].join("\n"),
    },
    phpScenarios: [
      { id: "registrasi", method: "GET", reset: true, seedSql: SEED_PENGGUNA },
      {
        id: "daftar",
        method: "POST",
        post: { aksi: "register", nama: "Founder", email: "founder@projectx.id", sandi: "unicorn123" },
        dbQuery: "SELECT email, length(sandi) AS n FROM pengguna",
      },
      {
        id: "masuk",
        method: "POST",
        post: { aksi: "login", email: "founder@projectx.id", sandi: "unicorn123" },
      },
      {
        id: "masuk-salah",
        method: "POST",
        post: { aksi: "login", email: "founder@projectx.id", sandi: "salah" },
      },
      { id: "api", method: "GET", get: { action: "produk" } },
    ],
    objectives: [
      {
        id: "form-registrasi",
        label: "Formulir registrasi tampil",
        rule: { kind: "php", scenario: "registrasi", expectSelector: "form" },
      },
      {
        id: "registrasi-berhasil",
        label: "Registrasi berhasil dengan pesan sukses",
        rule: { kind: "php", scenario: "daftar", expectOutputContains: ["berhasil"] },
      },
      {
        id: "akun-tersimpan-hash",
        label: "Akun tersimpan di DB dengan sandi ter-hash (bukan teks mentah)",
        rule: {
          kind: "php",
          scenario: "daftar",
          expectDbContains: ['"email":"founder@projectx.id"', '"n":60'],
        },
      },
      {
        id: "login-session",
        label: "Login benar + session aktif (Selamat datang)",
        rule: { kind: "php", scenario: "masuk", expectOutputContains: ["Selamat datang"] },
      },
      {
        id: "login-salah",
        label: "Sandi salah ditolak dengan pesan jelas",
        rule: { kind: "php", scenario: "masuk-salah", expectOutputContains: ["salah"] },
      },
      {
        id: "api-produk",
        label: "API produk mengembalikan JSON (Kopi Arabika)",
        rule: { kind: "php", scenario: "api", expectOutputContains: ['"nama":"Kopi Arabika"'] },
      },
    ],
    rewards: { coins: 800, xp: 450 },
    visualHook: "penthouse.unicorn",
    visualNote: "IPO sukses! Patung unicorn emas berdiri megah di lobi penthouse.",
    responsivePreview: false,
    validationTimeoutMs: 20000,
  },
];
