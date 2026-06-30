import { IntakeGatekeeper } from "@/components/sentence-canvas/IntakeGatekeeper";
import { CampScreenLayout } from "@/components/ui/CampScreenLayout";
import { StepRail } from "@/components/ui/StepRail";

export default function HomePage() {
  return (
    <CampScreenLayout screen="home" activeItemId="welcome">
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
          <header className="ca-surface p-8 shadow-bento">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Certified Angels Summer Camp
            </p>
            <h1 className="mt-2 text-4xl font-extrabold text-ink sm:text-5xl">
              ELLevate
            </h1>
            <p className="mt-4 text-lg text-ink/80">
              Paint your way through English and Spanish — no tests, just creative
              play on your sentence canvas.
            </p>
            <div className="mt-6">
              <StepRail current={1} />
            </div>
          </header>

          <IntakeGatekeeper />

          <footer className="text-center text-sm text-muted-foreground">
            Completely free · Built for campers ages 5–14
          </footer>
        </div>
      </main>
    </CampScreenLayout>
  );
}
