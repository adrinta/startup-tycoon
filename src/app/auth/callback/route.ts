import { NextResponse, type NextRequest } from "next/server";
import { getPrisma } from "@/lib/db/prisma";
import { isEmailDomainAllowed } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/play";

  const supabase = await getSupabaseServerClient();
  if (!supabase || !code) {
    return NextResponse.redirect(`${origin}/login?error=unconfigured`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Pembatasan domain kampus (opsional lewat NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS).
  if (!isEmailDomainAllowed(user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=domain`);
  }

  // Sinkronkan identitas Google ke tabel users.
  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email ?? "",
          fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
          avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
        },
        update: {
          email: user.email ?? "",
          fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
          avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
        },
      });

      const row = await prisma.user.findUnique({
        where: { id: user.id },
        select: { startupName: true },
      });
      if (!row?.startupName) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    } catch (dbError) {
      console.error("Gagal menyinkronkan profil pengguna:", dbError);
    }
  }

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/play"}`);
}
