export type PricingRecord = {
  _id: string;
  device_model: string;
  repair_cost: number;
  item_cost: number;
};

export function toPricingRecord(value: unknown): PricingRecord {
  const source =
    typeof (value as { toObject?: () => unknown })?.toObject === "function"
      ? (value as { toObject: () => Record<string, unknown> }).toObject()
      : (value as Record<string, unknown>);

  return {
    _id: String(source._id ?? ""),
    device_model: String(source.device_model ?? ""),
    repair_cost: Number(source.repair_cost ?? 0),
    item_cost: Number(source.item_cost ?? 0),
  };
}
