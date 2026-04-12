"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type DashboardStats = {
  year: number;
  month: number;
  salesTotal: number;
  profitTotal: number;
  completedCount: number;
  scheduledCount: number;
};

const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function CompletedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="m9 12 2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function ScheduledIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M7 2.75v3" />
      <path d="M17 2.75v3" />
      <rect x="3" y="5.75" width="18" height="15.5" rx="2.5" />
      <path d="M3 10.75h18" />
      <path d="M8 15h3" />
    </svg>
  );
}

function TrendUpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M3 17 9 11l4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function QuickLinkIcon({
  type,
}: {
  type: "appointments" | "customers" | "inventory";
}) {
  const paths: Record<string, React.ReactNode> = {
    appointments: (
      <>
        <path d="M7 2.75v3" />
        <path d="M17 2.75v3" />
        <rect x="3" y="5.75" width="18" height="15.5" rx="2.5" />
        <path d="M3 10.75h18" />
      </>
    ),
    customers: (
      <>
        <path d="M16.5 20.25v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3a4.5 4.5 0 0 0-4.5 4.5v1.5" />
        <circle cx="10.5" cy="7.75" r="3.5" />
        <path d="M18.75 20.25v-1a3.25 3.25 0 0 0-2.25-3.09" />
        <path d="M15.75 4.75a3.25 3.25 0 0 1 0 6.5" />
      </>
    ),
    inventory: (
      <>
        <path d="M12 2.75 20 6.9v10.2L12 21.25 4 17.1V6.9L12 2.75Z" />
        <path d="M4.8 6.45 12 10.25l7.2-3.8" />
        <path d="M12 10.25v11" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[22px] w-[22px]"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

type SelectOption = {
  value: number;
  label: string;
};

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CustomSelect({
  value,
  options,
  onChange,
  ariaLabel,
  minWidth,
}: {
  value: number;
  options: SelectOption[];
  onChange: (value: number) => void;
  ariaLabel: string;
  minWidth?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    // Scroll the currently selected option into view when the list opens.
    const selectedElement = listRef.current?.querySelector(
      '[aria-selected="true"]'
    );
    if (selectedElement instanceof HTMLElement) {
      selectedElement.scrollIntoView({ block: "nearest" });
    }

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className={`flex items-center gap-1.5 rounded border bg-white py-1.5 pl-3 pr-2 text-[12px] font-semibold text-gray-700 transition ${
          isOpen
            ? "border-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.12)]"
            : "border-gray-200 hover:border-gray-300"
        }`}
        style={minWidth ? { minWidth } : undefined}
      >
        <span className="flex-1 text-left">{selected?.label ?? ""}</span>
        <span className="text-gray-400">
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 top-[calc(100%+4px)] z-30 max-h-56 min-w-[120px] overflow-y-auto rounded border border-gray-200 bg-white py-1 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] transition ${
                  isSelected
                    ? "bg-teal-50 font-semibold text-teal-700"
                    : "font-medium text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <span className="text-teal-600">
                    <CheckIcon />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="rounded border border-gray-200/70 bg-white p-6">
      <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
      <div className="mt-4 h-9 w-44 animate-pulse rounded bg-gray-100" />
      <div className="mt-5 h-14 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="rounded border border-gray-200/70 bg-white p-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="mt-3 h-7 w-12 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded bg-gray-50">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className={`px-3 py-3.5 ${
            index > 0 ? "border-l border-gray-200/70" : ""
          }`}
        >
          <div className="h-2.5 w-10 animate-pulse rounded bg-gray-200/70" />
          <div className="mt-2 h-4 w-14 animate-pulse rounded bg-gray-200/70" />
        </div>
      ))}
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded border border-red-100 bg-red-50 p-4 text-[13px] text-red-600">
      {message}
    </div>
  );
}

