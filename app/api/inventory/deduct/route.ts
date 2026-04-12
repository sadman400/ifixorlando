import { NextResponse } from "next/server";
import Inventory from "@/lib/models/Inventory";
import connectToDatabase from "@/lib/mongodb";

export const runtime = "nodejs";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Request body must be a JSON object.");
    }

    const deviceModel =
      typeof (body as { device_model?: unknown }).device_model === "string"
        ? (body as { device_model: string }).device_model.trim()
        : "";

    if (!deviceModel) {
      throw new Error("device_model is required.");
    }

    await connectToDatabase();

    const inventoryItem = await Inventory.findOne({
      device_model: {
        $regex: `^${escapeRegExp(deviceModel)}$`,
        $options: "i",
      },
    }).sort({ quantity: -1, updated_at: 1 });

    if (!inventoryItem) {
      return NextResponse.json({
        success: true,
        deducted: false,
      });
    }

    inventoryItem.quantity = Math.max(inventoryItem.quantity - 1, 0);
    inventoryItem.updated_at = new Date();
    await inventoryItem.save();

    return NextResponse.json({
      success: true,
      deducted: true,
      quantity: inventoryItem.quantity,
    });
  } catch (error) {
    console.error("Failed to deduct inventory:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to deduct inventory.",
      },
      { status: 400 }
    );
  }
}
