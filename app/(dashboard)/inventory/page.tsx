"use client";

import { useEffect, useMemo, useState } from "react";
import { type InventoryRecord } from "@/lib/inventory";
import { useToast } from "@/components/ui/toast-provider";

type InventoryFormState = {
  device_model: string;
  color: string;
  quantity: string;
};

const initialFormState: InventoryFormState = {
  device_model: "",
  color: "",
  quantity: "0",
};

type IconProps = {
  className?: string;
};

function PlusIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function MinusIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function TrashIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function BoxIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.75 20 6.9v10.2L12 21.25 4 17.1V6.9L12 2.75Z" />
      <path d="M4.8 6.45 12 10.25l7.2-3.8" />
      <path d="M12 10.25v11" />
    </svg>
  );
}

const inputClassName =
  "w-full rounded border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(20,184,166,0.12)]";

function sortInventoryItems(items: InventoryRecord[]) {
  return [...items].sort((left, right) => {
    const deviceComparison = left.device_model.localeCompare(right.device_model);

    if (deviceComparison !== 0) {
      return deviceComparison;
    }

    return left.color.localeCompare(right.color);
  });
}

type StockLevel = "out" | "low" | "ok";

function getStockLevel(quantity: number): StockLevel {
  if (quantity === 0) return "out";
  if (quantity <= 3) return "low";
  return "ok";
}

function getStockColor(level: StockLevel) {
  switch (level) {
    case "out":
      return "text-rose-600";
    case "low":
      return "text-amber-600";
    default:
      return "text-emerald-600";
  }
}

function getStockBarColor(level: StockLevel) {
  switch (level) {
    case "out":
      return "bg-rose-500";
    case "low":
      return "bg-amber-500";
    default:
      return "bg-emerald-500";
  }
}

function getStockLabel(level: StockLevel) {
  switch (level) {
    case "out":
      return "Out";
    case "low":
      return "Low";
    default:
      return "In stock";
  }
}

function InventorySkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, groupIndex) => (
        <div key={groupIndex}>
          <div className="mb-2 h-3 w-32 animate-pulse rounded bg-gray-200" />
          <div className="overflow-hidden rounded border border-gray-200/70 bg-white">
            {Array.from({ length: 2 }).map((__, rowIndex) => (
              <div
                key={rowIndex}
                className="border-b border-gray-100 px-4 py-3.5 last:border-b-0"
              >
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InventoryPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<InventoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<InventoryFormState>(initialFormState);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingItemIds, setUpdatingItemIds] = useState<string[]>([]);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadInventory() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/inventory", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load inventory.");
        }

        const data = (await response.json()) as {
          items: InventoryRecord[];
        };

        if (isActive) {
          setItems(sortInventoryItems(data.items));
        }
      } catch {
        if (isActive) {
          setError("Unable to load inventory.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInventory();

    return () => {
      isActive = false;
    };
  }, []);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, InventoryRecord[]>();

    for (const item of items) {
      const existingGroup = groups.get(item.device_model) ?? [];
      existingGroup.push(item);
      groups.set(item.device_model, existingGroup);
    }

    return Array.from(groups.entries()).map(([deviceModel, groupItems]) => ({
      deviceModel,
      items: groupItems,
    }));
  }, [items]);

  const stats = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.quantity, 0);
    const outOfStock = items.filter((item) => item.quantity === 0).length;
    const lowStock = items.filter(
      (item) => item.quantity > 0 && item.quantity <= 3
    ).length;
    return { total, outOfStock, lowStock };
  }, [items]);

  async function handleCreateItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_model: form.device_model,
          color: form.color,
          quantity: Number(form.quantity),
        }),
      });

      const data = (await response.json()) as {
        item?: InventoryRecord;
        error?: string;
      };

      if (!response.ok || !data.item) {
        throw new Error(data.error ?? "Failed to create inventory item.");
      }

      setItems((currentItems) => sortInventoryItems([...currentItems, data.item!]));
      setForm(initialFormState);
      setShowAddForm(false);
      notify({
        title: "Saved successfully",
        description: "Inventory item created.",
        tone: "success",
      });
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Unable to create inventory item.";
      setError(message);
      notify({
        title: "Save failed",
        description: message,
        tone: "error",
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleAdjustQuantity(item: InventoryRecord, adjust: -1 | 1) {
    const nextQuantity = Math.max(0, item.quantity + adjust);

    if (nextQuantity === item.quantity) {
      return;
    }

    setError(null);
    setUpdatingItemIds((currentIds) => [...currentIds, item._id]);
    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem._id === item._id
          ? { ...currentItem, quantity: nextQuantity }
          : currentItem
      )
    );

    try {
      const response = await fetch(`/api/inventory/${item._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adjust }),
      });

      const data = (await response.json()) as {
        item?: InventoryRecord;
        error?: string;
      };

      if (!response.ok || !data.item) {
        throw new Error(data.error ?? "Failed to update inventory quantity.");
      }

      setItems((currentItems) =>
        sortInventoryItems(
          currentItems.map((currentItem) =>
            currentItem._id === item._id ? data.item! : currentItem
          )
        )
      );
    } catch (adjustError) {
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem._id === item._id ? item : currentItem
        )
      );
      const message =
        adjustError instanceof Error
          ? adjustError.message
          : "Unable to update inventory quantity.";
      setError(message);
      notify({
        title: "Update failed",
        description: message,
        tone: "error",
      });
    } finally {
      setUpdatingItemIds((currentIds) =>
        currentIds.filter((currentId) => currentId !== item._id)
      );
    }
  }

  async function handleDeleteItem(item: InventoryRecord) {
    if (!window.confirm(`Delete ${item.device_model} (${item.color})?`)) {
      return;
    }

    setError(null);
    setDeletingItemId(item._id);

    try {
      const response = await fetch(`/api/inventory/${item._id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete inventory item.");
      }

      setItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem._id !== item._id)
      );
      notify({
        title: "Deleted",
        description: `${item.device_model} ${item.color} was removed.`,
        tone: "success",
      });
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete inventory item.";
      setError(message);
      notify({
        title: "Delete failed",
        description: message,
        tone: "error",
      });
    } finally {
      setDeletingItemId(null);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
          Inventory
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h2 className="text-[26px] font-bold tracking-tight text-gray-900">
            Stock
          </h2>
          <button
            type="button"
            onClick={() => setShowAddForm((currentValue) => !currentValue)}
            className="flex items-center gap-1.5 rounded bg-teal-600 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{showAddForm ? "Close" : "Add Item"}</span>
          </button>
        </div>
      </div>

      {!isLoading && !error && items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded border border-gray-200/70 bg-white px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Total
            </p>
            <p className="mt-1 text-[18px] font-bold tracking-tight text-teal-600">
              {stats.total}
            </p>
          </div>
          <div className="rounded border border-gray-200/70 bg-white px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Low
            </p>
            <p className="mt-1 text-[18px] font-bold tracking-tight text-amber-600">
              {stats.lowStock}
            </p>
          </div>
          <div className="rounded border border-gray-200/70 bg-white px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Out
            </p>
            <p className="mt-1 text-[18px] font-bold tracking-tight text-rose-600">
              {stats.outOfStock}
            </p>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="rounded border border-gray-200/70 bg-white p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
            New Item
          </p>
          <form className="space-y-3" onSubmit={handleCreateItem}>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-gray-700">
                Device Model
              </span>
              <input
                value={form.device_model}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    device_model: event.target.value,
                  }))
                }
                className={inputClassName}
                placeholder="iPhone 15 Pro"
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-gray-700">
                  Color
                </span>
                <input
                  value={form.color}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      color: event.target.value,
                    }))
                  }
                  className={inputClassName}
                  placeholder="Black"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-gray-700">
                  Quantity
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      quantity: event.target.value,
                    }))
                  }
                  className={inputClassName}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="submit"
                disabled={isCreating}
                className="rounded bg-teal-600 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Adding..." : "Save Item"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setForm(initialFormState);
                }}
                className="rounded border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="rounded border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <InventorySkeleton />
      ) : groupedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded border border-gray-200/70 bg-white px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-gray-400">
            <BoxIcon className="h-7 w-7" />
          </div>
          <p className="mt-4 text-[15px] font-semibold text-gray-900">
            No inventory yet
          </p>
          <p className="mt-1 text-[13px] text-gray-500">
            Add your first item to start tracking stock.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedItems.map((group) => (
            <div key={group.deviceModel}>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <h3 className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  {group.deviceModel}
                </h3>
                <span className="text-[11px] font-semibold text-gray-400">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "variant" : "variants"}
                </span>
              </div>
              <div className="overflow-hidden rounded border border-gray-200/70 bg-white">
                {group.items.map((item, itemIndex) => {
                  const isUpdating = updatingItemIds.includes(item._id);
                  const isDeleting = deletingItemId === item._id;
                  const level = getStockLevel(item.quantity);
                  const stockColor = getStockColor(level);
                  const barColor = getStockBarColor(level);
                  const isLast = itemIndex === group.items.length - 1;

                  return (
                    <div
                      key={item._id}
                      className={`relative flex items-center gap-3 px-4 py-3 ${
                        isLast ? "" : "border-b border-gray-100"
                      }`}
                    >
                      <span
                        className={`absolute inset-y-2 left-0 w-[3px] rounded-r ${barColor}`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1 pl-1">
                        <p className="truncate text-[15px] font-semibold text-gray-900">
                          {item.color}
                        </p>
                        <p
                          className={`mt-0.5 text-[12px] font-semibold ${stockColor}`}
                        >
                          {getStockLabel(level)} · {item.quantity}{" "}
                          {item.quantity === 1 ? "unit" : "units"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            void handleAdjustQuantity(item, -1);
                          }}
                          disabled={isUpdating || item.quantity === 0}
                          aria-label="Decrease quantity"
                          className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span
                          className={`min-w-[28px] text-center text-[15px] font-bold tabular-nums ${stockColor}`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            void handleAdjustQuantity(item, 1);
                          }}
                          disabled={isUpdating}
                          aria-label="Increase quantity"
                          className="flex h-8 w-8 items-center justify-center rounded bg-teal-600 text-white transition hover:bg-teal-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDeleteItem(item);
                          }}
                          disabled={isDeleting}
                          aria-label={`Delete ${item.device_model} ${item.color}`}
                          className="ml-1 flex h-8 w-8 items-center justify-center rounded text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