async function fetchStats(endpoint: string) {
  const response = await fetch(endpoint, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${endpoint}`);
  }

  return (await response.json()) as DashboardStats;
}

export default function DashboardPage() {
  const [clientNow, setClientNow] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2000);
  const [currentStats, setCurrentStats] = useState<DashboardStats | null>(null);
  const [historyStats, setHistoryStats] = useState<DashboardStats | null>(null);
  const [isCurrentLoading, setIsCurrentLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setClientNow(now);
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  }, []);

  const currentMonth = clientNow ? clientNow.getMonth() + 1 : null;
  const currentYear = clientNow ? clientNow.getFullYear() : null;
  const greeting = clientNow
    ? clientNow.getHours() < 12
      ? "morning"
      : clientNow.getHours() < 18
        ? "afternoon"
        : "evening"
    : null;

  useEffect(() => {
    let isActive = true;

    async function loadCurrentStats() {
      setIsCurrentLoading(true);
      setCurrentError(null);

      try {
        const data = await fetchStats("/api/stats");

        if (isActive) {
          setCurrentStats(data);
        }
      } catch {
        if (isActive) {
          setCurrentError("Unable to load current dashboard stats.");
        }
      } finally {
        if (isActive) {
          setIsCurrentLoading(false);
        }
      }
    }

    void loadCurrentStats();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!clientNow) {
      return;
    }

    let isActive = true;

    async function loadHistoryStats() {
      setIsHistoryLoading(true);
      setHistoryError(null);

      try {
        const searchParams = new URLSearchParams({
          year: String(selectedYear),
          month: String(selectedMonth),
        });

        const data = await fetchStats(`/api/stats/history?${searchParams}`);

        if (isActive) {
          setHistoryStats(data);
        }
      } catch {
        if (isActive) {
          setHistoryError("Unable to load sales history for the selected month.");
        }
      } finally {
        if (isActive) {
          setIsHistoryLoading(false);
        }
      }
    }

    void loadHistoryStats();

    return () => {
      isActive = false;
    };
  }, [clientNow, selectedMonth, selectedYear]);

  const yearOptions = currentYear
    ? Array.from({ length: 7 }, (_, index) => currentYear - 5 + index)
    : [];

  return (
    <section className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
          {currentMonth && currentYear
            ? `${monthLabels[currentMonth - 1]} ${currentYear}`
            : "\u00A0"}
        </p>
        <h2 className="mt-0.5 text-[22px] font-bold tracking-tight text-gray-900">
          {greeting ? `Good ${greeting}` : "Dashboard"}
        </h2>
      </div>

      {/* Hero + activity */}
      {isCurrentLoading ? (
        <div className="space-y-3">
          <HeroSkeleton />
          <ActivitySkeleton />
        </div>
      ) : currentError || !currentStats ? (
        <ErrorPanel
          message={currentError ?? "Current stats are unavailable."}
        />
      ) : (
        <div className="space-y-3">
          {/* Hero earnings card */}
          <div className="rounded bg-teal-600 p-6 text-white">
            <span className="inline-flex h-6 items-center rounded bg-white/15 px-2.5 text-[10px] font-semibold uppercase tracking-wider">
              This Month
            </span>

            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              Total Sales
            </p>
            <p className="mt-1 text-[36px] font-bold leading-none tracking-tight">
              {formatCurrency(currentStats.salesTotal)}
            </p>

            <div className="mt-5 flex items-center gap-3 rounded bg-white/10 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-white/15 text-white">
                <TrendUpIcon />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                  Profit
                </p>
                <p className="mt-0.5 text-[17px] font-bold leading-tight">
                  {formatCurrency(currentStats.profitTotal)}
                </p>
              </div>
            </div>
          </div>

          {/* Activity tiles */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded border border-gray-200/70 bg-white p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded bg-emerald-50 text-emerald-600">
                  <CompletedIcon />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Completed
                </p>
              </div>
              <p className="mt-3 text-[24px] font-bold tracking-tight text-gray-900">
                {currentStats.completedCount}
              </p>
            </div>
            <div className="rounded border border-gray-200/70 bg-white p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded bg-cyan-50 text-cyan-600">
                  <ScheduledIcon />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Scheduled
                </p>
              </div>
              <p className="mt-3 text-[24px] font-bold tracking-tight text-gray-900">
                {currentStats.scheduledCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="space-y-2.5">
        <h3 className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
          Quick Actions
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              href: "/appointments",
              label: "Appts",
              type: "appointments" as const,
              bg: "bg-teal-600",
            },
            {
              href: "/customers",
              label: "Clients",
              type: "customers" as const,
              bg: "bg-sky-600",
            },
            {
              href: "/inventory",
              label: "Stock",
              type: "inventory" as const,
              bg: "bg-violet-600",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[104px] flex-col justify-between rounded ${item.bg} p-3.5 text-white transition active:scale-[0.97]`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded bg-white/15">
                <QuickLinkIcon type={item.type} />
              </div>
              <span className="text-[13px] font-semibold leading-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Sales history */}
      <div className="rounded border border-gray-200/70 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              History
            </p>
            <h3 className="mt-0.5 truncate text-[18px] font-bold tracking-tight text-gray-900">
              {monthLabels[selectedMonth - 1]}{" "}
              <span className="text-gray-400">{selectedYear}</span>
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <CustomSelect
              ariaLabel="Month"
              value={selectedMonth}
              onChange={setSelectedMonth}
              minWidth="74px"
              options={monthLabels.map((label, index) => ({
                value: index + 1,
                label: label.slice(0, 3),
              }))}
            />
            <CustomSelect
              ariaLabel="Year"
              value={selectedYear}
              onChange={setSelectedYear}
              minWidth="72px"
              options={yearOptions.map((year) => ({
                value: year,
                label: String(year),
              }))}
            />
          </div>
        </div>

        <div className="mt-4">
          {isHistoryLoading ? (
            <HistorySkeleton />
          ) : historyError || !historyStats ? (
            <ErrorPanel
              message={historyError ?? "Sales history is unavailable."}
            />
          ) : (
            <div className="grid grid-cols-3 overflow-hidden rounded bg-gray-50">
              <div className="px-3 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Sales
                </p>
                <p className="mt-1 text-[15px] font-bold tracking-tight text-gray-900">
                  {formatCurrency(historyStats.salesTotal)}
                </p>
              </div>
              <div className="border-l border-gray-200/70 px-3 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Profit
                </p>
                <p className="mt-1 text-[15px] font-bold tracking-tight text-teal-600">
                  {formatCurrency(historyStats.profitTotal)}
                </p>
              </div>
              <div className="border-l border-gray-200/70 px-3 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Jobs
                </p>
                <p className="mt-1 text-[15px] font-bold tracking-tight text-gray-900">
                  {historyStats.completedCount}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
