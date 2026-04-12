import { NextResponse } from "next/server";
import { getStatsForMonth } from "@/lib/stats";

export const runtime = "nodejs";

export async function GET() {
  try {
    const now = new Date();
    const stats = await getStatsForMonth(
      now.getFullYear(),
      now.getMonth() + 1
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to load current dashboard stats:", error);

    return NextResponse.json(
      {
        error: "Failed to load current dashboard stats.",
      },
      { status: 500 }
    );
  }
}
