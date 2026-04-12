import connectToDatabase from "@/lib/mongodb";
import Appointment from "@/lib/models/Appointment";
import Pricing from "@/lib/models/Pricing";

export type DashboardStats = {
  year: number;
  month: number;
  salesTotal: number;
  profitTotal: number;
  completedCount: number;
  scheduledCount: number;
};

function getMonthRange(year: number, month: number) {
  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    throw new Error("Year and month must be integers.");
  }

  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12.");
  }

  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 1),
  };
}

function parseCurrencyValue(value: string | undefined) {
  if (!value) {
    return 0;
  }

  const normalizedValue = value.replace(/[$,]/g, "").trim();
  const parsedValue = Number.parseFloat(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export async function getStatsForMonth(
  year: number,
  month: number
): Promise<DashboardStats> {
  const { start, end } = getMonthRange(year, month);

  await connectToDatabase();

  const [completedAppointments, scheduledCount] = await Promise.all([
    Appointment.find({
      status: "completed",
      start_at: { $gte: start, $lt: end },
    }).select("service_cost service_title"),
    Appointment.countDocuments({
      status: { $in: ["new", "in_progress"] },
      start_at: { $gte: start, $lt: end },
    }),
  ]);

  const serviceTitles = Array.from(
    new Set(
      completedAppointments
        .map((appointment) => appointment.service_title.trim())
        .filter(Boolean)
    )
  );

  const pricingEntries = serviceTitles.length
    ? await Pricing.find({
        device_model: { $in: serviceTitles },
      }).select("device_model repair_cost item_cost")
    : [];

  const pricingMap = new Map(
    pricingEntries.map((pricing) => [
      pricing.device_model,
      pricing.repair_cost - pricing.item_cost,
    ])
  );

  let salesTotal = 0;
  let profitTotal = 0;

  for (const appointment of completedAppointments) {
    salesTotal += parseCurrencyValue(appointment.service_cost);
    profitTotal += pricingMap.get(appointment.service_title.trim()) ?? 0;
  }

  return {
    year,
    month,
    salesTotal: roundCurrency(salesTotal),
    profitTotal: roundCurrency(profitTotal),
    completedCount: completedAppointments.length,
    scheduledCount,
  };
}
