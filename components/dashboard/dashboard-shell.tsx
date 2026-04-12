"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type IconProps = {
  className?: string;
};

function HomeIcon({ className }: IconProps) {
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
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.25 9.75V21h13.5V9.75" />
    </svg>
  );
}

function CalendarIcon({ className }: IconProps) {
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
      <path d="M7 2.75v3" />
      <path d="M17 2.75v3" />
      <rect x="3" y="5.75" width="18" height="15.5" rx="2.5" />
      <path d="M3 10.75h18" />
    </svg>
  );
}

function CustomersIcon({ className }: IconProps) {
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
      <path d="M16.5 20.25v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3a4.5 4.5 0 0 0-4.5 4.5v1.5" />
      <circle cx="10.5" cy="7.75" r="3.5" />
      <path d="M18.75 20.25v-1a3.25 3.25 0 0 0-2.25-3.09" />
      <path d="M15.75 4.75a3.25 3.25 0 0 1 0 6.5" />
    </svg>
  );
}

function InventoryIcon({ className }: IconProps) {
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
      <path d="M12 2.75 20 6.9v10.2L12 21.25 4 17.1V6.9L12 2.75Z" />
      <path d="M4.8 6.45 12 10.25l7.2-3.8" />
      <path d="M12 10.25v11" />
    </svg>
  );
}

function PricingIcon({ className }: IconProps) {
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
      <path d="M12 3v18" />
      <path d="M16.5 7.25c0-1.8-1.9-3.25-4.5-3.25S7.5 5.45 7.5 7.25s1.25 2.7 4.5 3.5 4.5 1.7 4.5 3.5S14.6 18 12 18s-4.5-1.45-4.5-3.25" />
    </svg>
  );
}

function LogoutIcon({ className }: IconProps) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const tabs = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/appointments", label: "Appts", Icon: CalendarIcon },
  { href: "/customers", label: "Clients", Icon: CustomersIcon },
  { href: "/inventory", label: "Stock", Icon: InventoryIcon },
  { href: "/pricing", label: "Pricing", Icon: PricingIcon },
];

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f2f2f7] text-gray-900">
      <header className="shrink-0 border-b border-gray-200/80 bg-white/90 px-5 pb-3.5 pt-[calc(0.875rem+env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-teal-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[18px] w-[18px]"
                aria-hidden="true"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[17px] font-bold tracking-tight text-gray-900">
                iFixOrlando
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void handleSignOut();
            }}
            disabled={isSigningOut}
            className="flex h-9 w-9 items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Log out"
          >
            <LogoutIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200/80 bg-white/90 px-3 pb-[calc(0.375rem+env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-md items-end justify-between">
          {tabs.map(({ href, label, Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(`${href}/`));

            return (
              <Link
                key={href}
                href={href}
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded px-1 py-2 text-[10px] font-semibold transition ${
                  isActive
                    ? "text-teal-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded transition ${
                    isActive ? "bg-teal-50 text-teal-600" : ""
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
