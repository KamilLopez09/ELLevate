"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { readCamperSession } from "@/lib/camper-session";
import { getCopy } from "@/lib/i18n/copy";
import {
  localeFromNativeLanguage,
  type Locale,
} from "@/lib/i18n/types";
import type { NativeLanguage } from "@/types/sentence-canvas";

/** Reads camper session language (re-checks on route changes). */
export function useCopy(): ReturnType<typeof getCopy> {
  const pathname = usePathname();

  return useMemo(() => {
    void pathname;
    const session = readCamperSession();
    const locale = localeFromNativeLanguage(session?.native_language);
    return getCopy(locale);
  }, [pathname]);
}

/** For intake before session exists — follows the language dropdown selection. */
export function useCopyForLanguage(
  nativeLanguage: NativeLanguage | "",
): ReturnType<typeof getCopy> {
  return useMemo(
    () => getCopy(localeFromNativeLanguage(nativeLanguage)),
    [nativeLanguage],
  );
}

export function resolveCopyLocale(
  nativeLanguage: NativeLanguage | "" | undefined,
): Locale {
  return localeFromNativeLanguage(nativeLanguage);
}
