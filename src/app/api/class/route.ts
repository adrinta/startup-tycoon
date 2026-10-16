import { NextResponse } from "next/server";
import { z } from "zod";
import { createClass } from "@/lib/services/classroom";
import { isLecturerEmail } from "@/lib/services/classroom-logic";
import { getPrisma } from "@/lib/db/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/server";

const createSchema = z.object({
  name: z.string().trim().min(2).max(60),
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

  // Pengajar = email terdaftar di LECTURER_EMAILS atau role di database.
  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  const isLecturer = isLecturerEmail(user.email) || row?.role === "lecturer";
  if (!isLecturer) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const result = await createClass(user.id, parsed.data.name);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 500 });
  }
  return NextResponse.json({ ok: true, joinCode: result.joinCode });
}
