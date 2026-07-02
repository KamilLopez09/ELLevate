"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { verifyCounselorPin } from "@/lib/camper-resume";
import { useCopy } from "@/lib/i18n/useCopy";

export interface CounselorPinModalProps {
  open: boolean;
  onVerified: () => void;
  onCancel: () => void;
}

export function CounselorPinModal({
  open,
  onVerified,
  onCancel,
}: CounselorPinModalProps) {
  const copy = useCopy();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setPin("");
      setError(null);
      setSubmitting(false);
      return;
    }

    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || pin.length < 4) {
      setError(copy.counselor.invalidPin);
      return;
    }

    setSubmitting(true);
    setError(null);

    const ok = await verifyCounselorPin(pin);
    setSubmitting(false);

    if (ok) {
      onVerified();
      return;
    }

    setError(copy.counselor.wrongPin);
    setPin("");
    inputRef.current?.focus();
  };

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
        aria-labelledby="counselor-pin-heading"
        className="w-full max-w-md rounded-3xl bg-paper p-8 shadow-bento"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-accent">
          {copy.counselor.label}
        </p>
        <h2
          id="counselor-pin-heading"
          className="mt-2 text-2xl font-extrabold text-ink"
        >
          {copy.counselor.title}
        </h2>
        <p className="mt-3 text-lg text-ink/80">{copy.counselor.body}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label>
            <span className="sr-only">{copy.counselor.pinLabel}</span>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(event) =>
                setPin(event.target.value.replace(/\s/g, "").slice(0, 32))
              }
              className="min-h-[56px] w-full rounded-2xl border-2 border-ink/10 bg-white px-4 text-center text-2xl font-bold tracking-[0.3em] text-ink focus:border-purple-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
            />
          </label>

          <div
            role="alert"
            aria-live="polite"
            className={
              error
                ? "rounded-2xl bg-gold-accent/20 px-4 py-3 text-sm font-semibold text-ink/80"
                : "sr-only"
            }
          >
            {error ?? ""}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button
              type="submit"
              size="xl"
              disabled={submitting}
              className="min-h-[56px] bg-purple-accent text-white hover:bg-purple-accent/90"
            >
              {submitting ? copy.counselor.verifying : copy.counselor.confirm}
            </Button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex min-h-[56px] items-center justify-center rounded-lg border border-border bg-background px-5 text-base font-medium text-ink transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {copy.counselor.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
