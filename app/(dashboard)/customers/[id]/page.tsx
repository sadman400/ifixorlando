"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  formatAppointmentDateLong,
  formatAppointmentStatus,
  getAppointmentStatusBarColor,
  getAppointmentStatusTextColor,
  type AppointmentRecord,
} from "@/lib/appointments";
import { type CustomerRecord } from "@/lib/customers";

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

function CalendarIcon({ className }: IconProps) {
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
      <rect x="3" y="5.5" width="18" height="15.5" rx="2.5" />
      <path d="M3 10.5h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-teal-100 text-teal-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function parseCostValue(cost: string) {
  const match = cost.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : 0;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
      {title}
    </h2>
  );
}

function ActionRow({
  href,
  icon,
  label,
  value,
  isLast,
  external,
  iconTone = "teal",
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
  external?: boolean;
  iconTone?: "teal" | "sky" | "violet";
}) {
  const toneMap = {
    teal: "bg-teal-50 text-teal-600",
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
  };

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
      className={`flex items-center gap-3 px-4 py-3 transition active:bg-gray-50 ${
        isLast ? "" : "border-b border-gray-100"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded ${toneMap[iconTone]}`}
      >
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

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "teal" | "emerald" | "amber";
}) {
  const toneMap = {
    teal: "text-teal-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
  };

  return (
    <div className="rounded border border-gray-200/70 bg-white px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p
        className={`mt-1 text-[18px] font-bold tracking-tight ${toneMap[tone]}`}
      >
        {value}
      </p>
    </div>
  );
}

function CustomerDetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      <div className="rounded border border-gray-200/70 bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 animate-pulse rounded bg-gray-200" />
          <div className="min-w-0 flex-1">
            <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded border border-gray-200/70 bg-white"
          />
        ))}
      </div>
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index}>
          <div className="mb-2 h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-28 animate-pulse rounded border border-gray-200/70 bg-white" />
        </div>
      ))}
    </div>
  );
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const customerId = params.id;
  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadCustomer() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/customers/${customerId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load customer.");
        }

        const data = (await response.json()) as {
          customer: CustomerRecord;
          appointments: AppointmentRecord[];
        };

        if (isActive) {
          setCustomer(data.customer);
          setAppointments(data.appointments);
        }
      } catch {
        if (isActive) {
          setError("Unable to load the customer details.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    if (customerId) {
      void loadCustomer();
    }

    return () => {
      isActive = false;
    };
  }, [customerId]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(
      (appointment) => appointment.status === "completed"
    ).length;
    const totalSpend = appointments
      .filter((appointment) => appointment.status === "completed")
      .reduce(
        (sum, appointment) => sum + parseCostValue(appointment.service_cost),
        0
      );

    return {
      total,
      completed,
      totalSpend,
    };
  }, [appointments]);

  const sortedAppointments = useMemo(
    () =>
      appointments
        .slice()
        .sort(
          (a, b) =>
            new Date(b.start_at || 0).getTime() -
            new Date(a.start_at || 0).getTime()
        ),
    [appointments]
  );

  if (isLoading) {
    return <CustomerDetailSkeleton />;
  }

  if (error && !customer) {
    return (
      <div className="rounded border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
        {error}
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="rounded border border-gray-200/70 bg-white px-4 py-5 text-center text-[13px] text-gray-500">
        Customer not found.
      </div>
    );
  }

  const fullAddress = [customer.address, customer.zip]
    .filter(Boolean)
    .join(", ");
  const mapUrl = fullAddress
    ? `https://maps.apple.com/?q=${encodeURIComponent(fullAddress)}`
    : "";
  const callHref = customer.phone ? `tel:${customer.phone}` : "";
  const smsHref = customer.phone
    ? `sms:${customer.phone}?body=${encodeURIComponent(`Hi ${customer.name},`)}`
    : "";
  const mailHref = customer.email ? `mailto:${customer.email}` : "";

  const formattedSpend = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(stats.totalSpend);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/customers"
          className="flex items-center gap-1 text-[14px] font-semibold text-teal-600 transition hover:text-teal-700"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Clients</span>
        </Link>
      </div>

      <div className="rounded border border-gray-200/70 bg-white px-5 py-5">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded text-[18px] font-bold ${getAvatarColor(
              customer.name
            )}`}
            aria-hidden="true"
          >
            {getInitials(customer.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[22px] font-bold leading-tight tracking-tight text-gray-900">
              {customer.name || "Unnamed"}
            </h1>
            <p className="mt-0.5 truncate text-[13px] text-gray-500">
              {customer.phone || customer.email || "No contact info"}
            </p>
          </div>
        </div>
      </div>

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
          href={smsHref || undefined}
          aria-disabled={!smsHref}
          onClick={(event) => {
            if (!smsHref) {
              event.preventDefault();
            }
          }}
          className={`flex flex-col items-center gap-1.5 rounded border border-gray-200/70 bg-white px-3 py-3.5 transition ${
            smsHref
              ? "text-gray-700 active:bg-gray-50"
              : "cursor-not-allowed text-gray-300"
          }`}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded ${
              smsHref ? "bg-sky-50 text-sky-600" : "bg-gray-100 text-gray-300"
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

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Total" value={String(stats.total)} tone="teal" />
        <StatTile
          label="Completed"
          value={String(stats.completed)}
          tone="emerald"
        />
        <StatTile label="Spend" value={formattedSpend} tone="amber" />
      </div>

      <div>
        <SectionHeader title="Contact" />
        <div className="overflow-hidden rounded border border-gray-200/70 bg-white">
          <ActionRow
            href={callHref}
            icon={<PhoneIcon className="h-4 w-4" />}
            label="Phone"
            value={customer.phone}
            iconTone="teal"
          />
          <ActionRow
            href={mailHref}
            icon={<MailIcon className="h-4 w-4" />}
            label="Email"
            value={customer.email}
            iconTone="sky"
          />
          <ActionRow
            href={mapUrl}
            icon={<MapPinIcon className="h-4 w-4" />}
            label="Address"
            value={fullAddress}
            iconTone="violet"
            external
            isLast
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
            Appointment History
          </h3>
          {sortedAppointments.length > 0 && (
            <span className="text-[11px] font-semibold text-gray-400">
              {sortedAppointments.length}{" "}
              {sortedAppointments.length === 1 ? "job" : "jobs"}
            </span>
          )}
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded border border-gray-200/70 bg-white px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-gray-400">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <p className="mt-3 text-[14px] font-semibold text-gray-900">
              No appointments yet
            </p>
            <p className="mt-0.5 text-[12px] text-gray-500">
              This client has no repair history.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded border border-gray-200/70 bg-white">
            {sortedAppointments.map((appointment, index) => {
              const isLast = index === sortedAppointments.length - 1;
              return (
                <Link
                  key={appointment._id}
                  href={`/appointments/${appointment._id}`}
                  className={`relative flex items-center gap-4 px-4 py-3.5 transition active:bg-gray-50 ${
                    isLast ? "" : "border-b border-gray-100"
                  }`}
                >
                  <span
                    className={`absolute inset-y-2 left-0 w-[3px] rounded-r ${getAppointmentStatusBarColor(
                      appointment.status
                    )}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1 pl-1">
                    <p className="truncate text-[15px] font-semibold text-gray-900">
                      {appointment.service_title || "Service"}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-gray-500">
                      <span className="truncate">
                        {formatAppointmentDateLong(appointment.start_at)}
                      </span>
                      <span
                        className="inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-gray-300"
                        aria-hidden="true"
                      />
                      <span
                        className={`shrink-0 font-semibold ${getAppointmentStatusTextColor(
                          appointment.status
                        )}`}
                      >
                        {formatAppointmentStatus(appointment.status)}
                      </span>
                    </p>
                  </div>
                  {appointment.service_cost && (
                    <p className="shrink-0 text-[13px] font-semibold text-gray-700">
                      {appointment.service_cost}
                    </p>
                  )}
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-300" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
