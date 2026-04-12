import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Appointment from "@/lib/models/Appointment";
import connectToDatabase from "@/lib/mongodb";
import {
  isAppointmentStatus,
  toAppointmentRecord,
} from "@/lib/appointments";

export const runtime = "nodejs";

function validateAppointmentId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid appointment id.");
  }
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

async function getAppointmentById(id: string) {
  await connectToDatabase();

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    return null;
  }

  return appointment;
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    validateAppointmentId(id);

    const appointment = await getAppointmentById(id);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      appointment: toAppointmentRecord(appointment),
    });
  } catch (error) {
    console.error("Failed to load appointment:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load appointment.",
      },
      { status: 400 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    validateAppointmentId(id);

    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Request body must be a JSON object.");
    }

    const appointment = await getAppointmentById(id);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      );
    }

    let hasChanges = false;
    const input = body as Record<string, unknown>;

    if ("service_title" in input) {
      appointment.service_title = parseTrimmedString(
        input.service_title,
        "service_title",
        true
      );
      hasChanges = true;
    }

    if ("service_descriptions" in input) {
      appointment.service_descriptions = parseTrimmedString(
        input.service_descriptions,
        "service_descriptions"
      );
      hasChanges = true;
    }

    if ("service_cost" in input) {
      appointment.service_cost = parseTrimmedString(
        input.service_cost,
        "service_cost"
      );
      hasChanges = true;
    }

    if ("service_charge" in input) {
      appointment.service_charge = parseTrimmedString(
        input.service_charge,
        "service_charge"
      );
      hasChanges = true;
    }

    if ("start_at" in input) {
      appointment.start_at = parseDateValue(
        input.start_at,
        "start_at",
        true
      ) as Date;
      hasChanges = true;
    }

    if ("end_at" in input) {
      appointment.end_at = parseDateValue(input.end_at, "end_at", false);
      hasChanges = true;
    }

    if ("consumer_name" in input) {
      appointment.consumer_name = parseTrimmedString(
        input.consumer_name,
        "consumer_name",
        true
      );
      hasChanges = true;
    }

    if ("consumer_email" in input) {
      appointment.consumer_email = parseTrimmedString(
        input.consumer_email,
        "consumer_email"
      ).toLowerCase();
      hasChanges = true;
    }

    if ("consumer_mobile" in input) {
      appointment.consumer_mobile = parseTrimmedString(
        input.consumer_mobile,
        "consumer_mobile"
      );
      hasChanges = true;
    }

    if ("consumer_zip" in input) {
      appointment.consumer_zip = parseTrimmedString(
        input.consumer_zip,
        "consumer_zip"
      );
      hasChanges = true;
    }

    if ("consumer_address" in input) {
      appointment.consumer_address = parseTrimmedString(
        input.consumer_address,
        "consumer_address"
      );
      hasChanges = true;
    }

    if ("consumer_unit" in input) {
      appointment.consumer_unit = parseTrimmedString(
        input.consumer_unit,
        "consumer_unit"
      );
      hasChanges = true;
    }

    if ("coupon_code" in input) {
      appointment.coupon_code = parseTrimmedString(
        input.coupon_code,
        "coupon_code"
      );
      hasChanges = true;
    }

    if ("add_ons" in input) {
      appointment.add_ons = parseTrimmedString(input.add_ons, "add_ons");
      hasChanges = true;
    }

    if ("status" in input) {
      if (!isAppointmentStatus(input.status)) {
        throw new Error("status must be one of the allowed values.");
      }

      appointment.status = input.status;
      hasChanges = true;
    }

    if ("notes" in input) {
      if (typeof input.notes !== "string") {
        throw new Error("notes must be a string.");
      }

      appointment.notes = input.notes;
      hasChanges = true;
    }

    if (!hasChanges) {
      throw new Error("No valid appointment fields were provided.");
    }

    await appointment.save();

    return NextResponse.json({
      appointment: toAppointmentRecord(appointment),
    });
  } catch (error) {
    console.error("Failed to update appointment:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update appointment.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    validateAppointmentId(id);

    await connectToDatabase();

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete appointment:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete appointment.",
      },
      { status: 400 }
    );
  }
}
