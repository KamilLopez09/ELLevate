"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

const SPRING_ENTRY = { type: "spring" as const, bounce: 0.4, duration: 0.6 };

type BentoGridProps = {
  children: ReactNode;
  className?: string;
};

export function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <div
      className={[
        "grid auto-rows-[minmax(5rem,auto)] grid-cols-1 gap-4 sm:grid-cols-6 sm:gap-5",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

type BentoCardSharedProps = {
  children: ReactNode;
  index?: number;
  span?: string;
  tilt?: number;
  accent?: "purple" | "teal" | "gold" | "warm";
  className?: string;
};

const ACCENT_SHADOW: Record<NonNullable<BentoCardSharedProps["accent"]>, string> = {
  purple: "shadow-bento-purple",
  teal: "shadow-bento-teal",
  gold: "shadow-bento-gold",
  warm: "shadow-bento",
};

function cardClassName(
  accent: NonNullable<BentoCardSharedProps["accent"]>,
  span: string,
  className: string,
) {
  return [
    "bento-card ca-surface relative overflow-hidden p-5 sm:p-6",
    ACCENT_SHADOW[accent],
    span,
    className,
  ].join(" ");
}

type BentoCardProps = BentoCardSharedProps &
  Omit<HTMLMotionProps<"div">, "children"> & {
    as?: "div" | "button";
  };

export function BentoCard({
  children,
  index = 0,
  span = "sm:col-span-3",
  tilt = 0,
  accent = "warm",
  className = "",
  as = "div",
  ...motionProps
}: BentoCardProps) {
  const sharedMotion = {
    initial: { opacity: 0, y: 28, rotate: tilt * 0.5 },
    whileInView: { opacity: 1, y: 0, rotate: tilt },
    viewport: { once: true, margin: "-40px" },
    transition: { ...SPRING_ENTRY, delay: index * 0.07 },
    className: cardClassName(accent, span, className),
  };

  if (as === "button") {
    const buttonProps = motionProps as Omit<HTMLMotionProps<"button">, "children">;
    return (
      <motion.button
        type="button"
        {...sharedMotion}
        whileHover={{ scale: 1.02, rotate: tilt + 0.5 }}
        whileTap={{ scale: 0.97 }}
        {...buttonProps}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.div {...sharedMotion} {...motionProps}>
      {children}
    </motion.div>
  );
}
