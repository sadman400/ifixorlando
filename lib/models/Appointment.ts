import mongoose, { Model, Schema } from "mongoose";

export type AppointmentStatus =
  | "new"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface AppointmentDocument {
  service_title: string;
  service_descriptions?: string;
  service_cost?: string;
  service_charge?: string;
  start_at: Date;
  end_at?: Date;
  consumer_name: string;
  consumer_email?: string;
  consumer_mobile?: string;
  consumer_zip?: string;
  consumer_address?: string;
  consumer_unit?: string;
  coupon_code?: string;
  add_ons?: string;
  status: AppointmentStatus;
  notes: string;
  created_at: Date;
}

const appointmentSchema = new Schema<AppointmentDocument>(
  {
    service_title: {
      type: String,
      required: true,
    },
    service_descriptions: {
      type: String,
    },
    service_cost: {
      type: String,
    },
    service_charge: {
      type: String,
    },
    start_at: {
      type: Date,
      required: true,
    },
    end_at: {
      type: Date,
    },
    consumer_name: {
      type: String,
      required: true,
    },
    consumer_email: {
      type: String,
    },
    consumer_mobile: {
      type: String,
    },
    consumer_zip: {
      type: String,
    },
    consumer_address: {
      type: String,
    },
    consumer_unit: {
      type: String,
    },
    coupon_code: {
      type: String,
    },
    add_ons: {
      type: String,
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "completed", "cancelled"],
      default: "new",
    },
    notes: {
      type: String,
      default: "",
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

const Appointment =
  (mongoose.models.Appointment as Model<AppointmentDocument>) ||
  mongoose.model<AppointmentDocument>("Appointment", appointmentSchema);

export default Appointment;
