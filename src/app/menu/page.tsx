"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { isLesson1Passed, readCamperSession } from "@/lib/camper-session";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

export default function MenuPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lesson1Passed, setLesson1Passed] = useState(false);

  useEffect(() => {
    const camper = readCamperSession();
    if (!camper) {
      router.replace("/");
      return;
    }
    setFirstName(camper.display_name.split(" ")[0] ?? camper.display_name);
    setLesson1Passed(isLesson1Passed());
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-camp-blue" />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-camp-blue px-4 py-10 sm:px-8">
      <div
        aria-hidden
        className="canvas-blob canvas-blob-purple -left-20 top-10 h-56 w-56"
      />
      <div
        aria-hidden
        className="canvas-blob canvas-blob-gold right-0 top-32 h-48 w-48"
      />
      <div
        aria-hidden
        className="canvas-blob canvas-blob-teal bottom-10 left-1/3 h-64 w-64"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col gap-8">
        <header className="rounded-3xl bg-paper p-8 shadow-bento">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-accent">
            Lesson Menu
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-ink sm:text-5xl">
            Hi, {firstName}! 👋
          </h1>
          <p className="mt-4 text-lg text-ink/80">
            Pick a lesson to paint. Finish one to unlock the next!
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <motion.button
            type="button"
            onClick={() => router.push("/lesson")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="flex min-h-[56px] flex-col items-start gap-3 rounded-3xl border-2 border-ink/10 bg-white p-6 text-left shadow-bento transition hover:border-purple-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-accent text-xl font-extrabold text-white">
              1
            </span>
            <span className="text-2xl font-extrabold text-ink">
              Action Verbs in Motion
            </span>
            <span className="text-base text-ink/70">
              Present-tense verbs &amp; their -s endings.
            </span>
            {lesson1Passed ? (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success-accent/15 px-3 py-1 text-sm font-bold text-success-accent">
                Passed ✓ · Replay
              </span>
            ) : (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-purple-accent/15 px-3 py-1 text-sm font-bold text-purple-accent">
                Start →
              </span>
            )}
          </motion.button>

          {lesson1Passed ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.05 }}
              className="flex min-h-[56px] flex-col items-start gap-3 rounded-3xl border-2 border-teal-accent/40 bg-white p-6 text-left shadow-bento"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-accent text-xl font-extrabold text-white">
                2
              </span>
              <span className="text-2xl font-extrabold text-ink">
                Describing with Adjectives
              </span>
              <span className="text-base text-ink/70">
                Colors, sizes &amp; feelings.
              </span>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gold-accent/20 px-3 py-1 text-sm font-bold text-ink/70">
                🔓 Unlocked · Coming soon!
              </span>
            </motion.div>
          ) : (
            <motion.div
              aria-disabled
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ ...SPRING, delay: 0.05 }}
              className="flex min-h-[56px] cursor-not-allowed flex-col items-start gap-3 rounded-3xl border-2 border-ink/10 bg-white p-6 text-left shadow-bento"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink/20 text-xl font-extrabold text-white">
                2
              </span>
              <span className="text-2xl font-extrabold text-ink/60">
                Describing with Adjectives
              </span>
              <span className="text-base text-ink/50">
                Colors, sizes &amp; feelings.
              </span>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-ink/10 px-3 py-1 text-sm font-bold text-ink/50">
                🔒 Finish Lesson 1 to unlock
              </span>
            </motion.div>
          )}
        </div>

        <footer className="text-center text-sm text-ink/60">
          Completely free · Built for campers ages 5–14
        </footer>
      </div>
    </main>
  );
}
