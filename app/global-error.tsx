"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
};

function AlertIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export default function GlobalError({
  error,
  reset,
  unstable_retry,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <html lang="en">
      <body
        className="min-h-screen bg-[#f2f2f7] text-gray-900"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <main className="flex min-h-screen items-center justify-center px-4 py-[calc(2rem+env(safe-area-inset-top))]">
          <div className="w-full max-w-md rounded border border-gray-200/70 bg-white px-6 py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded bg-rose-50 text-rose-600">
              <AlertIcon className="h-7 w-7" />
            </div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
              Application error
            </p>
            <h1 className="mt-1 text-[18px] font-bold tracking-tight text-gray-900">
              iFixOrlando hit an unexpected problem.
            </h1>
            <p className="mt-2 text-[13px] text-gray-500">
              Retry the last request or refresh the page.
            </p>
            <button
              type="button"
              onClick={() => retry()}
              className="mt-5 w-full rounded bg-teal-600 px-4 py-3 text-[14px] font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98]"
            >
              Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
