"use client";

import { useEffect, useMemo, useState } from "react";
import { type PricingRecord } from "@/lib/pricing";
import { useToast } from "@/components/ui/toast-provider";

type PricingFormState = {
  device_model: string;
  repair_cost: string;
  item_cost: string;
};

const initialFormState: PricingFormState = {
  device_model: "",
  repair_cost: "0",
  item_cost: "0",
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

function PencilIcon({ className }: IconProps) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TagIcon({ className }: IconProps) {
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
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  );
}

const inputClassName =
  "w-full rounded border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(20,184,166,0.12)]";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function parseMoneyInput(value: string) {
  const parsedValue = Number.parseFloat(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function sortPricingItems(items: PricingRecord[]) {
  return [...items].sort((left, right) =>
    left.device_model.localeCompare(right.device_model)
  );
}

function PricingSkeleton() {
  return (
    <div className="overflow-hidden rounded border border-gray-200/70 bg-white">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="border-b border-gray-100 px-4 py-3.5 last:border-b-0"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="mt-1.5 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="h-5 w-16 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PricingPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<PricingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<PricingFormState>(initialFormState);
  const [isCreating, setIsCreating] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    repair_cost: string;
    item_cost: string;
  }>({
    repair_cost: "0",
    item_cost: "0",
  });
  const [isSavingItemId, setIsSavingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadPricing() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/pricing", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load pricing.");
        }

        const data = (await response.json()) as {
          items: PricingRecord[];
        };

        if (isActive) {
          setItems(sortPricingItems(data.items));
        }
      } catch {
        if (isActive) {
          setError("Unable to load pricing entries.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadPricing();

    return () => {
      isActive = false;
    };
  }, []);

  const addFormProfit = useMemo(() => {
    return roundMoney(
      parseMoneyInput(form.repair_cost) - parseMoneyInput(form.item_cost)
    );
  }, [form.item_cost, form.repair_cost]);

  const editFormProfit = useMemo(() => {
    return roundMoney(
      parseMoneyInput(editForm.repair_cost) - parseMoneyInput(editForm.item_cost)
    );
  }, [editForm.item_cost, editForm.repair_cost]);

  const stats = useMemo(() => {
    const count = items.length;
    const avgProfit =
      count === 0
        ? 0
        : items.reduce(
            (sum, item) => sum + (item.repair_cost - item.item_cost),
            0
          ) / count;
    return { count, avgProfit };
  }, [items]);

  async function handleCreateEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      const response = await fetch("/api/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_model: form.device_model,
          repair_cost: parseMoneyInput(form.repair_cost),
          item_cost: parseMoneyInput(form.item_cost),
        }),
      });

      const data = (await response.json()) as {
        item?: PricingRecord;
        error?: string;
      };

      if (!response.ok || !data.item) {
        throw new Error(data.error ?? "Failed to create pricing entry.");
      }

      setItems((currentItems) => sortPricingItems([...currentItems, data.item!]));
      setForm(initialFormState);
      setShowAddForm(false);
      notify({
        title: "Saved successfully",
        description: "Pricing model created.",
        tone: "success",
      });
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Unable to create pricing entry.";
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

  function startEditing(item: PricingRecord) {
    setEditingItemId(item._id);
    setEditForm({
      repair_cost: String(item.repair_cost),
      item_cost: String(item.item_cost),
    });
  }

  function cancelEditing() {
    setEditingItemId(null);
    setEditForm({
      repair_cost: "0",
      item_cost: "0",
    });
  }

  async function handleSaveEntry(item: PricingRecord) {
    setError(null);
    setIsSavingItemId(item._id);

    try {
      const response = await fetch(`/api/pricing/${item._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repair_cost: parseMoneyInput(editForm.repair_cost),
          item_cost: parseMoneyInput(editForm.item_cost),
        }),
      });

      const data = (await response.json()) as {
        item?: PricingRecord;
        error?: string;
      };

      if (!response.ok || !data.item) {
        throw new Error(data.error ?? "Failed to update pricing entry.");
      }

      setItems((currentItems) =>
        sortPricingItems(
          currentItems.map((currentItem) =>
            currentItem._id === item._id ? data.item! : currentItem
          )
        )
      );
      cancelEditing();
      notify({
        title: "Saved successfully",
        description: `${item.device_model} pricing updated.`,
        tone: "success",
      });
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unable to update pricing entry.";
      setError(message);
      notify({
        title: "Save failed",
        description: message,
        tone: "error",
      });
    } finally {
      setIsSavingItemId(null);
    }
  }

  async function handleDeleteEntry(item: PricingRecord) {
    if (!window.confirm(`Delete ${item.device_model}?`)) {
      return;
    }

    setError(null);
    setDeletingItemId(item._id);

    try {
      const response = await fetch(`/api/pricing/${item._id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete pricing entry.");
      }

      setItems((currentItems) =>
        currentItems.filter((currentItem) => currentItem._id !== item._id)
      );

      if (editingItemId === item._id) {
        cancelEditing();
      }
      notify({
        title: "Deleted",
        description: `${item.device_model} was removed.`,
        tone: "success",
      });
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete pricing entry.";
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
          Pricing
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h2 className="text-[26px] font-bold tracking-tight text-gray-900">
            Repair Models
          </h2>
          <button
            type="button"
            onClick={() => setShowAddForm((currentValue) => !currentValue)}
            className="flex items-center gap-1.5 rounded bg-teal-600 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{showAddForm ? "Close" : "Add Model"}</span>
          </button>
        </div>
      </div>

      {!isLoading && !error && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded border border-gray-200/70 bg-white px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Models
            </p>
            <p className="mt-1 text-[18px] font-bold tracking-tight text-teal-600">
              {stats.count}
            </p>
          </div>
          <div className="rounded border border-gray-200/70 bg-white px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Avg Profit
            </p>
            <p className="mt-1 text-[18px] font-bold tracking-tight text-emerald-600">
              {formatCurrency(stats.avgProfit)}
            </p>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="rounded border border-gray-200/70 bg-white p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
            New Model
          </p>
          <form className="space-y-3" onSubmit={handleCreateEntry}>
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
                placeholder="iPhone 15 Pro - Screen"
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-gray-700">
                  Repair Cost
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.repair_cost}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      repair_cost: event.target.value,
                    }))
                  }
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-gray-700">
                  Item Cost
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.item_cost}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      item_cost: event.target.value,
                    }))
                  }
                  className={inputClassName}
                />
              </label>
            </div>

            <div className="flex items-center justify-between rounded border border-emerald-100 bg-emerald-50 px-3.5 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Gross Profit
              </p>
              <p className="text-[16px] font-bold text-emerald-700">
                {formatCurrency(addFormProfit)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="submit"
                disabled={isCreating}
                className="rounded bg-teal-600 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Adding..." : "Save Model"}
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
        <PricingSkeleton />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded border border-gray-200/70 bg-white px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-gray-400">
            <TagIcon className="h-7 w-7" />
          </div>
          <p className="mt-4 text-[15px] font-semibold text-gray-900">
            No pricing yet
          </p>
          <p className="mt-1 text-[13px] text-gray-500">
            Add your first repair model to start tracking profit.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded border border-gray-200/70 bg-white">
          {items.map((item, itemIndex) => {
            const isEditing = editingItemId === item._id;
            const isSaving = isSavingItemId === item._id;
            const isDeleting = deletingItemId === item._id;
            const grossProfit = roundMoney(item.repair_cost - item.item_cost);
            const isLast = itemIndex === items.length - 1;

            if (isEditing) {
              return (
                <div
                  key={item._id}
                  className={`bg-gray-50 px-4 py-4 ${
                    isLast ? "" : "border-b border-gray-100"
                  }`}
                >
                  <p className="text-[15px] font-semibold text-gray-900">
                    {item.device_model}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-semibold text-gray-700">
                        Repair Cost
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.repair_cost}
                        onChange={(event) =>
                          setEditForm((currentForm) => ({
                            ...currentForm,
                            repair_cost: event.target.value,
                          }))
                        }
                        className={inputClassName}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-semibold text-gray-700">
                        Item Cost
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.item_cost}
                        onChange={(event) =>
                          setEditForm((currentForm) => ({
                            ...currentForm,
                            item_cost: event.target.value,
                          }))
                        }
                        className={inputClassName}
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded border border-emerald-100 bg-emerald-50 px-3.5 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                      Gross Profit
                    </p>
                    <p className="text-[16px] font-bold text-emerald-700">
                      {formatCurrency(editFormProfit)}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        void handleSaveEntry(item);
                      }}
                      disabled={isSaving}
                      className="rounded bg-teal-600 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="rounded border border-gray-200 bg-white px-3 py-2 text-[13px] font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDeleteEntry(item);
                      }}
                      disabled={isDeleting}
                      className="rounded border border-red-200 bg-white px-3 py-2 text-[13px] font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeleting ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item._id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  isLast ? "" : "border-b border-gray-100"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-gray-900">
                    {item.device_model}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-gray-500">
                    <span>{formatCurrency(item.repair_cost)}</span>
                    <span
                      className="inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-gray-300"
                      aria-hidden="true"
                    />
                    <span>Cost {formatCurrency(item.item_cost)}</span>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Profit
                  </p>
                  <p className="text-[14px] font-bold text-emerald-600">
                    {formatCurrency(grossProfit)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startEditing(item)}
                  className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded text-gray-400 transition hover:bg-teal-50 hover:text-teal-600"
                  aria-label={`Edit pricing for ${item.device_model}`}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
