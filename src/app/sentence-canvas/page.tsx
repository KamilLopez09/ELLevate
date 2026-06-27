import Link from "next/link";
import { IntakeGatekeeper } from "@/components/sentence-canvas/IntakeGatekeeper";

export default function SentenceCanvasPage() {
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

      <div className="relative mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
          >
            ← Home
          </Link>
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-accent">
            Sentence Canvas
          </p>
        </header>

        <IntakeGatekeeper />
      </div>
    </main>
  );
}
