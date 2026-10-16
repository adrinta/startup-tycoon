import { NextResponse } from "next/server";
import { z } from "zod";
import { joinClassByCode } from "@/lib/services/classroom";
import { getPrisma } from "@/lib/db/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const joinSchema = z.object({
  code: z.string().trim().min(4).max(12),
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
  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email ?? "" },
    update: {},
  });

  const result = await joinClassByCode(user.id, parsed.data.code);
  if (!result.ok) {
    return NextResponse.json({ error: "code_not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, className: result.className });
}
