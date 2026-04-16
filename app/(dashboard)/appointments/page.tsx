"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  type AppointmentRecord,
  formatAppointmentStatus,
  getAppointmentStatusBarColor,
  getAppointmentStatusTextColor,
} from "@/lib/appointments";

type IconProps = {
  className?: string;
};

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

function CalendarEmptyIcon({ className }: IconProps) {
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

function getDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDayHeading(dayKey: string, todayKey: string, tomorrowKey: string) {
  if (dayKey === todayKey) {
    return "Today";
  }
  if (dayKey === tomorrowKey) {
    return "Tomorrow";
  }
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function AppointmentSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, groupIndex) => (
        <div key={groupIndex}>
          <div className="mb-2 h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="overflow-hidden rounded border border-gray-200/70 bg-white">
            {Array.from({ length: 3 }).map((__, rowIndex) => (
              <div
                key={rowIndex}
                className="flex items-center gap-4 border-b border-gray-100 px-4 py-3.5 last:border-b-0"
              >
                <div className="w-14 shrink-0">
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type GroupedAppointments = {
  dayKey: string;
  items: AppointmentRecord[];
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientNow, setClientNow] = useState<Date | null>(null);

  useEffect(() => {
    setClientNow(new Date());
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadAppointments() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/appointments", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load appointments.");
        }

        const data = (await response.json()) as {
          appointments: AppointmentRecord[];
        };

        if (isActive) {
          setAppointments(data.appointments);
        }
      } catch {
        if (isActive) {
          setError("Unable to load appointments for this month.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadAppointments();

    return () => {
      isActive = false;
    };
  }, []);

  const { groups, todayKey, tomorrowKey, totalCount } = useMemo(() => {
    if (!clientNow) {
      return {
        groups: [] as GroupedAppointments[],
        todayKey: "",
        tomorrowKey: "",
        totalCount: 0,
      };
    }

    const now = clientNow.getTime();
    const today = new Date(clientNow);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcoming = appointments
      .filter(
        (appointment) =>
          appointment.start_at && new Date(appointment.start_at).getTime() >= now
      )
      .sort(
        (a, b) =>
          new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
      );

    const map = new Map<string, AppointmentRecord[]>();
    for (const appointment of upcoming) {
      const key = getDayKey(new Date(appointment.start_at));
      const list = map.get(key);
      if (list) {
        list.push(appointment);
      } else {
        map.set(key, [appointment]);
      }
    }

    const grouped: GroupedAppointments[] = Array.from(map.entries()).map(
      ([dayKey, items]) => ({ dayKey, items })
    );

    return {
      groups: grouped,
      todayKey: getDayKey(today),
      tomorrowKey: getDayKey(tomorrow),
      totalCount: upcoming.length,
    };
  }, [appointments, clientNow]);

  const isInitialLoading = isLoading || !clientNow;

  return (
    <section className="space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
            Appointments
          </p>
          <Link
            href="/appointments/new"
            className="inline-flex items-center gap-1 rounded bg-teal-600 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98]"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            <span>New</span>
          </Link>
        </div>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h2 className="text-[26px] font-bold tracking-tight text-gray-900">
            Upcoming
          </h2>
          {!isInitialLoading && totalCount > 0 && (
            <span className="pb-1 text-[13px] font-semibold text-gray-500">
              {totalCount} {totalCount === 1 ? "job" : "jobs"}
            </span>
          )}
        </div>
      </div>

      {isInitialLoading ? (
        <AppointmentSkeleton />
      ) : error ? (
        <div className="rounded border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded border border-gray-200/70 bg-white px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-gray-400">
            <CalendarEmptyIcon className="h-7 w-7" />
          </div>
          <p className="mt-4 text-[15px] font-semibold text-gray-900">
            Nothing scheduled
          </p>
          <p className="mt-1 text-[13px] text-gray-500">
            No upcoming appointments remain for the current month.
          </p>
          <Link
            href="/appointments/new"
            className="mt-5 inline-flex items-center gap-1 rounded bg-teal-600 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98]"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            <span>New Appointment</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.dayKey}>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  {formatDayHeading(group.dayKey, todayKey, tomorrowKey)}
                </h3>
                <span className="text-[11px] font-semibold text-gray-400">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "job" : "jobs"}
                </span>
              </div>
              <div className="overflow-hidden rounded border border-gray-200/70 bg-white">
                {group.items.map((appointment, itemIndex) => (
                  <Link
                    key={appointment._id}
                    href={`/appointments/${appointment._id}`}
                    className={`relative flex items-center gap-4 px-4 py-3.5 transition active:bg-gray-50 ${
                      itemIndex !== group.items.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <span
                      className={`absolute inset-y-2 left-0 w-[3px] rounded-r ${getAppointmentStatusBarColor(
                        appointment.status
                      )}`}
                      aria-hidden="true"
                    />
                    <div className="w-14 shrink-0 pl-1">
                      <p className="text-[15px] font-bold tracking-tight text-gray-900">
                        {formatTime(appointment.start_at)}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-gray-900">
                        {appointment.consumer_name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-gray-500">
                        <span className="truncate">
                          {appointment.service_title}
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
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
