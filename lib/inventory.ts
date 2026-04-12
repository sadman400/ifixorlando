export type InventoryRecord = {
  _id: string;
  device_model: string;
  color: string;
  quantity: number;
  updated_at: string;
};

export function toInventoryRecord(value: unknown): InventoryRecord {
  const source =
    typeof (value as { toObject?: () => unknown })?.toObject === "function"
      ? (value as { toObject: () => Record<string, unknown> }).toObject()
      : (value as Record<string, unknown>);

  return {
    _id: String(source._id ?? ""),
    device_model: String(source.device_model ?? ""),
    color: String(source.color ?? ""),
    quantity: Number(source.quantity ?? 0),
    updated_at: source.updated_at
      ? new Date(String(source.updated_at)).toISOString()
      : "",
  };
}
