import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const profileSchema = z.object({
  startupName: z.string().trim().min(2, "Nama startup minimal 2 karakter").max(40),
  founderAvatar: z.string().min(1).max(12),
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

  const row = await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email ?? "",
      fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
      avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    },
    update: {},
  });

  return NextResponse.json({
    email: row.email,
    fullName: row.fullName,
    avatarUrl: row.avatarUrl,
    startupName: row.startupName,
    founderAvatar: row.founderAvatar,
    role: row.role,
    revenue: row.revenue,
    activeUsers: row.activeUsers,
  });
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
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", issues: parsed.error.issues.map((issue) => issue.message) },
      { status: 400 },
    );
  }

  const row = await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email ?? "",
      startupName: parsed.data.startupName,
      founderAvatar: parsed.data.founderAvatar,
    },
    update: {
      startupName: parsed.data.startupName,
      founderAvatar: parsed.data.founderAvatar,
    },
  });

  return NextResponse.json({
    startupName: row.startupName,
    founderAvatar: row.founderAvatar,
    role: row.role,
  });
}
