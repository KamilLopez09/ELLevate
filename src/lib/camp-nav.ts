export type CampScreen = "home" | "menu" | "lesson" | "application";

export interface CampNavItem {
  id: string;
  label: string;
  href?: string;
  description?: string;
}

export const CAMP_NAV: Record<CampScreen, CampNavItem[]> = {
  home: [
    { id: "welcome", label: "Welcome", description: "Start your camp journey" },
    { id: "sign-in", label: "Sign In", description: "Enter camper details" },
  ],
  menu: [
    { id: "weeks", label: "Your Weeks", description: "Pick a camp adventure" },
    { id: "progress", label: "Progress", description: "Track unlocked weeks" },
  ],
  lesson: [
    { id: "watch", label: "Watch", description: "Lesson video" },
    { id: "practice", label: "Practice", description: "Ready to paint" },
  ],
  application: [
    { id: "paint", label: "Paint Mode", description: "Answer prompts" },
    { id: "stats", label: "Stats", description: "Session results" },
    { id: "menu", label: "Menu", href: "/menu", description: "Back to weeks" },
  ],
};

export const CAMP_SCREEN_LABELS: Record<CampScreen, string> = {
  home: "Welcome",
  menu: "Camp Menu",
  lesson: "Lesson",
  application: "Practice",
};
