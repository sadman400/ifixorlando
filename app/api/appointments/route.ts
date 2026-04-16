import { NextResponse } from "next/server";
import Appointment from "@/lib/models/Appointment";
import connectToDatabase from "@/lib/mongodb";
import { isAppointmentStatus, toAppointmentRecord } from "@/lib/appointments";

export const runtime = "nodejs";

function parseTrimmedString(
  value: unknown,
  fieldName: string,
  required = false
) {
  if (value === null || value === undefined) {
    if (required) {
      throw new Error(`${fieldName} is required.`);
    }

    return "";
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string.`);
  }

  const trimmedValue = value.trim();

  if (required && !trimmedValue) {
    throw new Error(`${fieldName} is required.`);
  }

  return trimmedValue;
}

function parseDateValue(
  value: unknown,
  fieldName: string,
  required: boolean
): Date | undefined {
  if (value === "" || value === null || value === undefined) {
    if (required) {
      throw new Error(`${fieldName} is required.`);
    }

    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a valid date string.`);
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(`${fieldName} must be a valid date string.`);
  }

  return parsedDate;
}

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Request body must be a JSON object.");
    }

    const input = body as Record<string, unknown>;

    const serviceTitle = parseTrimmedString(
      input.service_title,
      "service_title",
      true
    );
    const consumerName = parseTrimmedString(
      input.consumer_name,
      "consumer_name",
      true
    );
    const startAt = parseDateValue(input.start_at, "start_at", true) as Date;
    const endAt = parseDateValue(input.end_at, "end_at", false);

    const status =
      "status" in input && input.status !== undefined && input.status !== ""
        ? input.status
        : "new";

    if (!isAppointmentStatus(status)) {
      throw new Error("status must be one of the allowed values.");
    }

    await connectToDatabase();

    const appointment = await Appointment.create({
      service_title: serviceTitle,
      service_descriptions: parseTrimmedString(
        input.service_descriptions,
        "service_descriptions"
      ),
      service_cost: parseTrimmedString(input.service_cost, "service_cost"),
      service_charge: parseTrimmedString(
        input.service_charge,
        "service_charge"
      ),
      start_at: startAt,
      end_at: endAt,
      consumer_name: consumerName,
      consumer_email: parseTrimmedString(
        input.consumer_email,
        "consumer_email"
      ).toLowerCase(),
      consumer_mobile: parseTrimmedString(
        input.consumer_mobile,
        "consumer_mobile"
      ),
      consumer_zip: parseTrimmedString(input.consumer_zip, "consumer_zip"),
      consumer_address: parseTrimmedString(
        input.consumer_address,
        "consumer_address"
      ),
      consumer_unit: parseTrimmedString(input.consumer_unit, "consumer_unit"),
      coupon_code: parseTrimmedString(input.coupon_code, "coupon_code"),
      add_ons: parseTrimmedString(input.add_ons, "add_ons"),
      status,
      notes:
        typeof input.notes === "string"
          ? input.notes
          : parseTrimmedString(input.notes, "notes"),
    });

    return NextResponse.json(
      { appointment: toAppointmentRecord(appointment) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create appointment:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create appointment.",
      },
      { status: 400 }
    );
  }
}
