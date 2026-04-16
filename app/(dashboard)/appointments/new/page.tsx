"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppointmentRecord } from "@/lib/appointments";
import { useToast } from "@/components/ui/toast-provider";

type IconProps = {
  className?: string;
};

function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

type NewAppointmentDraft = {
  service_title: string;
  service_descriptions: string;
  service_cost: string;
  service_charge: string;
  start_at: string;
  end_at: string;
  consumer_name: string;
  consumer_email: string;
  consumer_mobile: string;
  consumer_zip: string;
  consumer_address: string;
  consumer_unit: string;
  coupon_code: string;
  add_ons: string;
  notes: string;
};

const inputClassName =
  "w-full rounded border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(20,184,166,0.12)]";

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
      {title}
    </h2>
  );
}

function Field({
  label,
  children,
  span,
}: {
  label: string;
  children: React.ReactNode;
  span?: "full";
}) {
  return (
    <label className={`block ${span === "full" ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-[12px] font-semibold text-gray-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function getDefaultStart() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  const offset = now.getTime() - now.getTimezoneOffset() * 60000;
  return new Date(offset).toISOString().slice(0, 16);
}

function toIsoString(value: string) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString();
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const { notify } = useToast();

  const defaultStart = useMemo(() => getDefaultStart(), []);

  const [draft, setDraft] = useState<NewAppointmentDraft>({
    service_title: "",
    service_descriptions: "",
    service_cost: "",
    service_charge: "",
    start_at: defaultStart,
    end_at: "",
    consumer_name: "",
    consumer_email: "",
    consumer_mobile: "",
    consumer_zip: "",
    consumer_address: "",
    consumer_unit: "",
    coupon_code: "",
    add_ons: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field: keyof NewAppointmentDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function handleCreate() {
    if (!draft.consumer_name.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!draft.service_title.trim()) {
      setError("Service title is required.");
      return;
    }

    if (!draft.start_at) {
      setError("Start time is required.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_title: draft.service_title,
          service_descriptions: draft.service_descriptions,
          service_cost: draft.service_cost,
          service_charge: draft.service_charge,
          start_at: toIsoString(draft.start_at),
          end_at: draft.end_at ? toIsoString(draft.end_at) : "",
          consumer_name: draft.consumer_name,
          consumer_email: draft.consumer_email,
          consumer_mobile: draft.consumer_mobile,
          consumer_zip: draft.consumer_zip,
          consumer_address: draft.consumer_address,
          consumer_unit: draft.consumer_unit,
          coupon_code: draft.coupon_code,
          add_ons: draft.add_ons,
          notes: draft.notes,
        }),
      });

      const data = (await response.json()) as {
        appointment?: AppointmentRecord;
        error?: string;
      };

      if (!response.ok || !data.appointment) {
        throw new Error(data.error ?? "Failed to create appointment.");
      }

      notify({
        title: "Appointment created",
        description: "The new appointment has been scheduled.",
        tone: "success",
      });

      router.replace(`/appointments/${data.appointment._id}`);
      router.refresh();
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Unable to create the appointment.";
      setError(message);
      notify({
        title: "Create failed",
        description: message,
        tone: "error",
      });
      setIsSaving(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-1 text-[14px] font-semibold text-teal-600 transition hover:text-teal-700"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Cancel</span>
        </button>
        <button
          type="button"
          onClick={() => {
            void handleCreate();
          }}
          disabled={isSaving}
          className="text-[14px] font-semibold text-teal-600 transition hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Creating..." : "Create"}
        </button>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
          Appointments
        </p>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight text-gray-900">
          New appointment
        </h1>
        <p className="mt-1 text-[13px] text-gray-500">
          Schedule a repair manually by filling in the details below.
        </p>
      </div>

      {error && (
        <div className="rounded border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      <div>
        <SectionHeader title="Customer" />
        <div className="rounded border border-gray-200/70 bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" span="full">
              <input
                value={draft.consumer_name}
                onChange={(event) =>
                  updateField("consumer_name", event.target.value)
                }
                placeholder="Full name"
                className={inputClassName}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={draft.consumer_email}
                onChange={(event) =>
                  updateField("consumer_email", event.target.value)
                }
                placeholder="name@example.com"
                className={inputClassName}
              />
            </Field>
            <Field label="Mobile">
              <input
                type="tel"
                value={draft.consumer_mobile}
                onChange={(event) =>
                  updateField("consumer_mobile", event.target.value)
                }
                placeholder="(555) 555-5555"
                className={inputClassName}
              />
            </Field>
            <Field label="Address" span="full">
              <input
                value={draft.consumer_address}
                onChange={(event) =>
                  updateField("consumer_address", event.target.value)
                }
                placeholder="Street address"
                className={inputClassName}
              />
            </Field>
            <Field label="Unit">
              <input
                value={draft.consumer_unit}
                onChange={(event) =>
                  updateField("consumer_unit", event.target.value)
                }
                placeholder="Apt / Suite"
                className={inputClassName}
              />
            </Field>
            <Field label="Zip">
              <input
                value={draft.consumer_zip}
                onChange={(event) =>
                  updateField("consumer_zip", event.target.value)
                }
                placeholder="ZIP code"
                className={inputClassName}
              />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Service" />
        <div className="rounded border border-gray-200/70 bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Service Title" span="full">
              <input
                value={draft.service_title}
                onChange={(event) =>
                  updateField("service_title", event.target.value)
                }
                placeholder="e.g. iPhone 13 Screen Repair"
                className={inputClassName}
              />
            </Field>
            <Field label="Descriptions" span="full">
              <textarea
                rows={4}
                value={draft.service_descriptions}
                onChange={(event) =>
                  updateField("service_descriptions", event.target.value)
                }
                placeholder="Repair scope, notes..."
                className={`${inputClassName} resize-none`}
              />
            </Field>
            <Field label="Cost">
              <input
                value={draft.service_cost}
                onChange={(event) =>
                  updateField("service_cost", event.target.value)
                }
                placeholder="$0.00"
                className={inputClassName}
              />
            </Field>
            <Field label="Charge">
              <input
                value={draft.service_charge}
                onChange={(event) =>
                  updateField("service_charge", event.target.value)
                }
                placeholder="$0.00"
                className={inputClassName}
              />
            </Field>
            <Field label="Coupon">
              <input
                value={draft.coupon_code}
                onChange={(event) =>
                  updateField("coupon_code", event.target.value)
                }
                placeholder="Optional"
                className={inputClassName}
              />
            </Field>
            <Field label="Add-ons">
              <input
                value={draft.add_ons}
                onChange={(event) => updateField("add_ons", event.target.value)}
                placeholder="Optional"
                className={inputClassName}
              />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Schedule" />
        <div className="rounded border border-gray-200/70 bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start">
              <input
                type="datetime-local"
                value={draft.start_at}
                onChange={(event) =>
                  updateField("start_at", event.target.value)
                }
                className={inputClassName}
              />
            </Field>
            <Field label="End (optional)">
              <input
                type="datetime-local"
                value={draft.end_at}
                onChange={(event) => updateField("end_at", event.target.value)}
                className={inputClassName}
              />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Notes" />
        <div className="rounded border border-gray-200/70 bg-white p-4">
          <textarea
            rows={4}
            value={draft.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Private notes for this job"
            className={`${inputClassName} resize-none`}
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            void handleCreate();
          }}
          disabled={isSaving}
          className="w-full rounded bg-teal-600 px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Creating..." : "Create Appointment"}
        </button>
      </div>
    </section>
  );
}
