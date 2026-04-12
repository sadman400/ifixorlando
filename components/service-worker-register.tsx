"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    // In development we never want a service worker in front of the pages —
    // it will happily serve stale HTML until a hard refresh. Unregister any
    // leftover SW from a previous session and bail out.
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          void registration.unregister();
        }
      });
      void caches?.keys().then((keys) => {
        for (const key of keys) {
          void caches.delete(key);
        }
      });
      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
      } catch (error) {
        console.error("Service worker registration failed.", error);
      }
    };

    void registerServiceWorker();
  }, []);

  return null;
}
