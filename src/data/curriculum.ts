import { curriculumWeeks3Through8 } from "./curriculum-weeks-3-8";

/**
 * Curriculum design (each age bracket, each week):
 * - Week 1: 10× core (no prior week). Video teaches this week's grammar/vocab.
 * - Weeks 2–8: 3× review (prior week) → 4× core (matches video) → 3× generative (prior + current).
 * - The lesson video aligns with prompts 4–7 (core). Prompts 1–3 warm up last week's skill first.
 */

export type AgeGroup = "5-9" | "10-14";
export type PromptCategory = "review" | "core" | "generative";
export type InteractionMode = "drag-match" | "click-paint";

export interface DragMatchPrompt {
  id: string;
  category: PromptCategory;
  mode: "drag-match";
  wordLabel: string;
  imageOptions: string[];
  target: string;
}

export interface ClickPaintPrompt {
  id: string;
  category: PromptCategory;
  mode: "click-paint";
  text: string;
  target: string | string[];
  options: string[];
}

export type Prompt = DragMatchPrompt | ClickPaintPrompt;

export interface BracketData {
  videoId: string;
  channel: string;
  title: string;
  mode: InteractionMode;
  prompts: Prompt[];
}

export interface LessonWeek {
  weekNumber: number;
  theme: string;
  brackets: Record<AgeGroup, BracketData>;
}

