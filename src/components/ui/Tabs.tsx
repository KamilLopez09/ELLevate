"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  /** Optional id of the tab to open first; defaults to the first item. */
  defaultTabId?: string;
}

/**
 * Lightweight, dependency-free tab switcher styled to match the camp palette.
 * Tab labels use `teal-accent`; each control keeps a 56px minimum touch target.
 */
export function Tabs({ items, defaultTabId }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? items[0]?.id);
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  if (!activeItem) {
    return null;
  }

  return (
    <div>
      <div role="tablist" aria-label="Lesson sections" className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActiveId(item.id)}
              className={`min-h-[56px] rounded-2xl border-2 px-5 text-base font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-accent ${
                isActive
                  ? "border-teal-accent bg-teal-accent/15 text-teal-accent"
                  : "border-transparent text-teal-accent/60 hover:bg-teal-accent/10 hover:text-teal-accent"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem.id}
          role="tabpanel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-5 text-lg leading-relaxed text-ink/80"
        >
          {activeItem.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
