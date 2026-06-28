import type {
  AgeGroup,
  BracketData,
  ClickPaintPrompt,
  LessonWeek,
  Prompt,
  PromptCategory,
} from "./curriculum";

type ClickSpec = {
  id: string;
  category: PromptCategory;
  text: string;
  target: string | string[];
  options: [string, string, string];
};

function clickPrompts(specs: ClickSpec[]): ClickPaintPrompt[] {
  return specs.map(({ id, category, text, target, options }) => ({
    id,
    category,
    mode: "click-paint" as const,
    text,
    target,
    options: [...options],
  }));
}

function bracket(
  videoId: string,
  channel: string,
  title: string,
  mode: BracketData["mode"],
  prompts: Prompt[],
): BracketData {
  return { videoId, channel, title, mode, prompts };
}

function week(
  weekNumber: number,
  theme: string,
  brackets: Record<AgeGroup, BracketData>,
): LessonWeek {
  return { weekNumber, theme, brackets };
}

export const curriculumWeeks3Through8: Record<number, LessonWeek> = {
  3: week(3, "Volition & Needs", {
    "5-9": bracket(
      "8kBbNmd8i-s",
      "Learn English Kids",
      "What Do You Want To Drink?",
      "click-paint",
      clickPrompts([
        { id: "w3_59_r01", category: "review", text: "He ___ fast on the field.", target: "runs", options: ["run", "runs", "running"] },
        { id: "w3_59_r02", category: "review", text: "She ___ over the puddle.", target: "jumps", options: ["jump", "jumps", "jumping"] },
        { id: "w3_59_r03", category: "review", text: "The dog ___ in the lake.", target: "swims", options: ["swim", "swims", "swimming"] },
        { id: "w3_59_c01", category: "core", text: "Sophia ___ to make pancakes.", target: "wants", options: ["want", "wants", "wanting"] },
        { id: "w3_59_c02", category: "core", text: "She ___ three ingredients.", target: "needs", options: ["need", "needs", "needing"] },
        { id: "w3_59_c03", category: "core", text: "Mia ___ some water.", target: "wants", options: ["want", "wants", "wanting"] },
        { id: "w3_59_c04", category: "core", text: "He ___ a snack after swim.", target: "needs", options: ["need", "needs", "needing"] },
        { id: "w3_59_g01", category: "generative", text: "She wants juice, and he ___ bread.", target: "needs", options: ["need", "needs", "needing"] },
        { id: "w3_59_g02", category: "generative", text: "They ___ help, but they do not need more water.", target: "need", options: ["need", "needs", "needing"] },
        { id: "w3_59_g03", category: "generative", text: "I want fruit, and she ___ a napkin.", target: "needs", options: ["want", "wants", "needs"] },
      ]),
    ),
    "10-14": bracket(
      "VtL2XpvRaSA",
      "Interesting English",
      "Daily Routines | Present Simple for Kids",
      "click-paint",
      clickPrompts([
        { id: "w3_1014_r01", category: "review", text: "Miles ___ across the rooftop every morning.", target: "runs", options: ["run", "runs", "running"] },
        { id: "w3_1014_r02", category: "review", text: "Gwen ___ between the buildings with ease.", target: "jumps", options: ["jump", "jumps", "jumping"] },
        { id: "w3_1014_r03", category: "review", text: "The athlete ___ laps before breakfast.", target: "swims", options: ["swim", "swims", "swimming"] },
        { id: "w3_1014_c01", category: "core", text: "Sophia ___ flour for the recipe.", target: "needs", options: ["need", "needs", "needing"] },
        { id: "w3_1014_c02", category: "core", text: "He ___ water before the hike.", target: "needs", options: ["need", "needs", "needing"] },
        { id: "w3_1014_c03", category: "core", text: "They ___ pancakes for breakfast.", target: "want", options: ["want", "wants", "wanting"] },
        { id: "w3_1014_c04", category: "core", text: "She ___ help with the mixing bowl.", target: "needs", options: ["need", "needs", "needing"] },
        { id: "w3_1014_g01", category: "generative", text: "She needs flour, but she does not ___ eggs.", target: "need", options: ["need", "needs", "needing"] },
        { id: "w3_1014_g02", category: "generative", text: "He needs water, and she ___ help too.", target: "needs", options: ["need", "needs", "needing"] },
        { id: "w3_1014_g03", category: "generative", text: "They want the pancakes, but the pancakes ___ not ready yet.", target: "are", options: ["is", "are", "am"] },
      ]),
    ),
  }),

  4: week(4, "Location & Movement", {
    "5-9": bracket(
      "LjH_qtEeC6Y",
      "Rockin' English Lessons",
      "In, On, Under, Near - Prepositions Song",
      "click-paint",
      clickPrompts([
        { id: "w4_59_r01", category: "review", text: "Sophia ___ to make pancakes.", target: "wants", options: ["want", "wants", "wanting"] },
        { id: "w4_59_r02", category: "review", text: "She ___ three ingredients.", target: "needs", options: ["need", "needs", "needing"] },
        { id: "w4_59_r03", category: "review", text: "Mia ___ some water.", target: "wants", options: ["want", "wants", "wanting"] },
        { id: "w4_59_c01", category: "core", text: "Molly is ___ Manchester.", target: "in", options: ["in", "to", "on"] },
        { id: "w4_59_c02", category: "core", text: "They walked ___ the gallery.", target: "to", options: ["in", "to", "on"] },
        { id: "w4_59_c03", category: "core", text: "The café is ___ the high street.", target: "on", options: ["in", "to", "on"] },
        { id: "w4_59_c04", category: "core", text: "The cat is ___ the table.", target: "under", options: ["in", "under", "on"] },
        { id: "w4_59_g01", category: "generative", text: "We sit ___ the park, and birds sing near us.", target: "in", options: ["in", "on", "to"] },
        { id: "w4_59_g02", category: "generative", text: "She walks ___ school, then she waits on the steps.", target: "to", options: ["in", "to", "on"] },
        { id: "w4_59_g03", category: "generative", text: "The map is ___ the wall, not under the desk.", target: "on", options: ["in", "on", "under"] },
      ]),
    ),
    "10-14": bracket(
      "LjH_qtEeC6Y",
      "Rockin' English Lessons",
      "In, On, Under, Near - Prepositions Song",
      "click-paint",
      clickPrompts([
        { id: "w4_1014_r01", category: "review", text: "Sophia ___ flour for the recipe.", target: "needs", options: ["need", "needs", "needing"] },
        { id: "w4_1014_r02", category: "review", text: "He ___ water before the hike.", target: "needs", options: ["need", "needs", "needing"] },
        { id: "w4_1014_r03", category: "review", text: "They ___ pancakes for breakfast.", target: "want", options: ["want", "wants", "wanting"] },
        { id: "w4_1014_c01", category: "core", text: "The gallery is ___ Castlefield.", target: "in", options: ["in", "at", "to"] },
        { id: "w4_1014_c02", category: "core", text: "Molly arrived ___ the station.", target: "at", options: ["at", "to", "in"] },
        { id: "w4_1014_c03", category: "core", text: "They sat ___ the café window.", target: "near", options: ["in", "near", "on"] },
        { id: "w4_1014_c04", category: "core", text: "The sign is ___ the door.", target: "on", options: ["in", "on", "at"] },
        { id: "w4_1014_g01", category: "generative", text: "The gallery is in Manchester, which is ___ England.", target: "in", options: ["in", "at", "to"] },
        { id: "w4_1014_g02", category: "generative", text: "She is not at home; she is ___ the museum.", target: "at", options: ["at", "in", "to"] },
        { id: "w4_1014_g03", category: "generative", text: "They sat outside, even though it was cold ___ England.", target: "in", options: ["in", "on", "at"] },
      ]),
    ),
  }),

  5: week(5, "Possessions & Relationships", {
    "5-9": bracket(
      "euQWu0tQW14",
      "Rockin' English Lessons",
      "Possessive Pronouns Song - Mine and Yours",
      "click-paint",
      clickPrompts([
        { id: "w5_59_r01", category: "review", text: "Molly is ___ Manchester.", target: "in", options: ["in", "to", "on"] },
        { id: "w5_59_r02", category: "review", text: "The café is ___ the high street.", target: "on", options: ["in", "to", "on"] },
        { id: "w5_59_r03", category: "review", text: "The cat is ___ the table.", target: "under", options: ["in", "under", "on"] },
        { id: "w5_59_c01", category: "core", text: "Riley loves ___ family.", target: "her", options: ["my", "his", "her"] },
        { id: "w5_59_c02", category: "core", text: "___ name is Joy.", target: "His", options: ["My", "His", "Her"] },
        { id: "w5_59_c03", category: "core", text: "That is ___ basketball.", target: "my", options: ["my", "his", "her"] },
        { id: "w5_59_c04", category: "core", text: "Those are ___ shoes.", target: "their", options: ["our", "their", "my"] },
        { id: "w5_59_g01", category: "generative", text: "This is my book, and that is ___.", target: "yours", options: ["mine", "yours", "hers"] },
        { id: "w5_59_g02", category: "generative", text: "Her bag is pink, and ___ is blue.", target: "his", options: ["my", "his", "our"] },
        { id: "w5_59_g03", category: "generative", text: "Our tent is small, but ___ is huge.", target: "theirs", options: ["mine", "theirs", "yours"] },
      ]),
    ),
    "10-14": bracket(
      "CguX7RIWjjc",
      "Rockin' English Lessons",
      "Object Pronouns Song",
      "click-paint",
      clickPrompts([
        { id: "w5_1014_r01", category: "review", text: "The gallery is ___ Castlefield.", target: "in", options: ["in", "at", "to"] },
        { id: "w5_1014_r02", category: "review", text: "Molly arrived ___ the station.", target: "at", options: ["at", "to", "in"] },
        { id: "w5_1014_r03", category: "review", text: "The sign is ___ the door.", target: "on", options: ["in", "on", "at"] },
        { id: "w5_1014_c01", category: "core", text: "Riley's emotions are ___ alone.", target: "hers", options: ["her", "hers", "their"] },
        { id: "w5_1014_c02", category: "core", text: "His name is Joy, but ___ name is Anxiety.", target: "her", options: ["his", "her", "their"] },
        { id: "w5_1014_c03", category: "core", text: "The coach helped ___ after the race.", target: "us", options: ["we", "us", "our"] },
        { id: "w5_1014_c04", category: "core", text: "She gave the medal to ___.", target: "him", options: ["he", "him", "his"] },
        { id: "w5_1014_g01", category: "generative", text: "The memories belong to her, not to ___.", target: "them", options: ["they", "them", "their"] },
        { id: "w5_1014_g02", category: "generative", text: "He does not ignore us; he listens to ___.", target: "us", options: ["we", "us", "our"] },
        { id: "w5_1014_g03", category: "generative", text: "She trusts them, and they trust ___.", target: "her", options: ["she", "her", "hers"] },
      ]),
    ),
  }),

  6: week(6, "Describing the World", {
    "5-9": bracket(
      "kVTjug9uaP4",
      "English Tree TV",
      "The Adjectives Song for Children",
      "click-paint",
      clickPrompts([
        { id: "w6_59_r01", category: "review", text: "Riley loves ___ family.", target: "her", options: ["my", "his", "her"] },
        { id: "w6_59_r02", category: "review", text: "___ name is Joy.", target: "His", options: ["My", "His", "Her"] },
        { id: "w6_59_r03", category: "review", text: "That is ___ basketball.", target: "my", options: ["my", "his", "her"] },
        { id: "w6_59_c01", category: "core", text: "The ocean is ___ and blue.", target: "big", options: ["big", "blue", "run"] },
        { id: "w6_59_c02", category: "core", text: "Moana is ___.", target: "brave", options: ["brave", "boat", "water"] },
        { id: "w6_59_c03", category: "core", text: "The island is ___.", target: "beautiful", options: ["beautiful", "fast", "swim"] },
        { id: "w6_59_c04", category: "core", text: "The wave is very ___.", target: "tall", options: ["tall", "jump", "paint"] },
        { id: "w6_59_g01", category: "generative", text: "The boat is small, but the ocean is ___.", target: "big", options: ["big", "small", "brave"] },
        { id: "w6_59_g02", category: "generative", text: "She is brave, and the journey is ___.", target: "long", options: ["long", "brave", "blue"] },
        { id: "w6_59_g03", category: "generative", text: "The sky is blue, and the sand is ___.", target: "warm", options: ["warm", "tall", "brave"] },
      ]),
    ),
    "10-14": bracket(
      "46_M9mS71R8",
      "Oxford Online English",
      "Order of Adjectives - English Grammar Lesson",
      "click-paint",
      clickPrompts([
        { id: "w6_1014_r01", category: "review", text: "Riley's emotions are ___ alone.", target: "hers", options: ["her", "hers", "their"] },
        { id: "w6_1014_r02", category: "review", text: "His name is Joy, but ___ name is Anxiety.", target: "her", options: ["his", "her", "their"] },
        { id: "w6_1014_r03", category: "review", text: "The memories belong to her, not to ___.", target: "them", options: ["they", "them", "their"] },
        { id: "w6_1014_c01", category: "core", text: "She is a ___ green young witch.", target: "powerful", options: ["powerful", "green", "young"] },
        { id: "w6_1014_c02", category: "core", text: "It is a ___ old golden city.", target: "beautiful", options: ["beautiful", "old", "golden"] },
        { id: "w6_1014_c03", category: "core", text: "Elphaba wears a ___ black hat.", target: "big", options: ["big", "black", "hat"] },
        { id: "w6_1014_c04", category: "core", text: "They entered a ___ stone hallway.", target: "dark", options: ["dark", "stone", "hall"] },
        { id: "w6_1014_g01", category: "generative", text: "It is not a small town; it is a ___ modern city.", target: "large", options: ["large", "modern", "town"] },
        { id: "w6_1014_g02", category: "generative", text: "She does not wear a plain dress; she wears a ___ silk one.", target: "bright", options: ["bright", "silk", "plain"] },
        { id: "w6_1014_g03", category: "generative", text: "The path is narrow, but the gate is ___ and strong.", target: "wide", options: ["wide", "narrow", "strong"] },
      ]),
    ),
  }),

  7: week(7, "Time & Continuity", {
    "5-9": bracket(
      "Dl8g2pZ82ME",
      "ELF Kids Videos",
      "Present Continuous Verb Chant",
      "click-paint",
      clickPrompts([
        { id: "w7_59_r01", category: "review", text: "The ocean is ___ and blue.", target: "big", options: ["big", "blue", "run"] },
        { id: "w7_59_r02", category: "review", text: "Moana is ___.", target: "brave", options: ["brave", "boat", "water"] },
        { id: "w7_59_r03", category: "review", text: "The island is ___.", target: "beautiful", options: ["beautiful", "fast", "swim"] },
        { id: "w7_59_c01", category: "core", text: "Asha is ___ her phone.", target: "checking", options: ["check", "checks", "checking"] },
        { id: "w7_59_c02", category: "core", text: "She is ___ at the video.", target: "laughing", options: ["laugh", "laughs", "laughing"] },
        { id: "w7_59_c03", category: "core", text: "They are ___ about technology.", target: "talking", options: ["talk", "talks", "talking"] },
        { id: "w7_59_c04", category: "core", text: "He is ___ a picture now.", target: "drawing", options: ["draw", "draws", "drawing"] },
        { id: "w7_59_g01", category: "generative", text: "She is laughing, and they are ___.", target: "clapping", options: ["clap", "claps", "clapping"] },
        { id: "w7_59_g02", category: "generative", text: "He is not sleeping; he is ___.", target: "running", options: ["run", "runs", "running"] },
        { id: "w7_59_g03", category: "generative", text: "They are talking, and I am ___.", target: "listening", options: ["listen", "listens", "listening"] },
      ]),
    ),
    "10-14": bracket(
      "Q5UEPSk9ipE",
      "Learn English with Alex",
      "Present Simple vs. Present Continuous",
      "click-paint",
      clickPrompts([
        { id: "w7_1014_r01", category: "review", text: "She is a ___ green young witch.", target: "powerful", options: ["powerful", "green", "young"] },
        { id: "w7_1014_r02", category: "review", text: "It is a ___ old golden city.", target: "beautiful", options: ["beautiful", "old", "golden"] },
        { id: "w7_1014_r03", category: "review", text: "Elphaba wears a ___ black hat.", target: "big", options: ["big", "black", "hat"] },
        { id: "w7_1014_c01", category: "core", text: "Asha checks her phone every hour. Right now, she ___ checking it again.", target: "is checking", options: ["checks", "check", "is checking"] },
        { id: "w7_1014_c02", category: "core", text: "She usually scrolls for fun, but today she ___ about a serious problem.", target: "is talking", options: ["talks", "talk", "is talking"] },
        { id: "w7_1014_c03", category: "core", text: "They play soccer on Fridays. Today they ___ in the rain.", target: "are playing", options: ["play", "plays", "are playing"] },
        { id: "w7_1014_c04", category: "core", text: "He reads every night. Look — he ___ now.", target: "is reading", options: ["reads", "read", "is reading"] },
        { id: "w7_1014_g01", category: "generative", text: "He does not usually scroll, but he ___ right now.", target: "is scrolling", options: ["scrolls", "scroll", "is scrolling"] },
        { id: "w7_1014_g02", category: "generative", text: "She doesn't stop at home; she ___ to camp today.", target: "is walking", options: ["walks", "walk", "is walking"] },
        { id: "w7_1014_g03", category: "generative", text: "They do not swim alone, yet he ___ every Saturday.", target: "swims", options: ["swim", "swims", "is swimming"] },
      ]),
    ),
  }),

  8: week(8, "Capstone Storytelling", {
    "5-9": bracket(
      "cQfo0HJhCnE",
      "Illumination",
      "Migration - Official Trailer",
      "click-paint",
      clickPrompts([
        { id: "w8_59_r01", category: "review", text: "Asha is ___ her phone.", target: "checking", options: ["check", "checks", "checking"] },
        { id: "w8_59_r02", category: "review", text: "She is ___ at the video.", target: "laughing", options: ["laugh", "laughs", "laughing"] },
        { id: "w8_59_r03", category: "review", text: "They are ___ about technology.", target: "talking", options: ["talk", "talks", "talking"] },
        { id: "w8_59_c01", category: "core", text: "___, the ducks live on the pond.", target: "First", options: ["First", "Then", "Finally"] },
        { id: "w8_59_c02", category: "core", text: "___, they fly to New York.", target: "Then", options: ["First", "Then", "Finally"] },
        { id: "w8_59_c03", category: "core", text: "___, they rest on a rooftop.", target: "Next", options: ["First", "Next", "Finally"] },
        { id: "w8_59_c04", category: "core", text: "___, the family is together.", target: "Finally", options: ["First", "Then", "Finally"] },
        { id: "w8_59_g01", category: "generative", text: "First they pack, then they ___, and finally they arrive.", target: "fly", options: ["fly", "flies", "flying"] },
        { id: "w8_59_g02", category: "generative", text: "They are tired, but they keep ___.", target: "moving", options: ["move", "moves", "moving"] },
        { id: "w8_59_g03", category: "generative", text: "The journey is long, and the family ___ together.", target: "stays", options: ["stay", "stays", "staying"] },
      ]),
    ),
    "10-14": bracket(
      "OsW5sV3GMDM",
      "BBC Learning English",
      "Present Simple and Present Continuous: Grammar Gameshow",
      "click-paint",
      clickPrompts([
        { id: "w8_1014_r01", category: "review", text: "Asha checks her phone. Right now, she ___ checking it.", target: "is checking", options: ["checks", "check", "is checking"] },
        { id: "w8_1014_r02", category: "review", text: "She usually scrolls for fun, but today she ___ about a serious problem.", target: "is talking", options: ["talks", "talk", "is talking"] },
        { id: "w8_1014_r03", category: "review", text: "They play soccer on Fridays. Today they ___ in the rain.", target: "are playing", options: ["play", "plays", "are playing"] },
        { id: "w8_1014_c01", category: "core", text: "Moana leaves ___ her ancestors are calling her.", target: "because", options: ["because", "although", "so that"] },
        { id: "w8_1014_c02", category: "core", text: "___ the ocean is dangerous, she sails anyway.", target: "Although", options: ["Because", "Although", "So that"] },
        { id: "w8_1014_c03", category: "core", text: "First she gathers a crew; ___ they set sail.", target: "then", options: ["because", "then", "although"] },
        { id: "w8_1014_c04", category: "core", text: "She trains hard ___ she can protect the island.", target: "so that", options: ["because", "although", "so that"] },
        { id: "w8_1014_g01", category: "generative", text: "She does not stay home, ___ the voyage is risky.", target: "although", options: ["because", "although", "so that"] },
        { id: "w8_1014_g02", category: "generative", text: "They practice daily, and she ___ stronger each week.", target: "grows", options: ["grow", "grows", "growing"] },
        { id: "w8_1014_g03", category: "generative", text: "First she listens, then she leads, ___ everyone feels safe.", target: "so that", options: ["because", "although", "so that"] },
      ]),
    ),
  }),
};
