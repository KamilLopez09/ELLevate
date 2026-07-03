"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CampLoading } from "@/components/ui/CampLoading";
import { CampScreenLayout } from "@/components/ui/CampScreenLayout";
import { StepRail } from "@/components/ui/StepRail";
import { VIDEO_MIN_WATCH_SECONDS } from "@/lib/constants";
import {
  getBracketContent,
  getCurrentWeek,
  getLessonPracticePlan,
  getLessonWeek,
  getVideoEmbedUrl,
} from "@/lib/curriculum-engine";
import { readCamperSession, setLessonComplete } from "@/lib/camper-session";
import { useCopy } from "@/lib/i18n/useCopy";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

export default function LessonPage() {
  const router = useRouter();
  const copy = useCopy();
  const [ready, setReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [watchStartedAt, setWatchStartedAt] = useState<number | null>(null);
  const [watchedConfirmed, setWatchedConfirmed] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(
    VIDEO_MIN_WATCH_SECONDS,
  );

  const camper = useMemo(() => (ready ? readCamperSession() : null), [ready]);
  const weekNumber = getCurrentWeek();
  const week = getLessonWeek(weekNumber);
  const bracket = camper
    ? getBracketContent(weekNumber, camper.age_bracket)
    : null;

  useEffect(() => {
    if (!readCamperSession()) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      setVideoReady(true);
      setWatchStartedAt((started) => started ?? Date.now());
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    if (!videoReady || watchedConfirmed || !watchStartedAt) {
      return;
    }

    const tick = () => {
      const elapsed = (Date.now() - watchStartedAt) / 1000;
      const remaining = Math.max(
        0,
        Math.ceil(VIDEO_MIN_WATCH_SECONDS - elapsed),
      );
      setSecondsRemaining(remaining);
    };

    tick();
    const interval = window.setInterval(tick, 500);
    return () => window.clearInterval(interval);
  }, [videoReady, watchStartedAt, watchedConfirmed]);

  const minWatchMet =
    watchedConfirmed ||
    (videoReady && watchStartedAt !== null && secondsRemaining === 0);

  const handleVideoLoad = () => {
    setVideoReady(true);
    setWatchStartedAt((started) => started ?? Date.now());
  };

  const handleReady = () => {
    if (!minWatchMet) {
      return;
    }
    setLessonComplete();
    router.push("/application");
  };

  if (!ready || !week || !bracket) {
    return (
      <CampScreenLayout screen="lesson" activeItemId="watch">
        <main className="flex min-h-screen items-center justify-center bg-camp-blue">
          <CampLoading label={copy.lesson.loading} />
        </main>
      </CampScreenLayout>
    );
  }

  return (
    <CampScreenLayout screen="lesson" activeItemId="watch">
      <main
        id="main-content"
        tabIndex={-1}
        className="relative min-h-screen overflow-hidden bg-camp-blue px-4 py-8 sm:px-8 focus:outline-none"
      >
        <div
          aria-hidden
          className="canvas-blob canvas-blob-teal -right-16 top-0 h-52 w-52"
        />
        <div
          aria-hidden
          className="canvas-blob canvas-blob-gold -left-10 bottom-20 h-60 w-60"
        />

        <div className="relative mx-auto flex max-w-3xl flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/menu"
              className="inline-flex min-h-[44px] items-center rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:scale-[1.03] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
            >
              {copy.lesson.backToMenu}
            </Link>
            <StepRail current={2} />
          </header>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="rounded-3xl bg-paper p-6 shadow-bento sm:p-10"
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-accent">
              {copy.lesson.weekTheme(weekNumber, week.theme)}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
              {bracket.title}
            </h1>
            <p className="mt-1 text-sm text-ink/60">{bracket.channel}</p>
            <p className="mt-4 text-ink/70">{copy.lesson.watchIntro}</p>
            <p className="mt-2 text-sm font-semibold text-teal-accent">
              {getLessonPracticePlan(weekNumber)}
            </p>

            <div className="mt-6 aspect-video w-full overflow-hidden rounded-2xl border-2 border-purple-accent/20 bg-camp-blue/40 shadow-bento">
              <iframe
                className="h-full w-full"
                src={getVideoEmbedUrl(bracket.videoId)}
                title={bracket.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleVideoLoad}
              />
            </div>

            <ul className="mt-6 flex flex-col gap-2 text-sm text-ink/70">
              <li>{copy.lesson.promptCount(bracket.prompts.length)}</li>
              <li>
                {copy.lesson.modeLabel}{" "}
                <span className="font-bold text-ink">
                  {bracket.mode === "drag-match"
                    ? copy.lesson.modeDragMatch
                    : copy.lesson.modeClickPaint}
                </span>
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-teal-accent/20 bg-teal-accent/5 px-4 py-4">
              <p
                className="text-sm font-semibold text-ink/80"
                aria-live="polite"
              >
                {minWatchMet
                  ? copy.lesson.watchGateReady
                  : copy.lesson.watchGateHint(secondsRemaining)}
              </p>
              <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={watchedConfirmed}
                  onChange={(event) => setWatchedConfirmed(event.target.checked)}
                  className="h-5 w-5 rounded border-ink/20 text-purple-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
                />
                {copy.lesson.watchedCheckbox}
              </label>
            </div>
          </motion.section>

          <motion.button
            type="button"
            onClick={handleReady}
            disabled={!videoReady || !minWatchMet}
            whileHover={videoReady && minWatchMet ? { scale: 1.02 } : undefined}
            whileTap={videoReady && minWatchMet ? { scale: 0.97 } : undefined}
            className="min-h-[56px] rounded-3xl bg-purple-accent px-8 py-4 text-xl font-bold text-white shadow-bento transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
          >
            {copy.lesson.readyToPractice}
          </motion.button>
        </div>
      </main>
    </CampScreenLayout>
  );
}
