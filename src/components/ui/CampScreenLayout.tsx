"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CAMP_NAV,
  CAMP_SCREEN_LABELS,
  type CampNavItem,
  type CampScreen,
} from "@/lib/camp-nav";

const DRAWER_SPRING = { type: "spring" as const, damping: 25, stiffness: 120 };
const SIDEBAR_WIDTH = 260;

function resolveScreen(pathname: string): CampScreen {
  if (pathname.startsWith("/application")) return "application";
  if (pathname.startsWith("/lesson")) return "lesson";
  if (pathname.startsWith("/menu")) return "menu";
  return "home";
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: CampNavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const baseClass = [
    "flex min-h-[64px] w-full flex-col justify-center rounded-xl border px-4 py-3 text-left transition",
    active
      ? "border-primary bg-primary/8 text-primary"
      : "border-transparent text-body hover:border-border hover:bg-surface-muted",
  ].join(" ");

  const content = (
    <>
      <span className="font-display text-sm font-bold">{item.label}</span>
      {item.description ? (
        <span className="mt-0.5 text-bento-label text-muted-foreground">{item.description}</span>
      ) : null}
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={baseClass} onClick={onNavigate}>
        {content}
      </Link>
    );
  }

  return (
    <div className={baseClass} aria-current={active ? "page" : undefined}>
      {content}
    </div>
  );
}

function SidebarPanel({
  screen,
  activeItemId,
  onNavigate,
}: {
  screen: CampScreen;
  activeItemId?: string;
  onNavigate?: () => void;
}) {
  const items = CAMP_NAV[screen];

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <div>
        <p className="text-bento-label font-semibold uppercase tracking-widest text-accent">
          ELLevate
        </p>
        <h2 className="mt-1 font-display text-lg font-extrabold text-ink">
          {CAMP_SCREEN_LABELS[screen]}
        </h2>
      </div>

      <nav className="flex flex-col gap-2" aria-label={`${CAMP_SCREEN_LABELS[screen]} navigation`}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...DRAWER_SPRING, delay: index * 0.05 }}
          >
            <NavLink
              item={item}
              active={activeItemId ? item.id === activeItemId : index === 0}
              onNavigate={onNavigate}
            />
          </motion.div>
        ))}
      </nav>
    </div>
  );
}

export interface CampScreenLayoutProps {
  children: React.ReactNode;
  /** Override auto-detected screen from pathname */
  screen?: CampScreen;
  /** Highlight a specific nav item id */
  activeItemId?: string;
  className?: string;
}

export function CampScreenLayout({
  children,
  screen: screenOverride,
  activeItemId,
  className = "",
}: CampScreenLayoutProps) {
  const pathname = usePathname();
  const screen = screenOverride ?? resolveScreen(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className={`relative min-h-screen bg-camp-blue ${className}`}>
      {/* Desktop sidebar — UI-Layouts Motion Drawer pattern */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-border bg-card shadow-bento md:block"
        aria-label="Camp navigation"
      >
        <SidebarPanel screen={screen} activeItemId={activeItemId} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 z-40 bg-ink/30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[min(280px,85vw)] border-r border-border bg-card shadow-bento-purple md:hidden"
              initial={{ x: -SIDEBAR_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_WIDTH }}
              transition={DRAWER_SPRING}
              drag="x"
              dragConstraints={{ left: -SIDEBAR_WIDTH, right: 0 }}
              dragElastic={0.05}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) {
                  setMobileOpen(false);
                }
              }}
              aria-label="Camp navigation"
            >
              <SidebarPanel
                screen={screen}
                activeItemId={activeItemId}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="md:pl-[260px]">
        <header className="sticky top-0 z-20 flex min-h-[64px] items-center border-b border-border bg-card/95 px-4 backdrop-blur-sm md:hidden">
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="camp-mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex min-h-[64px] min-w-[64px] items-center justify-center rounded-xl border border-border bg-card font-display text-sm font-bold text-body"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
          <p className="ml-3 font-display font-bold text-ink">
            {CAMP_SCREEN_LABELS[screen]}
          </p>
        </header>

        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
