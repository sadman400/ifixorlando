"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ToastTone = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastItem = ToastInput & {
  id: number;
};

type ToastContextValue = {
  notify: (input: ToastInput) => void;
};

const TOAST_DURATION_MS = 3200;

const ToastContext = createContext<ToastContextValue | null>(null);

function getToastToneClasses(tone: ToastTone) {
  if (tone === "error") {
    return "border-red-100 bg-red-50 text-red-700";
  }

  if (tone === "success") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  return "border-gray-200/70 bg-white text-gray-900";
}

export function ToastProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextToastIdRef = useRef(1);
  const timeoutMapRef = useRef<Map<number, number>>(new Map());

  function dismiss(id: number) {
    const timeout = timeoutMapRef.current.get(id);

    if (timeout) {
      window.clearTimeout(timeout);
      timeoutMapRef.current.delete(id);
    }

    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }

  function notify(input: ToastInput) {
    const id = nextToastIdRef.current++;

    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id,
        tone: "info",
        ...input,
      },
    ]);

    const timeout = window.setTimeout(() => {
      dismiss(id);
    }, TOAST_DURATION_MS);

    timeoutMapRef.current.set(id, timeout);
  }

  useEffect(() => {
    const timeoutMap = timeoutMapRef.current;

    return () => {
      for (const timeout of timeoutMap.values()) {
        window.clearTimeout(timeout);
      }

      timeoutMap.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}

      <div className="pointer-events-none fixed left-1/2 top-[calc(1rem+env(safe-area-inset-top))] z-50 flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded border px-4 py-3 ${getToastToneClasses(
              toast.tone ?? "info"
            )}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-[12px] opacity-80">
                    {toast.description}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-lg leading-none opacity-60 transition hover:bg-black/5 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}
