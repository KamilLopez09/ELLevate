export interface Prompt {
  id: string;
  text: string;
  target: string | string[];
  options: string[];
}

export interface BracketContent {
  videoSrc: string;
  channel: string;
  title: string;
  mode: "drag-match" | "click-paint";
  prompts: Prompt[];
}

export interface LessonWeek {
  weekNumber: number;
  theme: string;
  brackets: {
    "5-7": BracketContent;
    "8-10": BracketContent;
    "11-14": BracketContent;
  };
}

export const curriculum: Record<number, LessonWeek> = {
  1: {
    weekNumber: 1,
    theme: "Identity & Greetings",
    brackets: {
      "5-7": {
        videoSrc: "https://www.youtube.com/embed/61Qb05MuZ98",
        channel: "Quixot Kids Edu",
        title: "Greetings - How Are You Today? | How To Greet People For Kids",
        mode: "drag-match",
        prompts: [
          { id: "w1_57_1", text: "I", target: "I", options: ["I", "Apple", "Blue"] },
          { id: "w1_57_2", text: "He", target: "He", options: ["He", "Dog", "Red"] },
          { id: "w1_57_3", text: "She", target: "She", options: ["She", "Cat", "Run"] },
        ],
      },
      "8-10": {
        videoSrc: "https://www.youtube.com/embed/PZCcRzgrr8Y",
        channel: "Rockin' English Lessons",
        title: '"I Am, You Are, He/She Is" Song - Present Simple "To Be" Lesson',
        mode: "click-paint",
        prompts: [
          {
            id: "w1_810_1",
            text: "Molly is in Manchester.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_810_2",
            text: "She is happy to be here.",
            target: "is",
            options: ["am", "is", "are"],
          },
          {
            id: "w1_810_3",
            text: "They are at the gallery.",
            target: "are",
            options: ["am", "is", "are"],
          },
        ],
      },
      "11-14": {
        videoSrc: "https://www.youtube.com/embed/S5f1830XHm8",
        channel: "British Council LearnEnglish Teens",
        title: "A Weekend in Manchester",
        mode: "click-paint",
        prompts: [
          {
            id: "w1_1114_1",
            text: "Molly is not a tourist - she is visiting a friend.",
            target: "is not",
            options: ["is not", "are not", "am not"],
          },
          {
            id: "w1_1114_2",
            text: "She is from Durham, not Manchester.",
            target: "is",
            options: ["is", "are", "am"],
          },
          {
            id: "w1_1114_3",
            text: "Oliver and Jake are her friends. Jake is not British.",
            target: "are",
            options: ["is", "are", "am"],
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
        videoSrc: "https://www.youtube.com/embed/KKVDvv4jBCw",
        channel: "(ESL Kids animated channel)",
        title: "Action Verbs Song for Kids | Swim, Jump, Run",
        mode: "drag-match",
        prompts: [
          { id: "w2_57_1", text: "Run", target: "Run", options: ["Run", "Banana", "Happy"] },
          { id: "w2_57_2", text: "Jump", target: "Jump", options: ["Jump", "Table", "Sad"] },
          { id: "w2_57_3", text: "Paint", target: "Paint", options: ["Paint", "Chair", "Big"] },
        ],
      },
      "8-10": {
        videoSrc: "https://www.youtube.com/embed/shW9i6k8cB0",
        channel: "Sony Pictures Entertainment",
        title: "Spider-Man: Across the Spider-Verse - Official Trailer #2",
        mode: "click-paint",
        prompts: [
          {
            id: "w2_810_1",
            text: "Miles runs across the rooftop.",
            target: "runs",
            options: ["run", "runs", "running"],
          },
          {
            id: "w2_810_2",
            text: "Gwen jumps between buildings.",
            target: "jumps",
            options: ["jump", "jumps", "jumping"],
          },
          {
            id: "w2_810_3",
            text: "Spider-Man swings through the city.",
            target: "swings",
            options: ["swing", "swings", "swinging"],
          },
        ],
      },
      "11-14": {
        videoSrc: "https://www.youtube.com/embed/shW9i6k8cB0",
        channel: "Sony Pictures Entertainment",
        title: "Spider-Man: Across the Spider-Verse - Official Trailer #2",
        mode: "click-paint",
        prompts: [
          {
            id: "w2_1114_1",
            text: "Miles runs every day, but right now he is running from the Spider-Society.",
            target: "runs",
            options: ["run", "runs", "running"],
          },
          {
            id: "w2_1114_2",
            text: "Gwen doesn't stop - she keeps jumping.",
            target: "jumping",
            options: ["jump", "jumps", "jumping"],
          },
          {
            id: "w2_1114_3",
            text: "Spider-Man 2099 flies. Miles swings.",
            target: "swings",
            options: ["swing", "swings", "swinger"],
          },
        ],
      },
    },
  },
  3: {
    weekNumber: 3,
    theme: "Volition & Needs",
    brackets: {
      "5-7": {
        videoSrc: "https://www.youtube.com/embed/8kBbNmd8i-s",
        channel: "Learn English Kids",
        title: "What Do You Want To Drink? Song for Kids | Food Song | Learn English Kids",
        mode: "drag-match",
        prompts: [
          { id: "w3_57_1", text: "Water", target: "Water", options: ["Water", "Jump", "Green"] },
          { id: "w3_57_2", text: "Food", target: "Food", options: ["Food", "Run", "Yellow"] },
        ],
      },
      "8-10": {
        videoSrc: "https://www.youtube.com/embed/8kBbNmd8i-s",
        channel: "Learn English Kids",
        title: "What Do You Want To Drink? Song for Kids | Food Song | Learn English Kids",
        mode: "click-paint",
        prompts: [
          {
            id: "w3_810_1",
            text: "Sophia wants to make pancakes.",
            target: "wants",
            options: ["want", "wants", "wanting"],
          },
          {
            id: "w3_810_2",
            text: "She needs three ingredients.",
            target: "needs",
            options: ["need", "needs", "needing"],
          },
          {
            id: "w3_810_3",
            text: "Mia wants some water.",
            target: "wants",
            options: ["want", "wants", "wanting"],
          },
        ],
      },
      "11-14": {
        videoSrc: "https://www.youtube.com/embed/VtL2XpvRaSA",
        channel: "Interesting English",
        title: "Daily Routines | Present Simple for Kids | English Grammar",
        mode: "click-paint",
        prompts: [
          {
            id: "w3_1114_1",
            text: "Sophia needs flour, but she doesn't need eggs.",
            target: "needs",
            options: ["need", "needs", "needing"],
          },
          {
            id: "w3_1114_2",
            text: "He needs water. She needs help.",
            target: "needs",
            options: ["need", "needs", "needing"],
          },
          {
            id: "w3_1114_3",
            text: "They want the pancakes, but the pancakes are not ready yet.",
            target: "want",
            options: ["want", "wants", "wanting"],
          },
        ],
      },
    },
  },
  4: {
    weekNumber: 4,
    theme: "Location & Movement",
    brackets: {
      "5-7": {
        videoSrc: "https://www.youtube.com/embed/9bDbIgv5ruM",
        channel: "ELF Kids Videos",
        title: "On, In, Under | Prepositions Song for Kids",
        mode: "drag-match",
        prompts: [
          { id: "w4_57_1", text: "In", target: "In", options: ["In", "Apple", "Run"] },
          { id: "w4_57_2", text: "On", target: "On", options: ["On", "Banana", "Jump"] },
          { id: "w4_57_3", text: "Under", target: "Under", options: ["Under", "Chair", "Fly"] },
        ],
      },
      "8-10": {
        videoSrc: "https://www.youtube.com/embed/LjH_qtEeC6Y",
        channel: "Rockin' English Lessons",
        title: "In, On, Under, Near - Prepositions Song | Rockin' English",
        mode: "click-paint",
        prompts: [
          {
            id: "w4_810_1",
            text: "Molly is in Manchester.",
            target: "in",
            options: ["in", "to", "on"],
          },
          {
            id: "w4_810_2",
            text: "They walked to the gallery.",
            target: "to",
            options: ["in", "to", "on"],
          },
          {
            id: "w4_810_3",
            text: "The café is on the high street.",
            target: "on",
            options: ["in", "to", "on"],
          },
        ],
      },
      "11-14": {
        videoSrc: "https://www.youtube.com/embed/LjH_qtEeC6Y",
        channel: "Rockin' English Lessons",
        title: "In, On, Under, Near - Prepositions Song | Rockin' English",
        mode: "click-paint",
        prompts: [
          {
            id: "w4_1114_1",
            text: "The gallery is in Castlefield, which is in Manchester.",
            target: "in",
            options: ["in", "at", "to"],
          },
          {
            id: "w4_1114_2",
            text: "Molly arrived at the station and went to the café.",
            target: "at",
            options: ["at", "to", "in"],
          },
          {
            id: "w4_1114_3",
            text: "They sat outside, even though it was cold in England.",
            target: "in",
            options: ["in", "on", "at"],
          },
        ],
      },
    },
  },
  5: {
    weekNumber: 5,
    theme: "Possessions & Relationships",
    brackets: {
      "5-7": {
        videoSrc: "https://www.youtube.com/embed/F21sRCFLHSA",
        channel: "Rockin' English Lessons",
        title: 'Possessive Adjectives Song - "My Heart and Your Heart" | Rockin\' English',
        mode: "drag-match",
        prompts: [
          { id: "w5_57_1", text: "My", target: "My", options: ["My", "Go", "Big"] },
          { id: "w5_57_2", text: "Your", target: "Your", options: ["Your", "Stop", "Red"] },
        ],
      },
      "8-10": {
        videoSrc: "https://www.youtube.com/embed/euQWu0tQW14",
        channel: "Rockin' English Lessons",
        title: 'Possessive Pronouns Song - "Mine and Yours" | Rockin\' English',
        mode: "click-paint",
        prompts: [
          {
            id: "w5_810_1",
            text: "Riley loves her family.",
            target: "her",
            options: ["my", "his", "her"],
          },
          {
            id: "w5_810_2",
            text: "His name is Joy.",
            target: "His",
            options: ["My", "His", "Her"],
          },
          {
            id: "w5_810_3",
            text: "That is my basketball.",
            target: "my",
            options: ["my", "his", "her"],
          },
        ],
      },
      "11-14": {
        videoSrc: "https://www.youtube.com/embed/CguX7RIWjjc",
        channel: "Rockin' English Lessons",
        title: 'Object Pronouns Song - "I Am Me, You Are You" | Rockin\' English',
        mode: "click-paint",
        prompts: [
          {
            id: "w5_1114_1",
            text: "Riley's emotions are hers alone. No one can take them from her.",
            target: "hers",
            options: ["her", "hers", "their"],
          },
          {
            id: "w5_1114_2",
            text: "His name is Joy, but her name is Anxiety.",
            target: "her",
            options: ["his", "her", "their"],
          },
          {
            id: "w5_1114_3",
            text: "The memories belong to her, not to them.",
            target: "them",
            options: ["they", "them", "their"],
          },
        ],
      },
    },
  },
  6: {
    weekNumber: 6,
    theme: "Describing the World",
    brackets: {
      "5-7": {
        videoSrc: "https://www.youtube.com/embed/Qf19m0sff-4",
        channel: "Fun Kids English",
        title: "Adjectives and Opposites Song | Fun Kids English",
        mode: "drag-match",
        prompts: [
          { id: "w6_57_1", text: "Big", target: "Big", options: ["Big", "Run", "At"] },
          { id: "w6_57_2", text: "Red", target: "Red", options: ["Red", "Jump", "On"] },
        ],
      },
      "8-10": {
        videoSrc: "https://www.youtube.com/embed/kVTjug9uaP4",
        channel: "English Tree TV",
        title: "Rock Out To The Adjectives Song For Children! | English Grammar",
        mode: "click-paint",
        prompts: [
          {
            id: "w6_810_1",
            text: "The ocean is big and blue.",
            target: ["big", "blue"],
            options: ["big", "blue", "run", "jump"],
          },
          {
            id: "w6_810_2",
            text: "Moana is brave.",
            target: "brave",
            options: ["brave", "boat", "water"],
          },
          {
            id: "w6_810_3",
            text: "The island is beautiful.",
            target: "beautiful",
            options: ["beautiful", "fast", "swim"],
          },
        ],
      },
      "11-14": {
        videoSrc: "https://www.youtube.com/embed/46_M9mS71R8",
        channel: "Oxford Online English",
        title: "Order of Adjectives - English Grammar Lesson",
        mode: "click-paint",
        prompts: [
          {
            id: "w6_1114_1",
            text: "She is a powerful green young witch.",
            target: "powerful",
            options: ["powerful", "green", "young"],
          },
          {
            id: "w6_1114_2",
            text: "It is a beautiful old golden city.",
            target: "beautiful",
            options: ["beautiful", "old", "golden"],
          },
          {
            id: "w6_1114_3",
            text: "Elphaba wears a big black hat.",
            target: "big",
            options: ["big", "black", "hat"],
          },
        ],
      },
    },
  },
  7: {
    weekNumber: 7,
    theme: "Time & Continuity",
    brackets: {
      "5-7": {
        videoSrc: "https://www.youtube.com/embed/lPY9sYK5S5A",
        channel: "ESL Kids",
        title: "Present Continuous in English for Kids - What Are You Doing?",
        mode: "drag-match",
        prompts: [
          {
            id: "w7_57_1",
            text: "Running",
            target: "Running",
            options: ["Running", "Apple", "Table"],
          },
        ],
      },
      "8-10": {
        videoSrc: "https://www.youtube.com/embed/Dl8g2pZ82ME",
        channel: "ELF Kids Videos",
        title: "Present Continuous Verb Chant - What Are You Doing? | Pattern Practice",
        mode: "click-paint",
        prompts: [
          {
            id: "w7_810_1",
            text: "Asha is checking her phone.",
            target: "checking",
            options: ["check", "checks", "checking"],
          },
          {
            id: "w7_810_2",
            text: "She is laughing at the video.",
            target: "laughing",
            options: ["laugh", "laughs", "laughing"],
          },
          {
            id: "w7_810_3",
            text: "They are talking about technology.",
            target: "talking",
            options: ["talk", "talks", "talking"],
          },
        ],
      },
      "11-14": {
        videoSrc: "https://www.youtube.com/embed/Q5UEPSk9ipE",
        channel: "Learn English with Alex",
        title: "Present Simple vs. Present Continuous Tense | ESOL Lesson",
        mode: "click-paint",
        prompts: [
          {
            id: "w7_1114_1",
            text: "Asha checks her phone every hour. Right now, she is checking it again.",
            target: "is checking",
            options: ["checks", "check", "is checking"],
          },
          {
            id: "w7_1114_2",
            text: "She usually scrolls for fun, but today she is talking about a serious problem.",
            target: "is talking",
            options: ["talks", "talk", "is talking"],
          },
          {
            id: "w7_1114_3",
            text: "Normally he doesn't use social media, but he is using it now for a school project.",
            target: "is using",
            options: ["uses", "use", "is using"],
          },
        ],
      },
    },
  },
  8: {
    weekNumber: 8,
    theme: "Capstone Storytelling",
    brackets: {
      "5-7": {
        videoSrc: "https://www.youtube.com/embed/4AMptAmS_XM",
        channel: "Mind Blooming",
        title: "Sequence of Events | English For Kids | Mind Blooming",
        mode: "drag-match",
        prompts: [
          { id: "w8_57_1", text: "First", target: "First", options: ["First", "Red", "Cat"] },
          { id: "w8_57_2", text: "Then", target: "Then", options: ["Then", "Big", "Dog"] },
          { id: "w8_57_3", text: "Last", target: "Last", options: ["Last", "Blue", "Fish"] },
        ],
      },
      "8-10": {
        videoSrc: "https://www.youtube.com/embed/cQfo0HJhCnE",
        channel: "Illumination / Universal Pictures",
        title: "Migration - Official Trailer",
        mode: "click-paint",
        prompts: [
          {
            id: "w8_810_1",
            text: "First, the ducks live on the pond.",
            target: "First",
            options: ["First", "Then", "Finally"],
          },
          {
            id: "w8_810_2",
            text: "Then, they fly to New York.",
            target: "Then",
            options: ["First", "Then", "Finally"],
          },
          {
            id: "w8_810_3",
            text: "Finally, the family is together.",
            target: "Finally",
            options: ["First", "Then", "Finally"],
          },
        ],
      },
      "11-14": {
        videoSrc: "https://www.youtube.com/embed/OsW5sV3GMDM",
        channel: "BBC Learning English",
        title: "Present Simple and Present Continuous: The Grammar Gameshow Episode 1",
        mode: "click-paint",
        prompts: [
          {
            id: "w8_1114_1",
            text: "Moana leaves because her ancestors are calling her.",
            target: "because",
            options: ["because", "although", "so that"],
          },
          {
            id: "w8_1114_2",
            text: "Although the ocean is dangerous, she sails anyway.",
            target: "Although",
            options: ["Because", "Although", "So that"],
          },
          {
            id: "w8_1114_3",
            text: "First she gathers a crew, then they set sail, so that they can save the islands.",
            target: "so that",
            options: ["because", "although", "so that"],
          },
        ],
      },
    },
  },
};
