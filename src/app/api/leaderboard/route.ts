import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getLeaderboard } from "@/lib/services/leaderboard";

export async function GET() {
  await connection();
  const result = await getLeaderboard();
  if (!result.ok) {
    const status = result.reason === "unconfigured" ? 503 : 500;
    return NextResponse.json({ error: result.reason }, { status });
  }
  return NextResponse.json({ entries: result.entries });
}
