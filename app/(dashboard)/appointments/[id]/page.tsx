"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  appointmentStatuses,
  buildAppleMapsUrl,
  buildAppointmentAddress,
  buildSmsUrl,
  type AppointmentRecord,
  type AppointmentStatus,
  formatAppointmentDateLong,
  formatAppointmentStatus,
  getAppointmentStatusBarColor,
  getAppointmentStatusStyles,
  getAppointmentStatusTextColor,
  toDatetimeLocalValue,
} from "@/lib/appointments";
import { useToast } from "@/components/ui/toast-provider";

type AppointmentEditDraft = {
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
};

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

function ChevronRightIcon({ className }: IconProps) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function PhoneIcon({ className }: IconProps) {
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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.8 12.8 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.8 12.8 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function MailIcon({ className }: IconProps) {
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
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function MapPinIcon({ className }: IconProps) {
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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function MessageIcon({ className }: IconProps) {
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
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: IconProps) {
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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
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

function ClockIcon({ className }: IconProps) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function createDraft(appointment: AppointmentRecord): AppointmentEditDraft {
  return {
    service_title: appointment.service_title,
    service_descriptions: appointment.service_descriptions,
    service_cost: appointment.service_cost,
    service_charge: appointment.service_charge,
    start_at: toDatetimeLocalValue(appointment.start_at),
    end_at: toDatetimeLocalValue(appointment.end_at),
    consumer_name: appointment.consumer_name,
    consumer_email: appointment.consumer_email,
    consumer_mobile: appointment.consumer_mobile,
    consumer_zip: appointment.consumer_zip,
    consumer_address: appointment.consumer_address,
    consumer_unit: appointment.consumer_unit,
    coupon_code: appointment.coupon_code,
    add_ons: appointment.add_ons,
  };
}

function toIsoString(value: string) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString();
}

const inputClassName =
  "w-full rounded border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(20,184,166,0.12)]";

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
      {title}
    </h2>
  );
}

function GroupedCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded border border-gray-200/70 bg-white">
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}) {
  const hasValue =
    value !== null && value !== undefined && value !== "" && value !== false;

  return (
    <div
      className={`flex items-start justify-between gap-4 px-4 py-3 ${
        isLast ? "" : "border-b border-gray-100"
      }`}
    >
      <span className="shrink-0 text-[13px] text-gray-500">{label}</span>
      <span className="min-w-0 text-right text-[14px] font-medium text-gray-900">
        {hasValue ? value : <span className="text-gray-400">Not provided</span>}
      </span>
    </div>
  );
}

