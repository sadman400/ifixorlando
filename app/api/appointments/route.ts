import { NextResponse } from "next/server";
import Appointment from "@/lib/models/Appointment";
import connectToDatabase from "@/lib/mongodb";
import { toAppointmentRecord } from "@/lib/appointments";

export const runtime = "nodejs";

function getRequestedMonth(searchParams: URLSearchParams) {
  const now = new Date();
  const fallbackYear = now.getFullYear();
  const fallbackMonth = now.getMonth() + 1;
  const year = Number(searchParams.get("year") ?? fallbackYear);
  const month = Number(searchParams.get("month") ?? fallbackMonth);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    throw new Error("Year and month must be valid integers.");
  }

  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12.");
  }

  return { year, month };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { year, month } = getRequestedMonth(searchParams);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    await connectToDatabase();

    const appointments = await Appointment.find({
      start_at: { $gte: start, $lt: end },
    }).sort({ start_at: -1, created_at: -1 });

    return NextResponse.json({
      year,
      month,
      appointments: appointments.map(toAppointmentRecord),
    });
  } catch (error) {
    console.error("Failed to list appointments:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load appointments.",
      },
      { status: 400 }
    );
  }
}
