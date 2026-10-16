# Startup Tycoon

Game edukasi pemodelan web **full-stack** (HTML, CSS, JavaScript, PHP) berbungkus simulasi bisnis: kamu memulai dari garasi berdebu dan tumbuh menjadi startup *unicorn*. Setiap kode yang benar mengubah ruangan kantor virtual secara langsung.

Dokumen acuan: [`Startup Tycoon.md`](./Startup%20Tycoon.md) (PRD) dan [`storyline.md`](./storyline.md) (blueprint cerita & silabus).

## Status: Milestone 4 — Babak 2: Seed Funding (selesai)

> Tiga babak dapat dimainkan: Babak 1 (HTML, Garasi), Babak 2 (CSS, Co-Working Space) — termasuk boss *Pitching Day* dengan audit 3 viewport. Aplikasi tetap berjalan sempurna dalam Mode Lokal tanpa konfigurasi cloud.

### Gameplay & Sandbox (M1)

- **The Command Center** — layar tiga panel: ruangan game (kiri), Monaco Editor (tengah), preview + audit + Holo-Codex (kanan).
- **Quest Engine** — misi 1.1–1.6 + Boss Fight "Audit Investor" dengan pembukaan bertahap (misi berikutnya terkunci sampai misi sebelumnya tuntas).
- **Sandbox HTML** — kode dieksekusi di `<iframe sandbox="allow-scripts allow-forms">` tanpa akses ke halaman utama; console dan error ditangkap dan dikirim via `postMessage` bernonce.
- **Validasi otomatis tanpa spoiler** — aturan JSON (`doctype`, `dom`, `attr`, `text`, `childOf`, `order`) dievaluasi **di dalam sandbox** memakai DOM sungguhan, dengan pesan detail yang menjelaskan masalah, bukan jawaban.
- **Pratinjau otomatis + Deploy Code** — preview dan checklist objektif berjalan otomatis (debounce 1 detik); tombol **Deploy Code** (atau `Ctrl/⌘ + Enter`) melakukan audit resmi dan membagikan reward.
- **Ekonomi lokal** — Revenue (koin) dan Active Users (XP) dengan level perusahaan, tersimpan di `localStorage`.
- **Holo-Codex** — 7 artikel materi HTML ala W3Schools yang terhubung ke tiap misi.

### Game Layer (M2)

- **Ruangan Phaser.js 2D isometrik** — garasi digambar secara prosedural (tanpa file aset): lantai papan-kotak, dua dinding, dan properti (meja+monitor, banner, rak produk, papan tulis, printer, zona kerja, trofi) yang muncul dengan animasi saat misinya selesai.
- **NPC Ada** — klik untuk berkenalan/berdialog; bila buff "Petunjuk dari Ada" aktif, ia membacakan petunjuk misi yang sedang dikerjakan.
- **Bug swarm** — audit yang gagal memunculkan bug yang merayap di ruangan garasi; otomatis terbang saat misi diselesaikan.
- **Toko dekorasi & buff pasif** — 7 barang (Karpet, Tanaman, Lemari, Lampu, Kursi, Espresso, Server Rack) dengan efek nyata: XP +5/10/15%, Koin +5/10%, pratinjau otomatis lebih cepat (1 dtk → 0,6 dtk), dan petunjuk misi. Barang yang dibeli langsung tampil di ruangan pada posisi otomatisnya. Total harga katalog sengaja lebih besar dari total reward agar pemain harus memilih.
- **Event bus tetap sama** — React tetap pemegang sumber kebenaran (zustand); scene Phaser hanya menyinkronkan visual (kontrak `quest:completed`, `bug:spawn`, dst. dari M1 tidak berubah).
- **Tema terang** — antarmuka cerah dengan aksen cyan. Palet "Cyberpunk" gelap lama tetap tersimpan pada blok `.dark` di `globals.css`; tambahkan kembali kelas `dark` di `<html>` (`layout.tsx`) bila ingin mengaktifkannya.

### Cloud & Sosial (M3)

