"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * App-wide Framer Motion config. `reducedMotion="user"` makes every motion
 * component honor the camper's OS `prefers-reduced-motion` setting without
 * per-component guards.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
