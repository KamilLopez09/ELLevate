"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  readCamperSession,
  slugify,
  toLastInitial,
  writeCamperSession,
} from "@/lib/camper-session";
import { SESSION_TTL_MS } from "@/lib/session-store";
import type {
  AgeBracket,
  CamperSessionData,
  NativeLanguage,
} from "@/types/sentence-canvas";

const AGE_BRACKET_LABELS: Record<AgeBracket, string> = {
  "5-9": "Ages 5–9",
  "10-14": "Ages 10–14",
};

const AGE_BRACKETS: AgeBracket[] = ["5-9", "10-14"];
const NATIVE_LANGUAGES: NativeLanguage[] = ["English", "Spanish"];

const SESSION_TTL_HOURS = SESSION_TTL_MS / (60 * 60 * 1000);

const SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

const labelClasses = "mb-2 block text-sm font-bold text-ink/80";

const fieldClasses =
  "min-h-[56px] min-w-[56px] w-full rounded-2xl border-2 border-ink/10 bg-white px-4 text-lg font-semibold text-ink shadow-sm transition focus:border-purple-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent";

function handleLastNameInput(raw: string): string {
  return toLastInitial(raw.replace(/[^a-zA-ZÀ-ÿ]/g, " ").trim().split(/\s+/)[0] ?? "");
}

function isAgeBracket(value: string): value is AgeBracket {
  return value === "5-9" || value === "10-14";
}

function isNativeLanguage(value: string): value is NativeLanguage {
  return value === "English" || value === "Spanish";
}

export function IntakeGatekeeper() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastInitial, setLastInitial] = useState("");
  const [ageBracket, setAgeBracket] = useState<AgeBracket | "">("");
  const [nativeLanguage, setNativeLanguage] = useState<NativeLanguage | "">("");
  const [groupLetter, setGroupLetter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastInitialRef = useRef<HTMLInputElement>(null);
  const ageBracketRef = useRef<HTMLSelectElement>(null);
  const nativeLanguageRef = useRef<HTMLSelectElement>(null);
  const groupLetterRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (readCamperSession()) {
      router.replace("/menu");
      return;
    }
    setHydrated(true);
  }, [router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanFirst = firstName.trim();
    const cleanInitial = toLastInitial(lastInitial);
    const cleanGroup = groupLetter.trim().toUpperCase();

    if (
      !cleanFirst ||
      !cleanInitial ||
      !isAgeBracket(ageBracket) ||
      !isNativeLanguage(nativeLanguage) ||
      !cleanGroup
    ) {
      setError("Please fill in every box so we can set up your canvas!");
      if (!cleanFirst) {
        firstNameRef.current?.focus();
      } else if (!cleanInitial) {
        lastInitialRef.current?.focus();
      } else if (!isAgeBracket(ageBracket)) {
        ageBracketRef.current?.focus();
      } else if (!isNativeLanguage(nativeLanguage)) {
        nativeLanguageRef.current?.focus();
      } else {
        groupLetterRef.current?.focus();
      }
      return;
    }

    if (!/^[A-Z]$/.test(cleanGroup)) {
      setError("Your camp group should be a single letter (like A).");
      groupLetterRef.current?.focus();
      return;
    }

    const camperId = slugify(cleanFirst, cleanInitial);

    if (!camperId) {
      setError("Please use letters or numbers in your name.");
      firstNameRef.current?.focus();
      return;
    }

    const data: CamperSessionData = {
      camper_id: camperId,
      first_name: cleanFirst,
      last_initial: cleanInitial,
      age_bracket: ageBracket,
      native_language: nativeLanguage,
      group_letter: cleanGroup,
      cumulativeScore: 0,
      completedModes: [],
    };

    writeCamperSession(data);
    setError(null);
    router.push("/menu");
  };

  if (!hydrated) {
    return null;
  }

  return (
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
        Tell us a little about you, then we&apos;ll start painting with words.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6" noValidate>
        <div className="flex flex-col gap-4 sm:flex-row">
          <label className="flex-1">
            <span className={labelClasses}>First name</span>
            <input
              ref={firstNameRef}
              type="text"
              name="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Maria"
              autoComplete="given-name"
              autoCapitalize="words"
              className={fieldClasses}
            />
          </label>

          <label className="sm:w-32">
            <span className={labelClasses}>Last initial</span>
            <input
              ref={lastInitialRef}
              type="text"
              name="last_initial"
              value={lastInitial}
              onChange={(e) => setLastInitial(handleLastNameInput(e.target.value))}
              placeholder="G"
              maxLength={26}
              autoComplete="family-name"
              autoCapitalize="characters"
              aria-describedby="last-initial-hint"
              className={fieldClasses}
            />
            <span id="last-initial-hint" className="sr-only">
              Enter your last name; only the first letter is saved.
            </span>
          </label>
        </div>

        <label>
          <span className={labelClasses}>How old are you?</span>
          <select
            ref={ageBracketRef}
            name="age_bracket"
            value={ageBracket}
            onChange={(e) => {
              const value = e.target.value;
              setAgeBracket(isAgeBracket(value) ? value : "");
            }}
            className={fieldClasses}
          >
            <option value="" disabled>
              Pick your age group
            </option>
            {AGE_BRACKETS.map((bracket) => (
              <option key={bracket} value={bracket}>
                {AGE_BRACKET_LABELS[bracket]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClasses}>Home language</span>
          <select
            ref={nativeLanguageRef}
            name="native_language"
            value={nativeLanguage}
            onChange={(e) => {
              const value = e.target.value;
              setNativeLanguage(isNativeLanguage(value) ? value : "");
            }}
            className={fieldClasses}
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
          <span className={labelClasses}>Camp group</span>
          <input
            ref={groupLetterRef}
            type="text"
            name="group_letter"
            value={groupLetter}
            onChange={(e) =>
              setGroupLetter(
                e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 1).toUpperCase(),
              )
            }
            placeholder="A"
            maxLength={1}
            autoComplete="off"
            autoCapitalize="characters"
            aria-label="Camp group letter"
            className={`${fieldClasses} text-center uppercase`}
          />
        </label>

        <aside
          className="rounded-2xl border border-teal-accent/25 bg-teal-accent/5 px-4 py-4 text-sm text-ink/80"
          aria-label="Privacy notice for campers and counselors"
        >
          <p className="font-bold text-ink">Privacy on this device</p>
          <p className="mt-2 leading-relaxed">
            We save your first name, last initial, age group, language, and camp
            group on this tablet for up to {SESSION_TTL_HOURS} hours so you can
            keep your progress. We do not ask for your full last name or email.
            When you pass a week, a summary score may be sent to camp organizers.
          </p>
          <p className="mt-2 leading-relaxed">
            Counselors: tap <strong>New camper (reset this device)</strong> on
            the menu before the next child uses this tablet.
          </p>
        </aside>

        <div
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          className={
            error
              ? "rounded-2xl bg-gold-accent/20 px-4 py-3 text-sm font-semibold text-ink/80"
              : "sr-only"
          }
        >
          {error ?? ""}
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="min-h-[56px] min-w-[56px] rounded-3xl bg-purple-accent px-8 py-3 text-lg font-bold text-white shadow-bento transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
        >
          Continue →
        </motion.button>
      </form>
    </motion.section>
  );
}
