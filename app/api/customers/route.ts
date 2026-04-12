import { NextResponse } from "next/server";
import Appointment from "@/lib/models/Appointment";
import Customer from "@/lib/models/Customer";
import connectToDatabase from "@/lib/mongodb";
import { toCustomerRecord } from "@/lib/customers";

export const runtime = "nodejs";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";

    const query = search
      ? {
          $or: [
            { name: { $regex: escapeRegExp(search), $options: "i" } },
            { email: { $regex: escapeRegExp(search), $options: "i" } },
            { phone: { $regex: escapeRegExp(search), $options: "i" } },
            { address: { $regex: escapeRegExp(search), $options: "i" } },
          ],
        }
      : {};

    await connectToDatabase();

    const customers = await Customer.find(query).sort({ name: 1, created_at: 1 });

    const emails = customers
      .map((customer) => customer.email?.trim().toLowerCase())
      .filter(Boolean) as string[];
    const phones = customers
      .map((customer) => customer.phone?.trim())
      .filter(Boolean) as string[];

    const appointments =
      emails.length || phones.length
        ? await Appointment.find({
            $or: [
              ...(emails.length
                ? [{ consumer_email: { $in: Array.from(new Set(emails)) } }]
                : []),
              ...(phones.length
                ? [{ consumer_mobile: { $in: Array.from(new Set(phones)) } }]
                : []),
            ],
          }).select("consumer_email consumer_mobile service_title")
        : [];

    const titlesByEmail = new Map<string, Set<string>>();
    const titlesByPhone = new Map<string, Set<string>>();

    for (const appointment of appointments) {
      const title = appointment.service_title?.trim();
      const email = appointment.consumer_email?.trim().toLowerCase();
      const phone = appointment.consumer_mobile?.trim();

      if (!title) {
        continue;
      }

      if (email) {
        const existingTitles = titlesByEmail.get(email) ?? new Set<string>();
        existingTitles.add(title);
        titlesByEmail.set(email, existingTitles);
      }

      if (phone) {
        const existingTitles = titlesByPhone.get(phone) ?? new Set<string>();
        existingTitles.add(title);
        titlesByPhone.set(phone, existingTitles);
      }
    }

    return NextResponse.json({
      customers: customers.map((customer) => {
        const mergedTitles = new Set<string>();
        const email = customer.email?.trim().toLowerCase();
        const phone = customer.phone?.trim();

        if (email && titlesByEmail.has(email)) {
          for (const title of titlesByEmail.get(email) ?? []) {
            mergedTitles.add(title);
          }
        }

        if (phone && titlesByPhone.has(phone)) {
          for (const title of titlesByPhone.get(phone) ?? []) {
            mergedTitles.add(title);
          }
        }

        return toCustomerRecord(customer, Array.from(mergedTitles).sort());
      }),
    });
  } catch (error) {
    console.error("Failed to list customers:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load customers.",
      },
      { status: 400 }
    );
  }
}
