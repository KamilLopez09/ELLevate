"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { readCamperSession } from "@/lib/camper-session";
import { localeFromNativeLanguage } from "@/lib/i18n/types";

/** Sets document `lang` from camper session (defaults to English on intake). */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const session = readCamperSession();
    const locale = localeFromNativeLanguage(session?.native_language);
    document.documentElement.lang = locale === "es" ? "es" : "en";
  }, [pathname]);

  return children;
}
