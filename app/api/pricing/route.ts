import { NextResponse } from "next/server";
import Pricing from "@/lib/models/Pricing";
import connectToDatabase from "@/lib/mongodb";
import { toPricingRecord } from "@/lib/pricing";

export const runtime = "nodejs";

function parseDeviceModel(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("device_model must be a string.");
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error("device_model is required.");
  }

  return trimmedValue;
}

function parseMoney(value: unknown, fieldName: string) {
  const parsedValue =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? 0));

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${fieldName} must be a valid number.`);
  }

  return Number(parsedValue.toFixed(2));
}

export async function GET() {
  try {
    await connectToDatabase();

    const entries = await Pricing.find({}).sort({ device_model: 1 });

    return NextResponse.json({
      items: entries.map(toPricingRecord),
    });
  } catch (error) {
    console.error("Failed to load pricing entries:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load pricing entries.",
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

    await connectToDatabase();

    const entry = await Pricing.create({
      device_model: parseDeviceModel(input.device_model),
      repair_cost: parseMoney(input.repair_cost, "repair_cost"),
      item_cost: parseMoney(input.item_cost, "item_cost"),
    });

    return NextResponse.json(
      {
        item: toPricingRecord(entry),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create pricing entry:", error);

    const isDuplicateKeyError =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000;

    return NextResponse.json(
      {
        error: isDuplicateKeyError
          ? "A pricing entry for this device model already exists."
          : error instanceof Error
            ? error.message
            : "Failed to create pricing entry.",
      },
      { status: isDuplicateKeyError ? 409 : 400 }
    );
  }
}
