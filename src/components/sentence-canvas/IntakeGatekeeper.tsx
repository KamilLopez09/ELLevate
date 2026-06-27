"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SentenceCanvas } from "@/components/sentence-canvas/SentenceCanvas";
import {
  readCamperSession,
  slugify,
  writeCamperSession,
} from "@/lib/camper-session";
import type {
  AgeBracket,
  CamperSessionData,
  NativeLanguage,
} from "@/types/sentence-canvas";

const AGE_BRACKETS: AgeBracket[] = ["5-7", "8-10", "11-14"];
const NATIVE_LANGUAGES: NativeLanguage[] = ["English", "Spanish"];

const SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

const selectClasses =
  "min-h-[56px] w-full rounded-2xl border-2 border-ink/10 bg-white px-4 text-lg font-semibold text-ink shadow-sm outline-none transition focus:border-purple-accent focus-visible:outline-none";

export function IntakeGatekeeper() {
  const [hasSession, setHasSession] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastInitial, setLastInitial] = useState("");
  const [ageBracket, setAgeBracket] = useState<AgeBracket | "">("");
  const [nativeLanguage, setNativeLanguage] = useState<NativeLanguage | "">("");
  const [groupLetter, setGroupLetter] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHasSession(readCamperSession() !== null);
    setHydrated(true);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanFirst = firstName.trim();
    const cleanInitial = lastInitial.trim();
    const cleanGroup = groupLetter.trim().toUpperCase();

    if (
      !cleanFirst ||
      !cleanInitial ||
      !ageBracket ||
      !nativeLanguage ||
      !cleanGroup
    ) {
      setError("Please fill in every box so we can set up your canvas!");
      return;
    }

    if (!/^[A-Z]$/.test(cleanGroup)) {
      setError("Your camp group should be a single letter (like A).");
      return;
    }

    const displayName = `${cleanFirst} ${cleanInitial.charAt(0).toUpperCase()}`;
    const camperId = slugify(displayName);

    if (!camperId) {
      setError("Please use letters or numbers in your name.");
      return;
    }

    const data: CamperSessionData = {
      camper_id: camperId,
      display_name: displayName,
      age_bracket: ageBracket,
      native_language: nativeLanguage,
      group_letter: cleanGroup,
    };

    writeCamperSession(data);
    setError(null);
    setHasSession(true);
  };

  if (!hydrated) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {hasSession ? (
        <motion.div
          key="canvas"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING}
        >
          <SentenceCanvas />
        </motion.div>
      ) : (
        <motion.section
          key="intake"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={SPRING}
          className="rounded-3xl bg-paper p-6 shadow-bento sm:p-10"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-accent">
            Welcome, artist!
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-ink">
            Let&apos;s set up your canvas
          </h2>
          <p className="mt-2 text-ink/70">
            Tell us a little about you, then we&apos;ll start painting with
            words.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <label className="flex-1">
                <span className="mb-2 block text-sm font-bold text-ink/80">
                  First name
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Maria"
                  autoComplete="off"
                  className={selectClasses}
                />
              </label>

              <label className="sm:w-32">
                <span className="mb-2 block text-sm font-bold text-ink/80">
                  Last initial
                </span>
                <input
                  type="text"
                  value={lastInitial}
                  onChange={(e) => setLastInitial(e.target.value.slice(0, 1))}
                  placeholder="G"
                  maxLength={1}
                  autoComplete="off"
                  className={selectClasses}
                />
              </label>
            </div>

            <label>
              <span className="mb-2 block text-sm font-bold text-ink/80">
                How old are you?
              </span>
              <select
                value={ageBracket}
                onChange={(e) => setAgeBracket(e.target.value as AgeBracket)}
                className={selectClasses}
              >
                <option value="" disabled>
                  Pick your age group
                </option>
                {AGE_BRACKETS.map((bracket) => (
                  <option key={bracket} value={bracket}>
                    {bracket} years
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-bold text-ink/80">
                Home language
              </span>
              <select
                value={nativeLanguage}
                onChange={(e) =>
                  setNativeLanguage(e.target.value as NativeLanguage)
                }
                className={selectClasses}
              >
                <option value="" disabled>
                  Pick your language
                </option>
                {NATIVE_LANGUAGES.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </label>

            <label className="sm:w-40">
              <span className="mb-2 block text-sm font-bold text-ink/80">
                Camp group
              </span>
              <input
                type="text"
                value={groupLetter}
                onChange={(e) =>
                  setGroupLetter(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 1).toUpperCase())
                }
                placeholder="A"
                maxLength={1}
                autoComplete="off"
                aria-label="Camp group letter"
                className={`${selectClasses} text-center uppercase`}
              />
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-2xl bg-gold-accent/20 px-4 py-3 text-sm font-semibold text-ink/80"
              >
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="min-h-[56px] rounded-3xl bg-purple-accent px-8 py-3 text-lg font-bold text-white shadow-bento transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
            >
              Start painting →
            </motion.button>
          </form>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
