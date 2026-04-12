export type CustomerRecord = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  created_at: string;
  appointment_service_titles: string[];
};

export function toCustomerRecord(
  value: unknown,
  appointmentServiceTitles: string[] = []
): CustomerRecord {
  const source =
    typeof (value as { toObject?: () => unknown })?.toObject === "function"
      ? (value as { toObject: () => Record<string, unknown> }).toObject()
      : (value as Record<string, unknown>);

  return {
    _id: String(source._id ?? ""),
    name: String(source.name ?? ""),
    email: String(source.email ?? ""),
    phone: String(source.phone ?? ""),
    address: String(source.address ?? ""),
    zip: String(source.zip ?? ""),
    created_at: source.created_at
      ? new Date(String(source.created_at)).toISOString()
      : "",
    appointment_service_titles: appointmentServiceTitles,
  };
}

export function buildCustomerSearchHaystack(customer: CustomerRecord) {
  return [
    customer.name,
    customer.phone,
    customer.email,
    customer.address,
    ...customer.appointment_service_titles,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
