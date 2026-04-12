import { NextResponse } from "next/server";
import { getStatsForMonth } from "@/lib/stats";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = Number(searchParams.get("year"));
    const month = Number(searchParams.get("month"));

    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      return NextResponse.json(
        {
          error: "Valid year and month query parameters are required.",
        },
        { status: 400 }
      );
    }

    const stats = await getStatsForMonth(year, month);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to load dashboard history stats:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load dashboard history stats.",
      },
      { status: 400 }
    );
  }
}
