import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { SHOP_ITEMS } from "../src/content/shop/items";

/**
 * Seed katalog dekorasi ke tabel `inventory_items`.
 * Jalankan: pnpm db:seed (setelah pnpm db:push).
 */
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL belum diset — lihat .env.example");
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  for (const item of SHOP_ITEMS) {
    await prisma.inventoryItem.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        category: item.category,
        cost: item.cost,
        buffs: item.buff,
      },
      update: {
        name: item.name,
        emoji: item.emoji,
        category: item.category,
        cost: item.cost,
        buffs: item.buff,
      },
    });
  }

  console.log(`Seed selesai: ${SHOP_ITEMS.length} item dekorasi.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
