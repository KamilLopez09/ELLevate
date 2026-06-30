"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
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
 * Implements the WAI-ARIA tabs pattern: roving tabindex, arrow/Home/End
 * navigation, and tab↔panel association. Each control keeps a 56px target.
 */
export function Tabs({ items, defaultTabId }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? items[0]?.id);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  if (!activeItem) {
    return null;
  }

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;

  const focusTab = (index: number) => {
    const next = (index + items.length) % items.length;
    setActiveId(items[next].id);
    tabRefs.current[next]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTab(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTab(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(items.length - 1);
        break;
    }
  };

  return (
    <div>
      <div role="tablist" aria-label="Lesson sections" className="flex flex-wrap gap-2">
        {items.map((item, index) => {
          const isActive = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={tabId(item.id)}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={panelId(item.id)}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`min-h-[56px] rounded-2xl border-2 px-5 text-base font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-accent ${
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
          id={panelId(activeItem.id)}
          role="tabpanel"
          aria-labelledby={tabId(activeItem.id)}
          tabIndex={0}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="mt-5 text-lg leading-relaxed text-ink/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-accent"
        >
          {activeItem.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
