import { IntakeGatekeeper } from "@/components/sentence-canvas/IntakeGatekeeper";
import { CampLogo } from "@/components/ui/CampLogo";
import { CampScreenLayout } from "@/components/ui/CampScreenLayout";
import { StepRail } from "@/components/ui/StepRail";

export default function HomePage() {
  return (
    <CampScreenLayout screen="home" activeItemId="welcome">
      <main
        id="main-content"
        tabIndex={-1}
        className="relative min-h-screen overflow-hidden bg-camp-blue px-4 py-10 sm:px-8 focus:outline-none"
      >
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
          <h1 className="sr-only">ELLevate — Certified Angels Summer Camp</h1>
          <CampLogo variant="hero" priority decorative className="mx-auto px-2" />

          <header className="ca-surface p-8 shadow-bento">
            <p className="text-lg text-ink/80">
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
