import type { SentencePrompt } from "@/types/sentence-canvas";

export const SENTENCE_PROMPTS: SentencePrompt[] = [
  {
    id: "1",
    englishBefore: "She ",
    englishAfter: " to school every day.",
    spanishHint: "Ella va a la escuela todos los días.",
    correctOptionId: "goes",
    options: [
      { id: "go", label: "go" },
      { id: "goes", label: "goes" },
      { id: "going", label: "going" },
    ],
  },
  {
    id: "2",
    englishBefore: "They ",
    englishAfter: " soccer after camp.",
    spanishHint: "Ellos juegan fútbol después del campamento.",
    correctOptionId: "play",
    options: [
      { id: "plays", label: "plays" },
      { id: "play", label: "play" },
      { id: "playing", label: "playing" },
    ],
  },
  {
    id: "3",
    englishBefore: "I ",
    englishAfter: " happy when I paint.",
    spanishHint: "Estoy feliz cuando pinto.",
    correctOptionId: "am",
    options: [
      { id: "is", label: "is" },
      { id: "am", label: "am" },
      { id: "are", label: "are" },
    ],
  },
  {
    id: "4",
    englishBefore: "He ",
    englishAfter: " his guitar loudly.",
    spanishHint: "Él toca su guitarra fuerte.",
    correctOptionId: "plays",
    options: [
      { id: "play", label: "play" },
      { id: "plays", label: "plays" },
      { id: "played", label: "played" },
    ],
  },
  {
    id: "5",
    englishBefore: "We ",
    englishAfter: " stories together.",
    spanishHint: "Leemos historias juntos.",
    correctOptionId: "read",
    options: [
      { id: "reads", label: "reads" },
      { id: "reading", label: "reading" },
      { id: "read", label: "read" },
    ],
  },
];
