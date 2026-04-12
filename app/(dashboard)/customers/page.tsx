"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  buildCustomerSearchHaystack,
  type CustomerRecord,
} from "@/lib/customers";

type IconProps = {
  className?: string;
};

function SearchIcon({ className }: IconProps) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
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

function UsersIcon({ className }: IconProps) {
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
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

function CustomersSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, groupIndex) => (
        <div key={groupIndex}>
          <div className="mb-2 h-3 w-6 animate-pulse rounded bg-gray-200" />
          <div className="overflow-hidden rounded border border-gray-200/70 bg-white">
            {Array.from({ length: 3 }).map((__, rowIndex) => (
              <div
                key={rowIndex}
                className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5 last:border-b-0"
              >
                <div className="h-10 w-10 shrink-0 animate-pulse rounded bg-gray-100" />
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="mt-1.5 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type CustomerGroup = {
  letter: string;
  items: CustomerRecord[];
};

function groupCustomersByLetter(
  customers: CustomerRecord[]
): CustomerGroup[] {
  const map = new Map<string, CustomerRecord[]>();

  for (const customer of customers) {
    const firstChar = customer.name.trim().charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(firstChar) ? firstChar : "#";
    const list = map.get(letter);
    if (list) {
      list.push(customer);
    } else {
      map.set(letter, [customer]);
    }
  }

  return Array.from(map.entries())
    .map(([letter, items]) => ({
      letter,
      items: items
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    }))
    .sort((a, b) => {
      if (a.letter === "#") return 1;
      if (b.letter === "#") return -1;
      return a.letter.localeCompare(b.letter);
    });
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadCustomers() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/customers", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load customers.");
        }

        const data = (await response.json()) as {
          customers: CustomerRecord[];
        };

        if (isActive) {
          setCustomers(data.customers);
        }
      } catch {
        if (isActive) {
          setError("Unable to load customers.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadCustomers();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return customers;
    }

    return customers.filter((customer) =>
      buildCustomerSearchHaystack(customer).includes(normalizedSearch)
    );
  }, [customers, search]);

  const groups = useMemo(
    () => groupCustomersByLetter(filteredCustomers),
    [filteredCustomers]
  );

  return (
    <section className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
          Customers
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h2 className="text-[26px] font-bold tracking-tight text-gray-900">
            Clients
          </h2>
          {!isLoading && !error && (
            <span className="pb-1 text-[13px] font-semibold text-gray-500">
              {customers.length}{" "}
              {customers.length === 1 ? "client" : "clients"}
            </span>
          )}
        </div>
      </div>

      <label className="relative block">
        <span className="sr-only">Search customers</span>
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search name, phone, email, service..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.12)]"
        />
      </label>

      {isLoading ? (
        <CustomersSkeleton />
      ) : error ? (
        <div className="rounded border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded border border-gray-200/70 bg-white px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-100 text-gray-400">
            <UsersIcon className="h-7 w-7" />
          </div>
          <p className="mt-4 text-[15px] font-semibold text-gray-900">
            {search ? "No matches" : "No clients yet"}
          </p>
          <p className="mt-1 text-[13px] text-gray-500">
            {search
              ? "Try a different name, phone, or service."
              : "Clients will appear here as appointments come in."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.letter}>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  {group.letter}
                </h3>
                <span className="text-[11px] font-semibold text-gray-400">
                  {group.items.length}
                </span>
              </div>
              <div className="overflow-hidden rounded border border-gray-200/70 bg-white">
                {group.items.map((customer, itemIndex) => {
                  const subtitle = customer.phone || customer.email || "—";
                  return (
                    <Link
                      key={customer._id}
                      href={`/customers/${customer._id}`}
                      className={`flex items-center gap-3 px-4 py-3 transition active:bg-gray-50 ${
                        itemIndex !== group.items.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded text-[13px] font-bold ${getAvatarColor(
                          customer.name
                        )}`}
                        aria-hidden="true"
                      >
                        {getInitials(customer.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-gray-900">
                          {customer.name || "Unnamed"}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] text-gray-500">
                          {subtitle}
                        </p>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 shrink-0 text-gray-300" />
                    </Link>
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
