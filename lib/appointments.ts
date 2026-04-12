export const appointmentStatuses = [
  "new",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];

export type AppointmentRecord = {
  _id: string;
  service_title: string;
  service_descriptions: string;
  service_cost: string;
  service_charge: string;
  start_at: string;
  end_at: string | null;
  consumer_name: string;
  consumer_email: string;
  consumer_mobile: string;
  consumer_zip: string;
  consumer_address: string;
  consumer_unit: string;
  coupon_code: string;
  add_ons: string;
  status: AppointmentStatus;
  notes: string;
  created_at: string;
};

export function isAppointmentStatus(
  value: unknown
): value is AppointmentStatus {
  return (
    typeof value === "string" &&
    appointmentStatuses.includes(value as AppointmentStatus)
  );
}

export function formatAppointmentStatus(status: AppointmentStatus) {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "New";
  }
}

export function getAppointmentStatusStyles(status: AppointmentStatus) {
  switch (status) {
    case "in_progress":
      return "bg-amber-50 text-amber-700";
    case "completed":
      return "bg-emerald-50 text-emerald-700";
    case "cancelled":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-sky-50 text-sky-700";
  }
}

export function getAppointmentStatusBarColor(status: AppointmentStatus) {
  switch (status) {
    case "in_progress":
      return "bg-amber-500";
    case "completed":
      return "bg-emerald-500";
    case "cancelled":
      return "bg-rose-500";
    default:
      return "bg-teal-500";
  }
}

export function getAppointmentStatusTextColor(status: AppointmentStatus) {
  switch (status) {
    case "in_progress":
      return "text-amber-600";
    case "completed":
      return "text-emerald-600";
    case "cancelled":
      return "text-rose-600";
    default:
      return "text-teal-600";
  }
}

export function formatAppointmentDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatAppointmentDateLong(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function toDatetimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

export function buildAppointmentAddress(appointment: {
  consumer_address: string;
  consumer_unit: string;
  consumer_zip: string;
}) {
  return [
    appointment.consumer_address,
    appointment.consumer_unit,
    appointment.consumer_zip,
  ]
    .filter(Boolean)
    .join(", ");
}

export function buildAppleMapsUrl(address: string) {
  return address
    ? `https://maps.apple.com/?q=${encodeURIComponent(address)}`
    : "";
}

export function buildSmsUrl(phoneNumber: string, message: string) {
  if (!phoneNumber) {
    return "";
  }

  return `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
}

export function toAppointmentRecord(value: unknown): AppointmentRecord {
  const source =
    typeof (value as { toObject?: () => unknown })?.toObject === "function"
      ? (value as { toObject: () => Record<string, unknown> }).toObject()
      : (value as Record<string, unknown>);

  return {
    _id: String(source._id ?? ""),
    service_title: String(source.service_title ?? ""),
    service_descriptions: String(source.service_descriptions ?? ""),
    service_cost: String(source.service_cost ?? ""),
    service_charge: String(source.service_charge ?? ""),
    start_at: source.start_at
      ? new Date(String(source.start_at)).toISOString()
      : "",
    end_at: source.end_at ? new Date(String(source.end_at)).toISOString() : null,
    consumer_name: String(source.consumer_name ?? ""),
    consumer_email: String(source.consumer_email ?? ""),
    consumer_mobile: String(source.consumer_mobile ?? ""),
    consumer_zip: String(source.consumer_zip ?? ""),
    consumer_address: String(source.consumer_address ?? ""),
    consumer_unit: String(source.consumer_unit ?? ""),
    coupon_code: String(source.coupon_code ?? ""),
    add_ons: String(source.add_ons ?? ""),
    status: isAppointmentStatus(source.status) ? source.status : "new",
    notes: String(source.notes ?? ""),
    created_at: source.created_at
      ? new Date(String(source.created_at)).toISOString()
      : "",
  };
}
