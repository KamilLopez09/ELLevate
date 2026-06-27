"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { StepRail } from "@/components/ui/StepRail";
import { readCamperSession, setLessonComplete } from "@/lib/camper-session";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

const LESSON_TABS: TabItem[] = [
  {
    id: "verbs",
    label: "Key Verbs",
    content: (
      <ul className="flex flex-col gap-2">
        <li>
          <span className="font-bold text-ink">to paint</span> — pintar
        </li>
        <li>
          <span className="font-bold text-ink">to play</span> — jugar
        </li>
        <li>
          <span className="font-bold text-ink">to run</span> — correr
        </li>
        <li>
          <span className="font-bold text-ink">to sing</span> — cantar
        </li>
      </ul>
    ),
  },
  {
    id: "examples",
    label: "Examples",
    content: (
      <ul className="flex flex-col gap-2">
        <li>
          She <span className="font-bold text-teal-accent">paints</span> a big
          rainbow. / Ella pinta un arcoíris grande.
        </li>
        <li>
          We <span className="font-bold text-teal-accent">play</span> in the
          park. / Nosotros jugamos en el parque.
        </li>
        <li>
          They <span className="font-bold text-teal-accent">sing</span> a happy
          song. / Ellos cantan una canción feliz.
        </li>
      </ul>
    ),
  },
  {
    id: "tips",
    label: "Tips",
    content: (
      <p>
        For <span className="font-bold text-ink">he</span>,{" "}
        <span className="font-bold text-ink">she</span>, or{" "}
        <span className="font-bold text-ink">it</span>, English verbs usually
        add an <span className="font-bold text-teal-accent">-s</span> (play →
        plays). Listen for that little sound in the video!
      </p>
    ),
  },
];

export default function LessonPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Locked chain: a camper must sign in before the lesson is shown.
    if (!readCamperSession()) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [router]);

  const handleReady = () => {
    setLessonComplete();
    router.push("/application");
  };

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-camp-blue" />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-camp-blue px-4 py-8 sm:px-8">
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
          <button
            type="button"
            onClick={() => router.push("/menu")}
            className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:scale-[1.03] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
          >
            ← Menu
          </button>
          <StepRail current={2} />
        </header>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="rounded-3xl bg-paper p-6 shadow-bento sm:p-10"
        >
          <h1 className="text-3xl font-extrabold text-ink">
            Action Verbs in Motion
          </h1>
          <p className="mt-2 text-ink/70">
            Watch the clip, then peek at the tabs below before you start
            painting sentences.
          </p>

          <div className="mt-6 aspect-video w-full overflow-hidden rounded-2xl border-2 border-dashed border-purple-accent/30 bg-camp-blue/40">
            {/* Replace this placeholder with a VOA / British Council embed:
                <iframe className="h-full w-full" src="..." title="Lesson video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen /> */}
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-accent text-2xl text-white shadow-bento">
                ▶
              </span>
              <p className="text-sm font-semibold text-ink/70">
                Lesson video goes here
              </p>
              <p className="text-xs text-ink/50">
                VOA Learning English · British Council Kids
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Tabs items={LESSON_TABS} />
          </div>
        </motion.section>

        <motion.button
          type="button"
          onClick={handleReady}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="min-h-[56px] rounded-3xl bg-purple-accent px-8 py-4 text-xl font-bold text-white shadow-bento transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
        >
          Ready to Paint! →
        </motion.button>
      </div>
    </main>
  );
}
