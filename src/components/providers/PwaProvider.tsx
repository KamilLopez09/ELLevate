"use client";

import { useEffect } from "react";
import { flushTelemetryQueue } from "@/lib/telemetry";

const SW_URL = "/sw.js";

function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  void navigator.serviceWorker.register(SW_URL, { scope: "/" }).catch(() => {
    // Graceful degradation — app works without offline shell.
  });
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();

    const flush = () => {
      void flushTelemetryQueue();
    };

    flush();

    window.addEventListener("online", flush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        flush();
      }
    });

    return () => {
      window.removeEventListener("online", flush);
    };
  }, []);

  return children;
}
