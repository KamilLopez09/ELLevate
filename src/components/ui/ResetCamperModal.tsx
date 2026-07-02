"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export interface ResetCamperModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ResetCamperModal({
  open,
  onConfirm,
  onCancel,
}: ResetCamperModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }

      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-camper-heading"
        className="w-full max-w-md rounded-3xl bg-paper p-8 shadow-bento"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="reset-camper-heading" className="text-2xl font-extrabold text-ink">
          Start over for a new camper?
        </h2>
        <p className="mt-4 text-lg text-ink/80">
          This clears name, week progress, and scores on <strong>this device</strong>.
          Use this on shared camp tablets before the next child begins.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
          <Button
            type="button"
            size="xl"
            onClick={onConfirm}
            className="min-h-[56px] bg-purple-accent text-white hover:bg-purple-accent/90"
          >
            Yes, reset device
          </Button>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-[56px] items-center justify-center rounded-lg border border-border bg-background px-5 text-base font-medium text-ink transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