- **Google SSO via Supabase** — login satu klik (personal/email kampus) dengan sesi berbasis cookie lewat `src/proxy.ts` (Proxy Next 16). Ada pembatasan domain kampus opsional (`NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS`).
- **Onboarding pendiri** — halaman `/onboarding`: nama startup + avatar emoji; tampil di papan peringkat.
- **Sinkronisasi progres lintas perangkat** — saat login pertama, progres lokal & cloud di-merge (union misi/dekorasi, revenue/XP = terbesar), lalu setiap perubahan ekonomi di-push dengan debounce 1,5 dtk. Aman offline — gagal jaringan dicoba ulang saat ada perubahan berikutnya.
- **Papan peringkat** (`/leaderboard`) — top 50 berdasarkan Revenue (XP sebagai penentu seri), barismu disorot "Kamu", halaman di-streaming (Partial Prerender).
- **Prisma ORM 7 + driver adapter `pg`** — singleton lazy (`getPrisma()`), transaksi untuk tulis snapshot, katalog item di-upsert otomatis saat sync.
- **Degradasi anggun** — tanpa env cloud: tombol Masuk menampilkan penjelasan Mode Lokal, API menjawab 503 `unconfigured`, halaman lain tetap berfungsi penuh.

### Babak 2 & Alat Belajar CSS (M4)

- **7 misi CSS** — 2.1 Identity Rebranding (selector & warna), 2.2 Ergonomi Ruangan (box model), 2.3 Tipografi Modern (font & display), 2.4 Penataan Antarmuka (position & z-index), 2.5 Pabrik Produk (Flexbox & Grid), 2.6 Pitch Deck Mobile (media query & transition), dan boss **2.7 Pitching Day** (12 objektif lintas 3 viewport). Editor kini multi-file: `index.html` + `style.css`.
- **Validasi computed style sungguhan** — aturan baru `computed` (nilai akhir setelah cascade: warna, padding, position, dst.) dan `allOf` (gabungan beberapa syarat); dijalankan di dalam sandbox yang sama. Warna dinormalisasi HEX↔rgb, kolom Grid dihitung dari `repeat(N, 1fr)`.
- **Audit per-viewport** — objective bisa ditandai `@ 1280px` / `@ 390px`; tombol **Deploy** menjalankan audit di ketiga ukuran (iframe di-resize bergantian), sementara pratinjau otomatis hanya memeriksa viewport aktif. Chip `@ Npx` tampil di checklist.
- **X-Ray Box Model** — tombol di toolbar preview menyuntikkan overlay margin (oranye), border (kuning), padding (hijau), dan content (biru) ke setiap elemen ber-box, lengkap dengan legenda; ikut ter-refresh saat halaman diubah.
- **Pemilih viewport** — Fit / Desktop 1280 / Tablet 768 / Mobile 390 dengan zoom-to-fit otomatis di panel sempit.
- **Co-Working Space** — ruangan Phaser berpindah panggung saat memasuki Babak 2: palet dinding/lantai hangat + 7 properti baru (papan neon, beanbag, poster, jam dinding, rak kargo, tablet demo, trofi pitching) yang muncul per misi. Barang toko ikut pindah lokasi.
- **Tiket per babak** — daftar misi dikelompokkan per babak dengan teaser Babak 3 (JavaScript).

## Menjalankan

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

| Perintah | Kegunaan |
| --- | --- |
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Build produksi + typecheck |
| `pnpm start` | Jalankan hasil build |
| `pnpm test` | 117 test: integritas quest, evaluator (dom/gaya/computed), viewport, sandbox end-to-end, ekonomi/buff, sync, domain email |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (termasuk aturan React Compiler) |
| `pnpm db:push` | Dorong schema Prisma ke database (butuh `DATABASE_URL`/`DIRECT_URL`) |
| `pnpm db:seed` | Seed katalog dekorasi ke `inventory_items` (opsional — sync meng-upsert otomatis) |

## Arsitektur Singkat

```
src/
├─ proxy.ts                 # Next 16 Proxy: refresh sesi Supabase
├─ app/
│  ├─ page.tsx              # landing · play/ · login/ · onboarding/ · leaderboard/
│  ├─ auth/callback/        # penukaran kode OAuth Google -> sesi
│  └─ api/                  # progress · profile · leaderboard (route handlers)
├─ content/
│  ├─ quests/               # konten misi + schema zod + fixture solusi
│  ├─ shop/                 # katalog dekorasi + buff
│  └─ codex/                # artikel Holo-Codex
├─ features/
│  ├─ editor/ · sandbox/ · validation/ · quests/ · codex/
│  ├─ game/                 # event bus, StatsHud, ShopDialog, phaser/ (scene + canvas)
│  ├─ auth/                 # AuthProvider, AuthButton, panel login
│  └─ sync/                 # useCloudSync (merge + push bertahap)
├─ generated/prisma/        # Prisma Client hasil generate (di-gitignore)
└─ lib/
   ├─ stores/               # zustand + persist (sumber kebenaran lokal)
   ├─ services/             # quest/progress repo · sync merge · leaderboard
   ├─ supabase/             # klien browser/server, gerbang config, domain
   ├─ db/                   # singleton Prisma (driver adapter pg)
   └─ utils/                # format rupiah/angka
```

