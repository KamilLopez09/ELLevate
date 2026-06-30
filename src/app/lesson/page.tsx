"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CampLoading } from "@/components/ui/CampLoading";
import { CampScreenLayout } from "@/components/ui/CampScreenLayout";
import { StepRail } from "@/components/ui/StepRail";
import {
  getBracketContent,
  getCurrentWeek,
  getLessonPracticePlan,
  getLessonWeek,
  getVideoEmbedUrl,
} from "@/lib/curriculum-engine";
import { readCamperSession, setLessonComplete } from "@/lib/camper-session";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

export default function LessonPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

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

  // Failsafe: never trap a camper if the iframe load event doesn't fire.
  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => setVideoReady(true), 4000);
    return () => window.clearTimeout(timer);
  }, [ready]);

  const handleReady = () => {
    setLessonComplete();
    router.push("/application");
  };

  if (!ready || !week || !bracket) {
    return (
      <CampScreenLayout screen="lesson" activeItemId="watch">
        <main className="flex min-h-screen items-center justify-center bg-camp-blue">
          <CampLoading label="Loading this week's lesson…" />
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
            ← Menu
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
            Week {weekNumber} · {week.theme}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            {bracket.title}
          </h1>
          <p className="mt-1 text-sm text-ink/60">{bracket.channel}</p>
          <p className="mt-4 text-ink/70">
            Watch the clip — it matches this week&apos;s main lesson. Then tap
            Ready to Practice.
          </p>
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
              onLoad={() => setVideoReady(true)}
            />
          </div>

          <ul className="mt-6 flex flex-col gap-2 text-sm text-ink/70">
            <li>
              <span className="font-bold text-teal-accent">
                {bracket.prompts.length}
              </span>{" "}
              painting prompt{bracket.prompts.length === 1 ? "" : "s"} waiting
            </li>
            <li>
              Mode:{" "}
              <span className="font-bold text-ink">
                {bracket.mode === "drag-match" ? "Drag & Match" : "Click to Paint"}
              </span>
            </li>
          </ul>
        </motion.section>

        <motion.button
          type="button"
          onClick={handleReady}
          disabled={!videoReady}
          whileHover={videoReady ? { scale: 1.02 } : undefined}
          whileTap={videoReady ? { scale: 0.97 } : undefined}
          className="min-h-[56px] rounded-3xl bg-purple-accent px-8 py-4 text-xl font-bold text-white shadow-bento transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
        >
          Ready to Practice! →
        </motion.button>
      </div>
      </main>
    </CampScreenLayout>
  );
}
