import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db/prisma";
import { joinClassByCode } from "@/lib/services/classroom";
import { isLecturerEmail } from "@/lib/services/classroom-logic";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const profileSchema = z.object({
  startupName: z.string().trim().min(2, "Nama startup minimal 2 karakter").max(40),
  founderAvatar: z.string().min(1).max(12),
  /** Opsional: kode kelas yang dibagikan dosen. */
  joinCode: z.string().trim().max(12).optional(),
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

  let row = await prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email ?? "",
      fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
      avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    },
    update: {},
  });

  if (isLecturerEmail(user.email) && row.role !== "lecturer") {
    row = await prisma.user.update({
      where: { id: user.id },
      data: { role: "lecturer" },
    });
  }

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

  let row = await prisma.user.upsert({
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

  if (isLecturerEmail(user.email) && row.role !== "lecturer") {
    row = await prisma.user.update({
      where: { id: user.id },
      data: { role: "lecturer" },
    });
  }

  let joined = false;
  let className: string | undefined;
  if (parsed.data.joinCode && parsed.data.joinCode.length >= 4) {
    const joinResult = await joinClassByCode(user.id, parsed.data.joinCode);
    joined = joinResult.ok;
    className = joinResult.className;
  }

  return NextResponse.json({
    startupName: row.startupName,
    founderAvatar: row.founderAvatar,
    role: row.role,
    joined,
    className,
  });
}
