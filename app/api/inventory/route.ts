import { NextResponse } from "next/server";
import Inventory from "@/lib/models/Inventory";
import connectToDatabase from "@/lib/mongodb";
import { toInventoryRecord } from "@/lib/inventory";

export const runtime = "nodejs";

function parseTrimmedString(value: unknown, fieldName: string) {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string.`);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error(`${fieldName} is required.`);
  }

  return trimmedValue;
}

function parseQuantity(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return 0;
  }

  const parsedValue =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isFinite(parsedValue)) {
    throw new Error("quantity must be a valid number.");
  }

  return Math.max(0, Math.trunc(parsedValue));
}

export async function GET() {
  try {
    await connectToDatabase();

    const items = await Inventory.find({}).sort({
      device_model: 1,
      color: 1,
      updated_at: -1,
    });

    return NextResponse.json({
      items: items.map(toInventoryRecord),
    });
  } catch (error) {
    console.error("Failed to load inventory:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load inventory.",
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

    const item = await Inventory.create({
      device_model: parseTrimmedString(input.device_model, "device_model"),
      color: parseTrimmedString(input.color, "color"),
      quantity: parseQuantity(input.quantity),
      updated_at: new Date(),
    });

    return NextResponse.json(
      {
        item: toInventoryRecord(item),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create inventory item:", error);

    const isDuplicateKeyError =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000;

    return NextResponse.json(
      {
        error: isDuplicateKeyError
          ? "An inventory item for this device model and color already exists."
          : error instanceof Error
            ? error.message
            : "Failed to create inventory item.",
      },
      { status: isDuplicateKeyError ? 409 : 400 }
    );
  }
}
