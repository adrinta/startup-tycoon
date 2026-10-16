import { NextResponse } from "next/server";
import { z } from "zod";
import { getQuestById } from "@/content/quests";
import { getPrisma } from "@/lib/db/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const attemptSchema = z.object({
  questId: z.string().min(1),
  passed: z.boolean(),
});

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = attemptSchema.safeParse(body);
  if (!parsed.success || !getQuestById(parsed.data.questId)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  await prisma.questAttempt.create({
    data: {
      userId: user.id,
      questId: parsed.data.questId,
      passed: parsed.data.passed,
    },
  });

  return NextResponse.json({ ok: true });
}
