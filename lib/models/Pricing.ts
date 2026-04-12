import mongoose, { Model, Schema } from "mongoose";

export interface PricingDocument {
  device_model: string;
  repair_cost: number;
  item_cost: number;
}

const pricingSchema = new Schema<PricingDocument>(
  {
    device_model: {
      type: String,
      required: true,
      unique: true,
    },
    repair_cost: {
      type: Number,
      default: 0,
    },
    item_cost: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
  }
);

const Pricing =
  (mongoose.models.Pricing as Model<PricingDocument>) ||
  mongoose.model<PricingDocument>("Pricing", pricingSchema);

export default Pricing;
