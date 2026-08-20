"use client";

import { useEffect, useState } from "react";

type PwaState = "preparing" | "ready" | "offline" | "unsupported";

export default function PwaRegister() {
  const [state, setState] = useState<PwaState>("preparing");

  useEffect(() => {
    const updateConnection = () => {
      setState(navigator.onLine ? "ready" : "offline");
    };

    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);

    if (!("serviceWorker" in navigator)) {
      queueMicrotask(() => setState("unsupported"));
      return () => {
        window.removeEventListener("online", updateConnection);
        window.removeEventListener("offline", updateConnection);
      };
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        const resourceUrls = performance
          .getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((url) => url.startsWith(window.location.origin));

        registration.active?.postMessage({
          type: "CACHE_URLS",
          urls: [window.location.href, ...resourceUrls],
        });
        updateConnection();
      })
      .catch(() => setState("unsupported"));

    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  const labels: Record<PwaState, string> = {
    preparing: "در حال آماده‌سازی آفلاین",
    ready: "نسخه آفلاین آماده است",
    offline: "در حال کار بدون اینترنت",
    unsupported: "حالت آفلاین در این مرورگر محدود است",
  };

  return (
    <div className={`pwa-status pwa-${state}`} role="status" aria-live="polite">
      <i aria-hidden="true" />
      {labels[state]}
    </div>
  );
}
