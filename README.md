# Startup Tycoon

Game edukasi pemodelan web **full-stack** (HTML, CSS, JavaScript, PHP) berbungkus simulasi bisnis: kamu memulai dari garasi berdebu dan tumbuh menjadi startup *unicorn*. Setiap kode yang benar mengubah ruangan kantor virtual secara langsung.

Dokumen acuan: [`Startup Tycoon.md`](./Startup%20Tycoon.md) (PRD) dan [`storyline.md`](./storyline.md) (blueprint cerita & silabus).

## Status: Milestone 1 — Vertical Slice Babak 1 (selesai)

- **The Command Center** — layar tiga panel: ruangan game (kiri), Monaco Editor (tengah), preview + audit + Holo-Codex (kanan).
- **Quest Engine** — misi 1.1–1.6 + Boss Fight "Audit Investor" dengan pembukaan bertahap (misi berikutnya terkunci sampai misi sebelumnya tuntas).
- **Sandbox HTML** — kode dieksekusi di `<iframe sandbox="allow-scripts allow-forms">` tanpa akses ke halaman utama; console dan error ditangkap dan dikirim via `postMessage` bernonce.
- **Validasi otomatis tanpa spoiler** — aturan JSON (`doctype`, `dom`, `attr`, `text`, `childOf`, `order`) dievaluasi **di dalam sandbox** memakai DOM sungguhan, dengan pesan detail yang menjelaskan masalah, bukan jawaban.
- **Pratinjau otomatis + Deploy Code** — preview dan checklist objektif berjalan otomatis (debounce 1 detik); tombol **Deploy Code** (atau `Ctrl/⌘ + Enter`) melakukan audit resmi dan membagikan reward.
- **Ekonomi lokal** — Revenue (koin) dan Active Users (XP) dengan level perusahaan, tersimpan di `localStorage`.
- **Holo-Codex** — 7 artikel materi HTML ala W3Schools yang terhubung ke tiap misi.
- **GamePanel placeholder React** dengan event bus yang sama yang akan dipakai Phaser.js di M2 (`quest:completed`, `bug:spawn`, dst.).

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
| `pnpm test` | 48 test: integritas quest, evaluator, srcdoc, pipeline sandbox end-to-end (jsdom) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (termasuk aturan React Compiler) |

## Arsitektur Singkat

```
src/
├─ app/                     # rute Next.js (App Router): landing, /play
├─ content/
│  ├─ quests/               # konten misi (version-controlled) + schema zod + fixture solusi
│  └─ codex/                # artikel Holo-Codex
├─ features/
│  ├─ editor/               # Monaco wrapper + tab file
│  ├─ sandbox/              # harness evaluasi, buildSrcdoc, SandboxFrame, ConsolePanel
│  ├─ validation/           # tipe protokol pesan iframe <-> parent
│  ├─ quests/               # CommandCenter, brief, checklist objektif, tiket, reward dialog
│  ├─ game/                 # event bus, GamePanel (placeholder), StatsHud
│  └─ codex/                # panel Holo-Codex
└─ lib/
   ├─ stores/               # zustand + persist (progres lokal)
   ├─ services/             # quest-repository & progress-repository (batas adapter)
   └─ utils/                # format rupiah/angka
```

### Kontrak penting

- **`validation_rules` (JSON-serializable)** — satu format untuk M1–M4; di M3 disimpan pada kolom `jsonb` tabel `quests`. Tipe: `src/content/quests/schema.ts`, evaluator mandiri: `src/features/sandbox/harness.ts` (disuntik ke sandbox via `toString()` — terverifikasi selamat dari minifikasi Turbopack).
- **Batas adapter** — `questRepository` dan `progressRepository` adalah *seam* yang sama yang akan diisi implementasi Supabase pada M3 tanpa menyentuh komponen.
- **Event bus React → Game** — `src/features/game/events.ts`; M2 mengganti `GamePanel` React dengan Phaser.js tanpa mengubah pemanggil.

## Roadmap

| Milestone | Isi |
| --- | --- |
| ✅ M0–M1 | Bootstrap + vertical slice Babak 1 (HTML) |
| M2 | Phaser.js scene isometrik garasi, shop & dekorasi, NPC |
| M3 | Supabase Auth (Google SSO), sinkronisasi progres, leaderboard |
| M4 | Babak 2 CSS: X-Ray Box Model, Flexbox/Grid visualizer, boss Pitching Day |
| M5 | Babak 3 JS: Event Loop visualizer, boss Cyber Attack Defense |
| M6 | Babak 4 PHP-WASM + virtual SQLite, boss IPO |
| M7 | Dashboard dosen, ekspor ZIP, polish performa & keamanan |

Catatan gap PRD yang sudah dicatat untuk M3: tabel `classes`/`class_members` (fitur kelas), `quest_attempts` (akurasi), dan kolom `buffs` pada `inventory_items`.
