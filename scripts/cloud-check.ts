import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Verifikasi cepat konfigurasi cloud M3 (tanpa mencetak rahasia):
 *   pnpm cloud:check
 */
async function main() {
  const connectionString = process.env.DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!connectionString) {
    console.log("✗ DATABASE_URL belum diisi di .env — lihat .env.example");
    process.exitCode = 1;
    return;
  }
  if (!supabaseUrl || !anonKey) {
    console.log("! NEXT_PUBLIC_SUPABASE_URL / ANON_KEY belum lengkap — login Google belum aktif");
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const [users, progress, items] = await Promise.all([
      prisma.user.count(),
      prisma.userProgress.count(),
      prisma.inventoryItem.count(),
    ]);
    console.log("✓ Koneksi database OK (pooler)");
    console.log(
      `  users: ${users} · user_progress: ${progress} · inventory_items: ${items}`,
    );
    if (items === 0) {
      console.log("  (opsional) jalankan `pnpm db:seed` untuk mengisi katalog dekorasi");
    }
    if (users > 0) {
      console.log("  Login pertama terdeteksi — buka /leaderboard untuk melihat peringkat.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("✗ Gagal membaca tabel:", message);
    console.error("  Jika tabel belum ada: jalankan `pnpm db:push` lebih dulu.");
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
