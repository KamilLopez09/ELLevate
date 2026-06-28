import { curriculumWeeks3Through8 } from "./curriculum-weeks-3-8";

export type AgeGroup = "5-7" | "8-10" | "11-14";
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
      "5-7": {
        videoId: "61Qb05MuZ98",
        channel: "Quixot Kids Edu",
        title: "Greetings – How Are You Today?",
        mode: "drag-match",
        prompts: [
          // Week 1 Exception: No prior week. Review slots replaced with additional core prompts.
          {
            id: "w1_57_01",
            category: "core",
            mode: "drag-match",
            wordLabel: "Hello",
            imageOptions: ["img_hello", "img_apple", "img_dog"],
            target: "img_hello",
          },
          {
            id: "w1_57_02",
            category: "core",
            mode: "drag-match",
            wordLabel: "I",
            imageOptions: ["img_i", "img_ball", "img_tree"],
            target: "img_i",
          },
          {
            id: "w1_57_03",
            category: "core",
            mode: "drag-match",
            wordLabel: "You",
            imageOptions: ["img_you", "img_car", "img_fish"],
            target: "img_you",
          },
          {
            id: "w1_57_04",
            category: "core",
            mode: "drag-match",
            wordLabel: "He",
            imageOptions: ["img_he", "img_hat", "img_cup"],
            target: "img_he",
          },
          {
            id: "w1_57_05",
            category: "core",
            mode: "drag-match",
            wordLabel: "She",
            imageOptions: ["img_she", "img_star", "img_shoe"],
            target: "img_she",
          },
          {
            id: "w1_57_06",
            category: "core",
            mode: "drag-match",
            wordLabel: "Friend",
            imageOptions: ["img_friend", "img_book", "img_sun"],
            target: "img_friend",
          },
          {
            id: "w1_57_07",
            category: "core",
            mode: "drag-match",
            wordLabel: "Happy",
            imageOptions: ["img_happy", "img_sad", "img_mad"],
            target: "img_happy",
          },
          {
            id: "w1_57_08",
            category: "core",
            mode: "drag-match",
            wordLabel: "Name",
            imageOptions: ["img_name", "img_game", "img_food"],
            target: "img_name",
          },
          {
            id: "w1_57_09",
            category: "core",
            mode: "drag-match",
            wordLabel: "Goodbye",
            imageOptions: ["img_goodbye", "img_hello", "img_hi"],
            target: "img_goodbye",
          },
          {
            id: "w1_57_10",
            category: "core",
            mode: "drag-match",
            wordLabel: "We",
            imageOptions: ["img_we", "img_me", "img_they"],
            target: "img_we",
          },
        ],
      },
      "8-10": {
        videoId: "PZCcRzgrr8Y",
        channel: "Rockin' English Lessons",
        title: "I Am You Are He She Is – To Be Song",
        mode: "click-paint",
        prompts: [
          {
            id: "w1_810_01",
            category: "core",
            mode: "click-paint",
            text: "I ___ a camper at Certified Angels.",
            target: "am",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_810_02",
            category: "core",
            mode: "click-paint",
            text: "You ___ my friend today.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_810_03",
            category: "core",
            mode: "click-paint",
            text: "He ___ ready for art class.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_810_04",
            category: "core",
            mode: "click-paint",
            text: "She ___ happy to say hello.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_810_05",
            category: "core",
            mode: "click-paint",
            text: "We ___ in group B today.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_810_06",
            category: "core",
            mode: "click-paint",
            text: "They ___ new campers this week.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_810_07",
            category: "core",
            mode: "click-paint",
            text: "My name ___ Leo.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_810_08",
            category: "core",
            mode: "click-paint",
            text: "I ___ from Mexico City.",
            target: "am",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_810_09",
            category: "core",
            mode: "click-paint",
            text: "The teacher ___ kind and helpful.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_810_10",
            category: "core",
            mode: "click-paint",
            text: "You and I ___ on the blue team.",
            target: "are",
            options: ["am", "is", "are"],
          },
        ],
      },
      "11-14": {
        videoId: "rC6bmDuHsWE",
        channel: "JamesESL",
        title: "The Verb To Be – Beginner Lesson",
        mode: "click-paint",
        prompts: [
          {
            id: "w1_1114_01",
            category: "core",
            mode: "click-paint",
            text: "I ___ the student who arrived first.",
            target: "am",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1114_02",
            category: "core",
            mode: "click-paint",
            text: "She ___ not late for the morning meeting.",
            target: "is",
            options: ["is", "are", "am"],
          },
          {
            id: "w1_1114_03",
            category: "core",
            mode: "click-paint",
            text: "They ___ from different cities.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1114_04",
            category: "core",
            mode: "click-paint",
            text: "He ___ my partner for the project.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1114_05",
            category: "core",
            mode: "click-paint",
            text: "We ___ ready to introduce ourselves.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1114_06",
            category: "core",
            mode: "click-paint",
            text: "My friends ___ in the same camp group.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1114_07",
            category: "core",
            mode: "click-paint",
            text: "It ___ a sunny day at camp.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1114_08",
            category: "core",
            mode: "click-paint",
            text: "You ___ the person I wanted to meet.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1114_09",
            category: "core",
            mode: "click-paint",
            text: "The camp director ___ very welcoming.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_1114_10",
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
      "5-7": {
        videoId: "KKVDvv4jBCw",
        channel: "ESL Kids",
        title: "Action Verbs Song for Kids",
        mode: "drag-match",
        prompts: [
          {
            id: "w2_57_r01",
            category: "review",
            mode: "drag-match",
            wordLabel: "Hello",
            imageOptions: ["img_hello", "img_run", "img_jump"],
            target: "img_hello",
          },
          {
            id: "w2_57_r02",
            category: "review",
            mode: "drag-match",
            wordLabel: "I",
            imageOptions: ["img_i", "img_swim", "img_paint"],
            target: "img_i",
          },
          {
            id: "w2_57_r03",
            category: "review",
            mode: "drag-match",
            wordLabel: "Friend",
            imageOptions: ["img_friend", "img_clap", "img_kick"],
            target: "img_friend",
          },
          {
            id: "w2_57_c01",
            category: "core",
            mode: "drag-match",
            wordLabel: "Run",
            imageOptions: ["img_run", "img_sleep", "img_sit"],
            target: "img_run",
          },
          {
            id: "w2_57_c02",
            category: "core",
            mode: "drag-match",
            wordLabel: "Jump",
            imageOptions: ["img_jump", "img_eat", "img_read"],
            target: "img_jump",
          },
          {
            id: "w2_57_c03",
            category: "core",
            mode: "drag-match",
            wordLabel: "Swim",
            imageOptions: ["img_swim", "img_walk", "img_stand"],
            target: "img_swim",
          },
          {
            id: "w2_57_c04",
            category: "core",
            mode: "drag-match",
            wordLabel: "Paint",
            imageOptions: ["img_paint", "img_cook", "img_drive"],
            target: "img_paint",
          },
          {
            id: "w2_57_g01",
            category: "generative",
            mode: "drag-match",
            wordLabel: "Clap",
            imageOptions: ["img_clap", "img_run", "img_swim"],
            target: "img_clap",
          },
          {
            id: "w2_57_g02",
            category: "generative",
            mode: "drag-match",
            wordLabel: "Kick",
            imageOptions: ["img_kick", "img_jump", "img_paint"],
            target: "img_kick",
          },
          {
            id: "w2_57_g03",
            category: "generative",
            mode: "drag-match",
            wordLabel: "Dance",
            imageOptions: ["img_dance", "img_sit", "img_sleep"],
            target: "img_dance",
          },
        ],
      },
      "8-10": {
        videoId: "GDb5LboBieY",
        channel: "ELF Kids Videos",
        title: "Actions 1 – Verb Chant for Kids",
        mode: "click-paint",
        prompts: [
          {
            id: "w2_810_r01",
            category: "review",
            mode: "click-paint",
            text: "She ___ my camp buddy.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w2_810_r02",
            category: "review",
            mode: "click-paint",
            text: "We ___ in the art room.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w2_810_r03",
            category: "review",
            mode: "click-paint",
            text: "I ___ ready to learn.",
            target: "am",
            options: ["am", "is", "are"],
          },
          {
            id: "w2_810_c01",
            category: "core",
            mode: "click-paint",
            text: "He ___ fast on the field.",
            target: "runs",
            options: ["run", "runs", "running"],
          },
          {
            id: "w2_810_c02",
            category: "core",
            mode: "click-paint",
            text: "She ___ over the puddle.",
            target: "jumps",
            options: ["jump", "jumps", "jumping"],
          },
          {
            id: "w2_810_c03",
            category: "core",
            mode: "click-paint",
            text: "The dog ___ in the lake.",
            target: "swims",
            options: ["swim", "swims", "swimming"],
          },
          {
            id: "w2_810_c04",
            category: "core",
            mode: "click-paint",
            text: "My friend ___ a rainbow mural.",
            target: "paints",
            options: ["paint", "paints", "painting"],
          },
          {
            id: "w2_810_g01",
            category: "generative",
            mode: "click-paint",
            text: "He ___ after school, and she paints at camp.",
            target: "runs",
            options: ["run", "runs", "running"],
          },
          {
            id: "w2_810_g02",
            category: "generative",
            mode: "click-paint",
            text: "They ___ in the pool, then they eat lunch.",
            target: "swim",
            options: ["swim", "swims", "swimming"],
          },
          {
            id: "w2_810_g03",
            category: "generative",
            mode: "click-paint",
            text: "She ___ high, and her team claps loudly.",
            target: "jumps",
            options: ["jump", "jumps", "jumping"],
          },
        ],
      },
      "11-14": {
        videoId: "DhPFdJe4KVQ",
        channel: "All Things Grammar",
        title: "Present Simple Third Person Verb Endings",
        mode: "click-paint",
        prompts: [
          {
            id: "w2_1114_r01",
            category: "review",
            mode: "click-paint",
            text: "They ___ not lost; they are in the gym.",
            target: "are",
            options: ["am", "is", "are"],
          },
          {
            id: "w2_1114_r02",
            category: "review",
            mode: "click-paint",
            text: "He ___ the captain of our team.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w2_1114_r03",
            category: "review",
            mode: "click-paint",
            text: "I ___ excited about camp week two.",
            target: "am",
            options: ["am", "is", "are"],
          },
          {
            id: "w2_1114_c01",
            category: "core",
            mode: "click-paint",
            text: "Miles ___ across the rooftop every morning.",
            target: "runs",
            options: ["run", "runs", "running"],
          },
          {
            id: "w2_1114_c02",
            category: "core",
            mode: "click-paint",
            text: "Gwen ___ between the buildings with ease.",
            target: "jumps",
            options: ["jump", "jumps", "jumping"],
          },
          {
            id: "w2_1114_c03",
            category: "core",
            mode: "click-paint",
            text: "The athlete ___ laps before breakfast.",
            target: "swims",
            options: ["swim", "swims", "swimming"],
          },
          {
            id: "w2_1114_c04",
            category: "core",
            mode: "click-paint",
            text: "She ___ murals for the community wall.",
            target: "paints",
            options: ["paint", "paints", "painting"],
          },
          {
            id: "w2_1114_g01",
            category: "generative",
            mode: "click-paint",
            text: "He does not ___ indoors, but he ___ outside after lunch.",
            target: "runs",
            options: ["run", "runs", "running"],
          },
          {
            id: "w2_1114_g02",
            category: "generative",
            mode: "click-paint",
            text: "She doesn't skip practice, and she ___ higher each week.",
            target: "jumps",
            options: ["jump", "jumps", "jumping"],
          },
          {
            id: "w2_1114_g03",
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
  Object.entries(curriculum).forEach(([week, lesson]) => {
    Object.entries(lesson.brackets).forEach(([group, bracket]) => {
      if (bracket.prompts.length !== 10) {
        throw new Error(
          `Curriculum error: Week ${week}, Age ${group} has ${bracket.prompts.length} prompts. Expected exactly 10.`,
        );
      }
    });
  });
}
