"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createResumeCode } from "@/lib/camper-resume";
import { useCopy } from "@/lib/i18n/useCopy";

export interface ResumeCodeModalProps {
  open: boolean;
  onClose: () => void;
}

export function ResumeCodeModal({ open, onClose }: ResumeCodeModalProps) {
  const copy = useCopy();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeCode, setResumeCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setError(null);
      setResumeCode(null);
      setExpiresAt(null);
      return;
    }

    let cancelled = false;

    async function loadCode() {
      setLoading(true);
      setError(null);
      const result = await createResumeCode();
      if (cancelled) {
        return;
      }
      setLoading(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setResumeCode(result.resumeCode);
      setExpiresAt(result.expiresAt);
    }

    void loadCode();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleCopy = async () => {
    if (!resumeCode || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(resumeCode);
    } catch {
      // Clipboard may be blocked on camp tablets — code stays visible.
    }
  };

  const expiryLabel =
    expiresAt &&
    new Date(expiresAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-code-heading"
        className="w-full max-w-md rounded-3xl bg-paper p-8 shadow-bento"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="resume-code-heading" className="text-2xl font-extrabold text-ink">
          {copy.resume.createTitle}
        </h2>
        <p className="mt-3 text-lg text-ink/80">{copy.resume.createBody}</p>

        {loading ? (
          <p className="mt-8 text-center text-lg font-semibold text-ink/70">
            {copy.resume.creating}
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-6 rounded-2xl bg-gold-accent/20 px-4 py-3 text-sm font-semibold text-ink/80"
          >
            {error}
          </p>
        ) : null}

        {resumeCode ? (
          <div className="mt-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {copy.resume.codeLabel}
            </p>
            <p
              className="mt-3 font-mono text-4xl font-extrabold tracking-[0.35em] text-purple-accent"
              aria-label={`Resume code ${resumeCode.split("").join(" ")}`}
            >
              {resumeCode}
            </p>
            {expiryLabel ? (
              <p className="mt-3 text-sm text-ink/60">
                {copy.resume.expires(expiryLabel)}
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => void handleCopy()}
              className="mt-6 min-h-[48px]"
            >
              {copy.resume.copyCode}
            </Button>
          </div>
        ) : null}

        <div className="mt-8">
          <Button
            type="button"
            size="xl"
            onClick={onClose}
            className="min-h-[56px] w-full bg-purple-accent text-white hover:bg-purple-accent/90"
          >
            {copy.resume.close}
          </Button>
        </div>
      </div>
    </div>
  );
}
