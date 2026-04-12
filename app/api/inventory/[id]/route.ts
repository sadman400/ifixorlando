import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Inventory from "@/lib/models/Inventory";
import connectToDatabase from "@/lib/mongodb";
import { toInventoryRecord } from "@/lib/inventory";

export const runtime = "nodejs";

function validateInventoryId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid inventory item id.");
  }
}

function parseOptionalTrimmedString(value: unknown, fieldName: string) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string.`);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error(`${fieldName} cannot be empty.`);
  }

  return trimmedValue;
}

function parseInteger(value: unknown, fieldName: string) {
  const parsedValue =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${fieldName} must be a valid number.`);
  }

  return Math.trunc(parsedValue);
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    validateInventoryId(id);

    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Request body must be a JSON object.");
    }

    await connectToDatabase();

    const item = await Inventory.findById(id);

    if (!item) {
      return NextResponse.json(
        { error: "Inventory item not found." },
        { status: 404 }
      );
    }

    const input = body as Record<string, unknown>;

    const nextDeviceModel = parseOptionalTrimmedString(
      input.device_model,
      "device_model"
    );
    const nextColor = parseOptionalTrimmedString(input.color, "color");

    if (nextDeviceModel !== undefined) {
      item.device_model = nextDeviceModel;
    }

    if (nextColor !== undefined) {
      item.color = nextColor;
    }

    if ("quantity" in input) {
      item.quantity = Math.max(0, parseInteger(input.quantity, "quantity"));
    } else if ("adjust" in input) {
      item.quantity = Math.max(
        0,
        item.quantity + parseInteger(input.adjust, "adjust")
      );
    } else if (nextDeviceModel === undefined && nextColor === undefined) {
      throw new Error(
        "Provide quantity, adjust, device_model, or color to update the item."
      );
    }

    item.updated_at = new Date();
    await item.save();

    return NextResponse.json({
      item: toInventoryRecord(item),
    });
  } catch (error) {
    console.error("Failed to update inventory item:", error);

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
            : "Failed to update inventory item.",
      },
      { status: isDuplicateKeyError ? 409 : 400 }
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
    validateInventoryId(id);

    await connectToDatabase();

    const item = await Inventory.findByIdAndDelete(id);

    if (!item) {
      return NextResponse.json(
        { error: "Inventory item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete inventory item:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete inventory item.",
      },
      { status: 400 }
    );
  }
}