function ActionRow({
  href,
  icon,
  label,
  value,
  isLast,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
  external?: boolean;
}) {
  const rowClass = `flex items-center gap-3 px-4 py-3 transition active:bg-gray-50 ${
    isLast ? "" : "border-b border-gray-100"
  }`;

  if (!value) {
    return (
      <div
        className={`flex items-center gap-3 px-4 py-3 ${
          isLast ? "" : "border-b border-gray-100"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-400">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <p className="truncate text-[14px] text-gray-400">Not provided</p>
        </div>
      </div>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={rowClass}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-teal-50 text-teal-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <p className="truncate text-[14px] font-semibold text-gray-900">
          {value}
        </p>
      </div>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-300" />
    </a>
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

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      <div className="rounded border border-gray-200/70 bg-white p-5">
        <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
        <div className="mt-3 h-6 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-100" />
        <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-gray-100" />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index}>
          <div className="mb-2 h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="overflow-hidden rounded border border-gray-200/70 bg-white">
            {Array.from({ length: 2 }).map((__, rowIndex) => (
              <div
                key={rowIndex}
                className="border-b border-gray-100 px-4 py-3 last:border-b-0"
              >
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AppointmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const appointmentId = params.id;
  const { notify } = useToast();

  const [appointment, setAppointment] = useState<AppointmentRecord | null>(
    null
  );
  const [draft, setDraft] = useState<AppointmentEditDraft | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadAppointment() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/appointments/${appointmentId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load appointment.");
        }

        const data = (await response.json()) as {
          appointment: AppointmentRecord;
        };

        if (isActive) {
          setAppointment(data.appointment);
          setDraft(createDraft(data.appointment));
          setNotesDraft(data.appointment.notes);
        }
      } catch {
        if (isActive) {
          setError("Unable to load the appointment details.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    if (appointmentId) {
      void loadAppointment();
    }

    return () => {
      isActive = false;
    };
  }, [appointmentId]);

  async function patchAppointment(payload: Record<string, unknown>) {
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as {
      appointment?: AppointmentRecord;
      error?: string;
    };

    if (!response.ok || !data.appointment) {
      throw new Error(data.error ?? "Failed to update the appointment.");
    }

    setAppointment(data.appointment);
    setDraft(createDraft(data.appointment));
    setNotesDraft(data.appointment.notes);
    return data.appointment;
  }

  function updateDraftField(
    field: keyof AppointmentEditDraft,
    value: string
  ) {
    setDraft((currentDraft) =>
      currentDraft
        ? {
            ...currentDraft,
            [field]: value,
          }
        : currentDraft
    );
  }

  async function handleStatusChange(nextStatus: AppointmentStatus) {
    if (appointment?.status === nextStatus) {
      return;
    }

    setError(null);
    setIsUpdatingStatus(true);

    try {
      await patchAppointment({ status: nextStatus });
      notify({
        title: "Appointment updated",
        description: `Status changed to ${formatAppointmentStatus(nextStatus)}.`,
        tone: "success",
      });
    } catch (statusError) {
      const message =
        statusError instanceof Error
          ? statusError.message
          : "Unable to update the appointment status.";
      setError(message);
      notify({
        title: "Update failed",
        description: message,
        tone: "error",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleMarkCompleted() {
    if (!appointment) {
      return;
    }

    setError(null);
    setIsCompleting(true);

    try {
      const updatedAppointment =
        appointment.status === "completed"
          ? appointment
          : await patchAppointment({ status: "completed" });

      await fetch("/api/inventory/deduct", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_model: updatedAppointment.service_title,
        }),
      });

      notify({
        title: "Appointment updated",
        description: "Marked completed and synced inventory.",
        tone: "success",
      });
    } catch (completeError) {
      const message =
        completeError instanceof Error
          ? completeError.message
          : "Unable to mark the appointment as completed.";
      setError(message);
      notify({
        title: "Update failed",
        description: message,
        tone: "error",
      });
    } finally {
      setIsCompleting(false);
    }
  }

  async function handleDelete() {
    if (!appointment || !window.confirm("Delete this appointment?")) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to delete the appointment.");
      }

      notify({
        title: "Deleted",
        description: "Appointment removed successfully.",
        tone: "success",
      });
      router.replace("/appointments");
      router.refresh();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete the appointment.";
      setError(message);
      notify({
        title: "Delete failed",
        description: message,
        tone: "error",
      });
      setIsDeleting(false);
    }
  }

  async function handleSaveNotes() {
    setError(null);
    setIsSavingNotes(true);

    try {
      await patchAppointment({ notes: notesDraft });
      notify({
        title: "Saved successfully",
        description: "Appointment notes were updated.",
        tone: "success",
      });
    } catch (notesError) {
      const message =
        notesError instanceof Error
          ? notesError.message
          : "Unable to save notes.";
      setError(message);
      notify({
        title: "Save failed",
        description: message,
        tone: "error",
      });
    } finally {
      setIsSavingNotes(false);
    }
  }

  async function handleSaveEdit() {
    if (!draft) {
      return;
    }

    setError(null);
    setIsSavingEdit(true);

    try {
      await patchAppointment({
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
      });

      setIsEditMode(false);
      notify({
        title: "Appointment updated",
        description: "Appointment details were saved.",
        tone: "success",
      });
    } catch (saveError) {
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unable to save appointment changes.";
      setError(message);
      notify({
        title: "Save failed",
        description: message,
        tone: "error",
      });
    } finally {
      setIsSavingEdit(false);
    }
  }

  function handleCancelEdit() {
    if (!appointment) {
      return;
    }

    setDraft(createDraft(appointment));
    setIsEditMode(false);
  }

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error && !appointment) {
    return (
      <div className="rounded border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
        {error}
      </div>
    );
  }

  if (!appointment || !draft) {
    return (
      <div className="rounded border border-gray-200/70 bg-white px-4 py-5 text-center text-[13px] text-gray-500">
        Appointment not found.
      </div>
    );
  }

  const fullAddress = buildAppointmentAddress(appointment);
  const mapUrl = buildAppleMapsUrl(fullAddress);
  const smsTemplates = [
    {
      label: "On My Way",
      description: "Let them know you're heading over",
      href: buildSmsUrl(
        appointment.consumer_mobile,
        `Hi ${appointment.consumer_name}, I'm on my way to your location. See you soon!`
      ),
    },
    {
      label: "Running Late",
      description: "Heads up about a small delay",
      href: buildSmsUrl(
        appointment.consumer_mobile,
        `Hi ${appointment.consumer_name}, I'm running a bit behind schedule. I'll be there shortly, sorry for the delay!`
      ),
    },
    {
      label: "Repair Complete",
      description: "Notify them the job is done",
      href: buildSmsUrl(
        appointment.consumer_mobile,
        `Hi ${appointment.consumer_name}, your ${appointment.service_title} repair is all done! Thank you for choosing iFixOrlando.`
      ),
    },
  ];

  if (isEditMode) {
    return (
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="flex items-center gap-1 text-[14px] font-semibold text-teal-600 transition hover:text-teal-700"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            onClick={() => {
              void handleSaveEdit();
            }}
            disabled={isSavingEdit}
            className="text-[14px] font-semibold text-teal-600 transition hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingEdit ? "Saving..." : "Save"}
          </button>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
            Appointment
          </p>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight text-gray-900">
            Edit details
          </h1>
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
                    updateDraftField("consumer_name", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={draft.consumer_email}
                  onChange={(event) =>
                    updateDraftField("consumer_email", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Mobile">
                <input
                  type="tel"
                  value={draft.consumer_mobile}
                  onChange={(event) =>
                    updateDraftField("consumer_mobile", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Address" span="full">
                <input
                  value={draft.consumer_address}
                  onChange={(event) =>
                    updateDraftField("consumer_address", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Unit">
                <input
                  value={draft.consumer_unit}
                  onChange={(event) =>
                    updateDraftField("consumer_unit", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Zip">
                <input
                  value={draft.consumer_zip}
                  onChange={(event) =>
                    updateDraftField("consumer_zip", event.target.value)
                  }
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
                    updateDraftField("service_title", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Descriptions" span="full">
                <textarea
                  rows={4}
                  value={draft.service_descriptions}
                  onChange={(event) =>
                    updateDraftField(
                      "service_descriptions",
                      event.target.value
                    )
                  }
                  className={`${inputClassName} resize-none`}
                />
              </Field>
              <Field label="Cost">
                <input
                  value={draft.service_cost}
                  onChange={(event) =>
                    updateDraftField("service_cost", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Charge">
                <input
                  value={draft.service_charge}
                  onChange={(event) =>
                    updateDraftField("service_charge", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Add-ons">
                <input
                  value={draft.add_ons}
                  onChange={(event) =>
                    updateDraftField("add_ons", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="Coupon Code">
                <input
                  value={draft.coupon_code}
                  onChange={(event) =>
                    updateDraftField("coupon_code", event.target.value)
                  }
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
              <Field label="Start Time">
                <input
                  type="datetime-local"
                  value={draft.start_at}
                  onChange={(event) =>
                    updateDraftField("start_at", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
              <Field label="End Time">
                <input
                  type="datetime-local"
                  value={draft.end_at}
                  onChange={(event) =>
                    updateDraftField("end_at", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              void handleSaveEdit();
            }}
            disabled={isSavingEdit}
            className="rounded bg-teal-600 px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingEdit ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="rounded border border-gray-200 bg-white px-4 py-3 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </section>
    );
  }

  const statusBarColor = getAppointmentStatusBarColor(appointment.status);
  const statusTextColor = getAppointmentStatusTextColor(appointment.status);
  const callHref = appointment.consumer_mobile
    ? `tel:${appointment.consumer_mobile}`
    : "";
  const quickSmsHref = buildSmsUrl(
    appointment.consumer_mobile,
    `Hi ${appointment.consumer_name},`
  );

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/appointments"
          className="flex items-center gap-1 text-[14px] font-semibold text-teal-600 transition hover:text-teal-700"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Appointments</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsEditMode(true)}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-[14px] font-semibold text-teal-600 transition hover:bg-teal-50 hover:text-teal-700"
        >
          <PencilIcon className="h-4 w-4" />
          <span>Edit</span>
        </button>
      </div>

      <div className="relative overflow-hidden rounded border border-gray-200/70 bg-white">
        <span
          className={`absolute inset-y-0 left-0 w-1 ${statusBarColor}`}
          aria-hidden="true"
        />
        <div className="px-5 py-5 pl-6">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${statusTextColor}`}
          >
            {formatAppointmentStatus(appointment.status)}
          </p>
          <h1 className="mt-1.5 text-[22px] font-bold leading-tight tracking-tight text-gray-900">
            {appointment.consumer_name}
          </h1>
          <p className="mt-1 text-[14px] text-gray-600">
            {appointment.service_title || "Service not specified"}
          </p>
          <div className="mt-4 flex items-center gap-2 text-[13px] text-gray-500">
            <ClockIcon className="h-4 w-4 shrink-0 text-gray-400" />
            <span>{formatAppointmentDateLong(appointment.start_at)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <a
          href={callHref || undefined}
          aria-disabled={!callHref}
          onClick={(event) => {
            if (!callHref) {
              event.preventDefault();
            }
          }}
          className={`flex flex-col items-center gap-1.5 rounded border border-gray-200/70 bg-white px-3 py-3.5 transition ${
            callHref
              ? "text-gray-700 active:bg-gray-50"
              : "cursor-not-allowed text-gray-300"
          }`}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded ${
              callHref ? "bg-teal-50 text-teal-600" : "bg-gray-100 text-gray-300"
            }`}
          >
            <PhoneIcon className="h-[18px] w-[18px]" />
          </div>
          <span className="text-[11px] font-semibold">Call</span>
        </a>
        <a
          href={quickSmsHref || undefined}
          aria-disabled={!quickSmsHref}
          onClick={(event) => {
            if (!quickSmsHref) {
              event.preventDefault();
            }
          }}
          className={`flex flex-col items-center gap-1.5 rounded border border-gray-200/70 bg-white px-3 py-3.5 transition ${
            quickSmsHref
              ? "text-gray-700 active:bg-gray-50"
              : "cursor-not-allowed text-gray-300"
          }`}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded ${
              quickSmsHref
                ? "bg-sky-50 text-sky-600"
                : "bg-gray-100 text-gray-300"
            }`}
          >
            <MessageIcon className="h-[18px] w-[18px]" />
          </div>
          <span className="text-[11px] font-semibold">Message</span>
        </a>
        <a
          href={mapUrl || undefined}
          target={mapUrl ? "_blank" : undefined}
          rel={mapUrl ? "noopener noreferrer" : undefined}
          aria-disabled={!mapUrl}
          onClick={(event) => {
            if (!mapUrl) {
              event.preventDefault();
            }
          }}
          className={`flex flex-col items-center gap-1.5 rounded border border-gray-200/70 bg-white px-3 py-3.5 transition ${
            mapUrl
              ? "text-gray-700 active:bg-gray-50"
              : "cursor-not-allowed text-gray-300"
          }`}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded ${
              mapUrl
                ? "bg-violet-50 text-violet-600"
                : "bg-gray-100 text-gray-300"
            }`}
          >
            <MapPinIcon className="h-[18px] w-[18px]" />
          </div>
          <span className="text-[11px] font-semibold">Directions</span>
        </a>
      </div>

      <div>
        <SectionHeader title="Status" />
        <div className="rounded border border-gray-200/70 bg-white p-3">
          <div className="grid grid-cols-2 gap-2">
            {appointmentStatuses.map((status) => {
              const isActive = appointment.status === status;
              return (
                <button
                  key={status}
                  type="button"
                  disabled={isUpdatingStatus || isCompleting}
                  onClick={() => {
                    void handleStatusChange(status);
                  }}
                  className={`rounded px-3 py-2.5 text-[13px] font-semibold transition disabled:cursor-not-allowed ${
                    isActive
                      ? getAppointmentStatusStyles(status)
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                  }`}
                >
                  {formatAppointmentStatus(status)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title="Contact" />
        <GroupedCard>
          <ActionRow
            href={callHref}
            icon={<PhoneIcon className="h-4 w-4" />}
            label="Mobile"
            value={appointment.consumer_mobile}
          />
          <ActionRow
            href={
              appointment.consumer_email
                ? `mailto:${appointment.consumer_email}`
                : ""
            }
            icon={<MailIcon className="h-4 w-4" />}
            label="Email"
            value={appointment.consumer_email}
          />
          <ActionRow
            href={mapUrl}
            icon={<MapPinIcon className="h-4 w-4" />}
            label="Address"
            value={fullAddress}
            external
            isLast
          />
        </GroupedCard>
      </div>

      <div>
        <SectionHeader title="Service" />
        <GroupedCard>
          <InfoRow label="Title" value={appointment.service_title} />
          <InfoRow
            label="Descriptions"
            value={appointment.service_descriptions}
          />
          <InfoRow label="Cost" value={appointment.service_cost} />
          <InfoRow label="Charge" value={appointment.service_charge} />
          <InfoRow label="Add-ons" value={appointment.add_ons} />
          <InfoRow label="Coupon" value={appointment.coupon_code} isLast />
        </GroupedCard>
      </div>

      <div>
        <SectionHeader title="Schedule" />
        <GroupedCard>
          <InfoRow
            label="Start"
            value={formatAppointmentDateLong(appointment.start_at)}
          />
          <InfoRow
            label="End"
            value={formatAppointmentDateLong(appointment.end_at)}
            isLast
          />
        </GroupedCard>
      </div>

      <div>
        <SectionHeader title="Notes" />
        <div className="rounded border border-gray-200/70 bg-white p-4">
          <textarea
            value={notesDraft}
            onChange={(event) => setNotesDraft(event.target.value)}
            rows={5}
            className={`${inputClassName} resize-none`}
            placeholder="Add appointment notes..."
          />
          <button
            type="button"
            onClick={() => {
              void handleSaveNotes();
            }}
            disabled={isSavingNotes || notesDraft === appointment.notes}
            className="mt-3 w-full rounded bg-teal-600 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingNotes ? "Saving..." : "Save Notes"}
          </button>
        </div>
      </div>

      <div>
        <SectionHeader title="Quick Messages" />
        <GroupedCard>
          {smsTemplates.map((template, index) => {
            const isLast = index === smsTemplates.length - 1;
            const disabled = !template.href;

            if (disabled) {
              return (
                <div
                  key={template.label}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    isLast ? "" : "border-b border-gray-100"
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-400">
                    <MessageIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-gray-400">
                      {template.label}
                    </p>
                    <p className="truncate text-[12px] text-gray-400">
                      No mobile number
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <a
                key={template.label}
                href={template.href}
                className={`flex items-center gap-3 px-4 py-3 transition active:bg-gray-50 ${
                  isLast ? "" : "border-b border-gray-100"
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-sky-50 text-sky-600">
                  <MessageIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-gray-900">
                    {template.label}
                  </p>
                  <p className="truncate text-[12px] text-gray-500">
                    {template.description}
                  </p>
                </div>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-300" />
              </a>
            );
          })}
        </GroupedCard>
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => {
            void handleMarkCompleted();
          }}
          disabled={isCompleting || appointment.status === "completed"}
          className="flex w-full items-center justify-center gap-2 rounded bg-emerald-600 px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircleIcon className="h-5 w-5" />
          <span>
            {isCompleting
              ? "Completing..."
              : appointment.status === "completed"
                ? "Completed"
                : "Mark Completed"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            void handleDelete();
          }}
          disabled={isDeleting}
          className="flex w-full items-center justify-center gap-2 rounded border border-red-200 bg-white px-4 py-3.5 text-[14px] font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <TrashIcon className="h-4 w-4" />
          <span>{isDeleting ? "Deleting..." : "Delete Appointment"}</span>
        </button>
      </div>
    </section>
  );
}
