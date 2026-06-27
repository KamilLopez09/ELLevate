import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-paper px-4 py-10 sm:px-8">
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
        <header className="rounded-3xl bg-white/70 p-8 shadow-bento backdrop-blur-sm">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-accent">
            Certified Angels Summer Camp
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-ink sm:text-5xl">
            ELLevate
          </h1>
          <p className="mt-4 text-lg text-ink/80">
            Paint your way through English and Spanish — no tests, just creative
            play on your sentence canvas.
          </p>
        </header>

        <Link
          href="/sentence-canvas"
          className="group rounded-3xl bg-purple-accent p-8 text-white shadow-bento transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-accent"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
            Module 01
          </p>
          <h2 className="mt-2 text-3xl font-bold">Sentence Canvas</h2>
          <p className="mt-3 text-lg text-white/90">
            Tap a colorful verb swatch to fill the blank — spring it into place!
          </p>
          <span className="mt-6 inline-block rounded-full bg-white/20 px-5 py-2 text-sm font-semibold">
            Start painting →
          </span>
        </Link>

        <footer className="text-center text-sm text-ink/60">
          Completely free · Built for campers ages 5–14
        </footer>
      </div>
    </main>
  );
}
