import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/lib/models/Appointment";
import Customer from "@/lib/models/Customer";

export const runtime = "nodejs";

type ZapierPayload = Record<string, FormDataEntryValue | undefined>;

function toOptionalString(value: FormDataEntryValue | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function normalizeEmail(value: FormDataEntryValue | undefined) {
  const email = toOptionalString(value);
  return email ? email.toLowerCase() : undefined;
}

function stripDollarSign(value: FormDataEntryValue | undefined) {
  const amount = toOptionalString(value);
  return amount ? amount.replace(/\$/g, "").trim() : undefined;
}

function trimLeadingComma(value: FormDataEntryValue | undefined) {
  const normalizedValue = toOptionalString(value);
  return normalizedValue
    ? normalizedValue.replace(/^[,\s]+/, "").trim() || undefined
    : undefined;
}

function parseZapierDate(
  value: FormDataEntryValue | undefined,
  fieldName: string,
  required = false
) {
  const input = toOptionalString(value);

  if (!input) {
    if (required) {
      throw new Error(`${fieldName} is required.`);
    }

    return undefined;
  }

  const match = input.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{1,2}):(\d{2}) ([AP]M)$/i
  );

  if (!match) {
    throw new Error(`${fieldName} must use the format YYYY-MM-DD HH:MM AM/PM.`);
  }

  const [, year, month, day, hour, minute, meridiem] = match;
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const parsedDay = Number(day);
  const parsedMinute = Number(minute);
  const hour12 = Number(hour);

  if (
    parsedMonth < 1 ||
    parsedMonth > 12 ||
    parsedDay < 1 ||
    parsedDay > 31 ||
    parsedMinute < 0 ||
    parsedMinute > 59 ||
    hour12 < 1 ||
    hour12 > 12
  ) {
    throw new Error(`${fieldName} contains an invalid date or time.`);
  }

  let hour24 = hour12 % 12;
  if (meridiem.toUpperCase() === "PM") {
    hour24 += 12;
  }

  const date = new Date(
    parsedYear,
    parsedMonth - 1,
    parsedDay,
    hour24,
    parsedMinute
  );

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== parsedYear ||
    date.getMonth() !== parsedMonth - 1 ||
    date.getDate() !== parsedDay ||
    date.getHours() !== hour24 ||
    date.getMinutes() !== parsedMinute
  ) {
    throw new Error(`${fieldName} contains an invalid date or time.`);
  }

  return date;
}

function omitUndefined<T extends Record<string, unknown>>(object: T) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

async function parseRequestBody(request: Request): Promise<ZapierPayload> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Request body must be a JSON object.");
    }

    return body as ZapierPayload;
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  const rawBody = await request.text();

  if (!rawBody.trim()) {
    throw new Error("Request body is empty.");
  }

  try {
    const parsedBody = JSON.parse(rawBody) as unknown;

    if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
      throw new Error("Request body must be a JSON object.");
    }

    return parsedBody as ZapierPayload;
  } catch {
    const params = new URLSearchParams(rawBody);
    const parsedBody = Object.fromEntries(params.entries());

    if (Object.keys(parsedBody).length === 0) {
      throw new Error("Unsupported request body format.");
    }

    return parsedBody;
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseRequestBody(request);

    const appointmentData = {
      service_title: toOptionalString(body["Services Title"]),
      service_descriptions: toOptionalString(body["Services Descriptions"]),
      service_cost: stripDollarSign(body["Services Cost"]),
      service_charge: toOptionalString(body["Services Charge"]),
      start_at: parseZapierDate(body["Start"], "Start", true),
      end_at: parseZapierDate(body["End"], "End"),
      consumer_name: toOptionalString(body["Consumers Name"]),
      consumer_email: normalizeEmail(body["Consumers Email"]),
      consumer_mobile: toOptionalString(body["Consumers Mobile"]),
      consumer_zip: toOptionalString(body["Consumers Address Zip"]),
      consumer_address: toOptionalString(body["Consumers Address Line 1"]),
      consumer_unit: toOptionalString(body["Consumers Unit Floor"]),
      coupon_code: toOptionalString(body["Consumers Additional Fields Coupon"]),
      add_ons: trimLeadingComma(body["Add Ons"]),
      status: "new" as const,
    };

    if (!appointmentData.service_title) {
      throw new Error("Services Title is required.");
    }

    if (!appointmentData.consumer_name) {
      throw new Error("Consumers Name is required.");
    }

    await connectToDatabase();

    const appointment = await Appointment.create(appointmentData);

    const customerData = omitUndefined({
      name: appointmentData.consumer_name,
      email: appointmentData.consumer_email,
      phone: appointmentData.consumer_mobile,
      address: appointmentData.consumer_address,
      zip: appointmentData.consumer_zip,
    });

    if (appointmentData.consumer_email) {
      await Customer.findOneAndUpdate(
        { email: appointmentData.consumer_email },
        { $set: customerData },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    } else {
      await Customer.create(customerData);
    }

    return NextResponse.json(
      {
        success: true,
        appointmentId: appointment._id.toString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Zapier appointment webhook failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Invalid webhook request.",
      },
      { status: 400 }
    );
  }
}
