import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Appointment from "@/lib/models/Appointment";
import Customer from "@/lib/models/Customer";
import connectToDatabase from "@/lib/mongodb";
import { toAppointmentRecord } from "@/lib/appointments";
import { toCustomerRecord } from "@/lib/customers";

export const runtime = "nodejs";

function validateCustomerId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid customer id.");
  }
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;
    validateCustomerId(id);

    await connectToDatabase();

    const customer = await Customer.findById(id);

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    const email = customer.email?.trim().toLowerCase();
    const phone = customer.phone?.trim();
    const appointmentQuery =
      email || phone
        ? {
            $or: [
              ...(email ? [{ consumer_email: email }] : []),
              ...(phone ? [{ consumer_mobile: phone }] : []),
            ],
          }
        : null;

    const appointments = appointmentQuery
      ? await Appointment.find(appointmentQuery).sort({ start_at: -1, created_at: -1 })
      : [];

    return NextResponse.json({
      customer: toCustomerRecord(
        customer,
        Array.from(
          new Set(
            appointments
              .map((appointment) => appointment.service_title?.trim())
              .filter(Boolean) as string[]
          )
        ).sort()
      ),
      appointments: appointments.map(toAppointmentRecord),
    });
  } catch (error) {
    console.error("Failed to load customer detail:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load customer detail.",
      },
      { status: 400 }
    );
  }
}
