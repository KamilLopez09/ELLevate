import Image from "next/image";
import Link from "next/link";

/** Official ELLevate banner (1024×341). Served from /public/logo.png */
const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 341;

const VARIANT_CLASS: Record<"hero" | "sidebar" | "compact", string> = {
  hero: "h-auto w-full max-w-lg",
  sidebar: "h-auto w-full max-w-[220px]",
  compact: "h-9 w-auto sm:h-10",
};

export interface CampLogoProps {
  variant?: "hero" | "sidebar" | "compact";
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
  const image = (
    <Image
      src="/logo.png"
      alt={
        decorative
          ? ""
          : "ELLevate — Certified Angels Summer Camp"
      }
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      className={[VARIANT_CLASS[variant], className].filter(Boolean).join(" ")}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {image}
      </Link>
    );
  }

  return image;
}
