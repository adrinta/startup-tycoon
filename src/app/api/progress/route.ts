import { NextResponse } from "next/server";
import { z } from "zod";
import { getQuestById } from "@/content/quests";
import { getShopItem } from "@/content/shop/items";
import { getPrisma } from "@/lib/db/prisma";
import type { ProgressSnapshotFull } from "@/lib/services/sync";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const snapshotSchema = z.object({
  revenue: z.number().int().min(0).max(100_000_000),
  activeUsers: z.number().int().min(0).max(100_000_000),
  completedQuestIds: z.array(z.string()).max(200),
  ownedItemIds: z.array(z.string()).max(100),
});

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  const row = await prisma.user.findUnique({
    where: { id: user.id },
    include: { progress: true, inventory: true },
  });

  const snapshot: ProgressSnapshotFull = {
    revenue: row?.revenue ?? 0,
    activeUsers: row?.activeUsers ?? 0,
    completedQuestIds: row?.progress.map((entry) => entry.questId) ?? [],
    ownedItemIds: row?.inventory.map((entry) => entry.itemId) ?? [],
  };

  return NextResponse.json(snapshot);
}

export async function PUT(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = snapshotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // Hanya id yang dikenal katalog yang disimpan.
  const completedQuestIds = parsed.data.completedQuestIds.filter(
    (id) => getQuestById(id) !== undefined,
  );
  const ownedItemIds = parsed.data.ownedItemIds.filter((id) => getShopItem(id) !== undefined);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: user.id },
        create: { id: user.id, email: user.email ?? "" },
        update: {},
      });

      await tx.userProgress.deleteMany({ where: { userId: user.id } });
      if (completedQuestIds.length > 0) {
        await tx.userProgress.createMany({
          data: completedQuestIds.map((questId) => ({ userId: user.id, questId })),
        });
      }

      await tx.userInventory.deleteMany({ where: { userId: user.id } });
      for (const itemId of ownedItemIds) {
        const item = getShopItem(itemId);
        if (!item) continue;
        // Pastikan baris katalog ada (seeding opsional namun aman).
        await tx.inventoryItem.upsert({
          where: { id: item.id },
          create: {
            id: item.id,
            name: item.name,
            emoji: item.emoji,
            category: item.category,
            cost: item.cost,
            buffs: item.buff,
          },
          update: {},
        });
        await tx.userInventory.create({
          data: { userId: user.id, itemId: item.id },
        });
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          revenue: parsed.data.revenue,
          activeUsers: parsed.data.activeUsers,
        },
      });
    });
  } catch (error) {
    console.error("Gagal menyimpan progres:", error);
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