export const curriculum: Record<number, LessonWeek> = {
  1: {
    weekNumber: 1,
    theme: "Identity & Greetings",
    brackets: {
      "5-9": {
        videoId: "rC6bmDuHsWE",
        channel: "JamesESL English Lessons (engVid)",
        title: 'VERY, VERY BEGINNER LESSON 1 The verb "TO BE" Present',
        mode: "click-paint",
        prompts: [
          {
            id: "w1_59_01",
            category: "core",
            mode: "click-paint",
            text: "I ___ a camper at Certified Angels.",
            target: "am",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_59_02",
            category: "core",
            mode: "click-paint",
            text: "You ___ my friend today.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_59_03",
            category: "core",
            mode: "click-paint",
            text: "He ___ ready for art class.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_59_04",
            category: "core",
            mode: "click-paint",
            text: "She ___ happy to say hello.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_59_05",
            category: "core",
            mode: "click-paint",
            text: "We ___ in group B today.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_59_06",
            category: "core",
            mode: "click-paint",
            text: "They ___ new campers this week.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_59_07",
            category: "core",
            mode: "click-paint",
            text: "My name ___ Leo.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_59_08",
            category: "core",
            mode: "click-paint",
            text: "I ___ from Mexico City.",
            target: "am",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_59_09",
            category: "core",
            mode: "click-paint",
            text: "The teacher ___ kind and helpful.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_59_10",
            category: "core",
            mode: "click-paint",
            text: "You and I ___ on the blue team.",
            target: "are",
            options: ["am", "is", "are"],
          },
        ],
      },
      "10-14": {
        videoId: "rC6bmDuHsWE",
        channel: "JamesESL English Lessons (engVid)",
        title: 'VERY, VERY BEGINNER LESSON 1 The verb "TO BE" Present',
        mode: "click-paint",
        prompts: [
          {
            id: "w1_1014_01",
            category: "core",
            mode: "click-paint",
            text: "I ___ the student who arrived first.",
            target: "am",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1014_02",
            category: "core",
            mode: "click-paint",
            text: "She ___ not late for the morning meeting.",
            target: "is",
            options: ["is", "are", "am"],
          },
          {
            id: "w1_1014_03",
            category: "core",
            mode: "click-paint",
            text: "They ___ from different cities.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1014_04",
            category: "core",
            mode: "click-paint",
            text: "He ___ my partner for the project.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1014_05",
            category: "core",
            mode: "click-paint",
            text: "We ___ ready to introduce ourselves.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1014_06",
            category: "core",
            mode: "click-paint",
            text: "My friends ___ in the same camp group.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1014_07",
            category: "core",
            mode: "click-paint",
            text: "It ___ a sunny day at camp.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1014_08",
            category: "core",
            mode: "click-paint",
            text: "You ___ the person I wanted to meet.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1014_09",
            category: "core",
            mode: "click-paint",
            text: "The camp director ___ very welcoming.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1014_10",
            category: "core",
            mode: "click-paint",
            text: "I ___ proud to be here today.",
            target: "am",
            options: ["am", "is", "are"],
          },
        ],
      },
    },
  },
  2: {
    weekNumber: 2,
    theme: "Physical Action",
    brackets: {
      "5-9": {
        videoId: "GDb5LboBieY",
        channel: "ELF Kids Videos",
        title: "Actions 1 – Verb Chant for Kids",
        mode: "click-paint",
        prompts: [
          {
            id: "w2_59_r01",
            category: "review",
            mode: "click-paint",
            text: "She ___ my camp buddy.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w2_59_r02",
            category: "review",
            mode: "click-paint",
            text: "We ___ in the art room.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w2_59_r03",
            category: "review",
            mode: "click-paint",
            text: "I ___ ready to learn.",
            target: "am",
            options: ["am", "is", "are"],
          },
          {
            id: "w2_59_c01",
            category: "core",
            mode: "click-paint",
            text: "He ___ fast on the field.",
            target: "runs",
            options: ["run", "runs", "running"],
          },
          {
            id: "w2_59_c02",
            category: "core",
            mode: "click-paint",
            text: "She ___ over the puddle.",
            target: "jumps",
            options: ["jump", "jumps", "jumping"],
          },
          {
            id: "w2_59_c03",
            category: "core",
            mode: "click-paint",
            text: "The dog ___ in the lake.",
            target: "swims",
            options: ["swim", "swims", "swimming"],
          },
          {
            id: "w2_59_c04",
            category: "core",
            mode: "click-paint",
            text: "My friend ___ a rainbow mural.",
            target: "paints",
            options: ["paint", "paints", "painting"],
          },
          {
            id: "w2_59_g01",
            category: "generative",
            mode: "click-paint",
            text: "He ___ after school, and she paints at camp.",
            target: "runs",
            options: ["run", "runs", "running"],
          },
          {
            id: "w2_59_g02",
            category: "generative",
            mode: "click-paint",
            text: "They ___ in the pool, then they eat lunch.",
            target: "swim",
            options: ["swim", "swims", "swimming"],
          },
          {
            id: "w2_59_g03",
            category: "generative",
            mode: "click-paint",
            text: "She ___ high, and her team claps loudly.",
            target: "jumps",
            options: ["jump", "jumps", "jumping"],
          },
        ],
      },
      "10-14": {
        videoId: "DhPFdJe4KVQ",
        channel: "All Things Grammar",
        title: "Present Simple Third Person Verb Endings",
        mode: "click-paint",
        prompts: [
          {
            id: "w2_1014_r01",
            category: "review",
            mode: "click-paint",
            text: "They ___ not lost; they are in the gym.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w2_1014_r02",
            category: "review",
            mode: "click-paint",
            text: "He ___ the captain of our team.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w2_1014_r03",
            category: "review",
            mode: "click-paint",
            text: "I ___ excited about camp week two.",
            target: "am",
            options: ["am", "is", "are"],
          },
          {
            id: "w2_1014_c01",
            category: "core",
            mode: "click-paint",
            text: "Miles ___ across the rooftop every morning.",
            target: "runs",
            options: ["run", "runs", "running"],
          },
          {
            id: "w2_1014_c02",
            category: "core",
            mode: "click-paint",
            text: "Gwen ___ between the buildings with ease.",
            target: "jumps",
            options: ["jump", "jumps", "jumping"],
          },
          {
            id: "w2_1014_c03",
            category: "core",
            mode: "click-paint",
            text: "The athlete ___ laps before breakfast.",
            target: "swims",
            options: ["swim", "swims", "swimming"],
          },
          {
            id: "w2_1014_c04",
            category: "core",
            mode: "click-paint",
            text: "She ___ murals for the community wall.",
            target: "paints",
            options: ["paint", "paints", "painting"],
          },
          {
            id: "w2_1014_g01",
            category: "generative",
            mode: "click-paint",
            text: "He does not ___ indoors, but he ___ outside after lunch.",
            target: "runs",
            options: ["run", "runs", "running"],
          },
          {
            id: "w2_1014_g02",
            category: "generative",
            mode: "click-paint",
            text: "She doesn't skip practice, and she ___ higher each week.",
            target: "jumps",
            options: ["jump", "jumps", "jumping"],
          },
          {
            id: "w2_1014_g03",
            category: "generative",
            mode: "click-paint",
            text: "They do not swim alone, yet he ___ every Saturday.",
            target: "swims",
            options: ["swim", "swims", "swimming"],
          },
        ],
      },
    },
  },
  ...curriculumWeeks3Through8,
};

if (process.env.NODE_ENV === "development") {
  const EXPECTED_CATEGORIES: PromptCategory[] = [
    "review",
    "review",
    "review",
    "core",
    "core",
    "core",
    "core",
    "generative",
    "generative",
    "generative",
  ];

  Object.entries(curriculum).forEach(([week, lesson]) => {
    const weekNum = Number(week);
    Object.entries(lesson.brackets).forEach(([group, bracket]) => {
      if (bracket.prompts.length !== 10) {
        throw new Error(
          `Curriculum error: Week ${week}, Age ${group} has ${bracket.prompts.length} prompts. Expected exactly 10.`,
        );
      }

      if (weekNum === 1) {
        bracket.prompts.forEach((prompt, index) => {
          if (prompt.category !== "core") {
            throw new Error(
              `Curriculum error: Week 1, Age ${group}, prompt ${index} must be core (Week 1 exception).`,
            );
          }
        });
        return;
      }

      bracket.prompts.forEach((prompt, index) => {
        if (prompt.category !== EXPECTED_CATEGORIES[index]) {
          throw new Error(
            `Curriculum error: Week ${week}, Age ${group}, prompt ${index} is "${prompt.category}". Expected "${EXPECTED_CATEGORIES[index]}".`,
          );
        }
      });
    });
  });
}
