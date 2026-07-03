import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Official ELLevate banner (1024×341). Served from /public/logo.png */
const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 341;

export interface CampLogoProps {
  /** Full banner, sidebar width, or cropped wordmark for tight headers */
  variant?: "hero" | "sidebar" | "wordmark";
  className?: string;
  /** Preload on the intake hero (LCP). */
  priority?: boolean;
  /** When set, wraps the logo in a link (e.g. sidebar → menu). */
  href?: string;
  /** Use when a visible heading already labels the page (intake hero). */
  decorative?: boolean;
}

export function CampLogo({
  variant = "hero",
  className = "",
  priority = false,
  href,
  decorative = false,
}: CampLogoProps) {
  const alt = decorative ? "" : "ELLevate — Certified Angels Summer Camp";

  const image =
    variant === "wordmark" ? (
      <span
        className={cn(
          "relative inline-block h-9 w-[7.5rem] shrink-0 overflow-hidden sm:h-10 sm:w-[8.5rem]",
          className,
        )}
        aria-hidden={decorative ? true : undefined}
      >
        <Image
          src="/logo.png"
          alt={alt}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          priority={priority}
          className="absolute left-1/2 top-[58%] h-[340%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
        />
      </span>
    ) : (
      <Image
        src="/logo.png"
        alt={alt}
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={priority}
        className={cn(
          "h-auto w-full object-contain",
          variant === "hero" && "max-w-xl",
          variant === "sidebar" && "max-w-[200px]",
          className,
        )}
      />
    );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label={decorative ? undefined : "ELLevate home"}
      >
        {image}
      </Link>
    );
  }

  return image;
}
