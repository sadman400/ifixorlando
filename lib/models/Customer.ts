import mongoose, { Model, Schema } from "mongoose";

export interface CustomerDocument {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  zip?: string;
  created_at: Date;
}

const customerSchema = new Schema<CustomerDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    zip: {
      type: String,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

customerSchema.index(
  { email: 1, phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $exists: true, $ne: "" },
      phone: { $exists: true, $ne: "" },
    },
  }
);

const Customer =
  (mongoose.models.Customer as Model<CustomerDocument>) ||
  mongoose.model<CustomerDocument>("Customer", customerSchema);

export default Customer;
