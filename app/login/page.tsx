"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";
const CONFIGURATION_MESSAGE =
  "Authentication is not configured. Check AUTH_SECRET, ADMIN_EMAIL, and ADMIN_PASSWORD_HASH in your .env.local or .env file, then restart the server.";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.7a2.5 2.5 0 0 0 3.5 3.5" />
      <path d="M9.4 5.2A10.7 10.7 0 0 1 12 5c6 0 9.5 7 9.5 7a16.8 16.8 0 0 1-3 3.7" />
      <path d="M6.2 6.2A16.3 16.3 0 0 0 2.5 12s3.5 7 9.5 7a9.9 9.9 0 0 0 4-.8" />
    </svg>
  );
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const authErrorParam = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const authError =
    authErrorParam === "CredentialsSignin"
      ? INVALID_CREDENTIALS_MESSAGE
      : authErrorParam === "Configuration" ||
          authErrorParam === "MissingSecret" ||
          authErrorParam === "AccessDenied"
        ? CONFIGURATION_MESSAGE
        : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        redirectTo: callbackUrl,
      });

      if (!response || !response.ok || response.error || !response.url) {
        setError(INVALID_CREDENTIALS_MESSAGE);
        return;
      }

      window.location.assign(response.url);
    } catch {
      setError(INVALID_CREDENTIALS_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-[#f2f2f7] px-6 py-12">
      {/* Top branding */}
      <div className="flex w-full max-w-[380px] flex-col items-center pt-6">
        <div className="flex h-14 w-14 items-center justify-center rounded bg-teal-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <h1 className="mt-4 text-[22px] font-bold tracking-tight text-gray-900">
          iFixOrlando
        </h1>
        <p className="mt-1 text-[13px] text-gray-500">Admin Dashboard</p>
      </div>

      {/* Form card */}
      <section className="w-full max-w-[380px] rounded border border-gray-200/70 bg-white px-7 py-8">
        <h2 className="mb-7 text-center text-lg font-semibold text-gray-800">
          Welcome back
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-[13px] font-semibold text-gray-700"
            >
              Email
            </label>
            <input
              id="login-email"
              autoComplete="email"
              placeholder="example@email.com"
              className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(20,184,166,0.12)]"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="text-[13px] font-semibold text-gray-700"
              >
                Password
              </label>
              <span className="cursor-pointer text-[12px] font-semibold text-teal-600 transition hover:text-teal-700">
                Forgot Password?
              </span>
            </div>
            <div className="relative">
              <input
                id="login-password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(20,184,166,0.12)]"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword((currentValue) => !currentValue)
                }
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {(error || authError) && (
            <div className="rounded border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {error || authError}
            </div>
          )}

          <button
            className="mt-1 flex w-full items-center justify-center rounded bg-teal-600 px-4 py-3.5 text-[15px] font-semibold tracking-wide text-white transition hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>

      {/* Footer */}
      <p className="pb-2 text-[11px] font-medium text-gray-400">
        iFixOrlando v1.0
      </p>
    </main>
  );
}
