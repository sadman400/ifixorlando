import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Pricing from "@/lib/models/Pricing";
import connectToDatabase from "@/lib/mongodb";
import { toPricingRecord } from "@/lib/pricing";

export const runtime = "nodejs";

function validatePricingId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid pricing entry id.");
  }
}

function parseMoney(value: unknown, fieldName: string) {
  const parsedValue =
    typeof value === "number" ? value : Number.parseFloat(String(value));

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${fieldName} must be a valid number.`);
  }

  return Number(parsedValue.toFixed(2));
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    validatePricingId(id);

    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Request body must be a JSON object.");
    }

    const input = body as Record<string, unknown>;

    if (!("repair_cost" in input) && !("item_cost" in input)) {
      throw new Error("Provide repair_cost and/or item_cost to update.");
    }

    await connectToDatabase();

    const entry = await Pricing.findById(id);

    if (!entry) {
      return NextResponse.json(
        { error: "Pricing entry not found." },
        { status: 404 }
      );
    }

    if ("repair_cost" in input) {
      entry.repair_cost = parseMoney(input.repair_cost, "repair_cost");
    }

    if ("item_cost" in input) {
      entry.item_cost = parseMoney(input.item_cost, "item_cost");
    }

    await entry.save();

    return NextResponse.json({
      item: toPricingRecord(entry),
    });
  } catch (error) {
    console.error("Failed to update pricing entry:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update pricing entry.",
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
    validatePricingId(id);

    await connectToDatabase();

    const entry = await Pricing.findByIdAndDelete(id);

    if (!entry) {
      return NextResponse.json(
        { error: "Pricing entry not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete pricing entry:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete pricing entry.",
      },
      { status: 400 }
    );
  }
}