### Kontrak penting

- **`validation_rules` (JSON-serializable)** — satu format untuk M1–M4; di M3 disimpan pada kolom `jsonb` tabel `quests`. Tipe: `src/content/quests/schema.ts`, evaluator mandiri: `src/features/sandbox/harness.ts` (disuntik ke sandbox via `toString()` — terverifikasi selamat dari minifikasi Turbopack).
- **Batas adapter** — `questRepository` dan `progressRepository` adalah *seam* yang sama yang akan diisi implementasi Supabase pada M3 tanpa menyentuh komponen.
- **Event bus React → Game** — `src/features/game/events.ts`; M2 mengganti `GamePanel` React dengan Phaser.js tanpa mengubah pemanggil.

## Setup Cloud (Supabase + Google SSO)

Semua langkah memakai Free Tier Supabase (± 10 menit). Aplikasi tetap berjalan penuh dalam Mode Lokal sebelum ini dilakukan.

### 1. Buat project Supabase

1. Buka [supabase.com](https://supabase.com) → **New project** (simpan password database).
2. Catat **Project URL** dan **anon key** dari *Project Settings → API*.
3. Catat dua connection string dari *Project Settings → Database*:
   - **Transaction pooler** (port `6543`) → `DATABASE_URL` (dipakai aplikasi/serverless)
   - **Direct connection** (port `5432`) → `DIRECT_URL` (dipakai CLI Prisma untuk migrasi)

### 2. Aktifkan Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com) → *APIs & Services → Credentials* → **Create OAuth client ID** (Web application).
2. **Authorized redirect URI:** `https://<project-ref>.supabase.co/auth/v1/callback`
3. Salin Client ID & Client Secret → Supabase Dashboard → *Authentication → Providers → Google* → aktifkan & tempel.
4. *Authentication → URL Configuration*:
   - **Site URL:** `http://localhost:3000` (ganti domain produksi saat deploy)
   - **Redirect URLs:** tambahkan `http://localhost:3000/**` dan `https://<domain-produksi>/**`

### 3. Isi environment & migrasi database

```bash
cp .env.example .env   # isi 4 nilai: URL, anon key, DATABASE_URL, DIRECT_URL
pnpm db:push           # membuat tabel: users, user_progress, inventory_items, user_inventory
pnpm db:seed           # opsional — sync juga meng-upsert katalog item otomatis
```

### 4. Uji

```bash
pnpm dev
```

Buka `/login` → **Masuk dengan Google** → onboarding nama startup + avatar → selesaikan satu misi → buka `/leaderboard` → coba login dari browser/perangkat lain dan pastikan progres ter-merge.

### 5. Deploy ke Vercel

Set environment yang sama di *Project Settings → Environment Variables* (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, `DIRECT_URL`), deploy, lalu tambahkan domain produksi ke **Redirect URLs** Supabase.

### Opsional: batasi domain kampus

```env
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS="student.univ.ac.id,univ.ac.id"
```

Email di luar domain terdaftar ditolak saat callback OAuth (termasuk subdomain, mis. `dosen@fisip.univ.ac.id`).

## Roadmap

| Milestone | Isi |
| --- | --- |
| ✅ M0–M1 | Bootstrap + vertical slice Babak 1 (HTML) |
| ✅ M2 | Phaser.js scene isometrik garasi, toko & buff pasif, NPC, bug swarm |
| ✅ M3 | Supabase Auth (Google SSO), onboarding, sinkronisasi progres, leaderboard |
| ✅ M4 | Babak 2 CSS: X-Ray Box Model, Flexbox/Grid, boss Pitching Day (audit 3 viewport) |
| M5 | Babak 3 JS: Event Loop visualizer, boss Cyber Attack Defense |
| M6 | Babak 4 PHP-WASM + virtual SQLite, boss IPO |
| M7 | Dashboard dosen, ekspor ZIP, polish performa & keamanan |

Catatan gap PRD: kolom `buffs` pada `inventory_items` sudah diimplementasikan (M3). Sisa untuk M7 — tabel `classes`/`class_members` (dashboard dosen) dan `quest_attempts` (metrik akurasi kode).
