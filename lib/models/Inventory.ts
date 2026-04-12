import mongoose, { Model, Schema } from "mongoose";

export interface InventoryDocument {
  device_model: string;
  color: string;
  quantity: number;
  updated_at: Date;
}

const inventorySchema = new Schema<InventoryDocument>(
  {
    device_model: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

inventorySchema.index({ device_model: 1, color: 1 }, { unique: true });

const Inventory =
  (mongoose.models.Inventory as Model<InventoryDocument>) ||
  mongoose.model<InventoryDocument>("Inventory", inventorySchema);

export default Inventory;
