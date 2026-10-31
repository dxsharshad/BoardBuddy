export type Lang = 'en' | 'hi';
/** Bilingual text. `hi` is optional; the UI falls back to `en`. */
export interface L { en: string; hi?: string }

export interface MCQ { id: string; q: L; options: L[]; answer: number; explain: L }
export interface Flashcard { id: string; q: L; a: L }
export interface Definition { term: L; meaning: L }
export interface Formula { name: L; expr: string }

export interface Chapter {
  id: string;
  subjectId: string;
  title: L;
  /** 'sample' = written by the app author as placeholder content; 'verified' = checked against official BSEB books/syllabus. */
  status: 'sample' | 'verified';
  notes: L[];
  definitions: Definition[];
  formulas: Formula[];
  keyPoints: L[];
  important: L[];
  mcqs: MCQ[];
  cards: Flashcard[];
}

export interface Subject {
  id: string;
  name: L;
  emoji: string;
  /** tailwind-friendly hex used for accents */
  color: string;
  chapters: Chapter[];
}

export interface PyqEntry {
  id: string;
  subjectId: string;
  year: number;
  title: string;
  /** URL or /pyq/file.pdf under public/. Leave empty if you don't have a verified file. */
  pdfUrl: string;
  answerKeyUrl?: string;
  /** Where you got it — keep this honest. */
  source: string;
  official: boolean;
}

export interface QuizResult {
  id: string;
  date: string; // ISO
  scope: string; // chapter id, subject id, or 'retry'
  label: string;
  total: number;
  correct: number;
  seconds: number;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  chapterId?: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  done: boolean;
}

export interface AppState {
  lang: Lang;
  theme: 'light' | 'dark';
  name: string;
  dailyGoalMin: number;
  completed: Record<string, true>;
  bookmarks: string[]; // "ch:<id>" | "card:<id>" | "q:<id>" | "f:<chapterId>:<index>"
  quizHistory: QuizResult[];
  wrongIds: string[]; // MCQ ids the student got wrong most recently
  cardStatus: Record<string, 'known' | 'revise'>;
  tasks: Task[];
  /** Tracked quiz/practice time; never includes planner-entered durations. */
  minutesByDate: Record<string, number>;
  /** Estimated foreground app-open time in seconds, stored by local calendar date. */
  appUsageSecondsByDate: Record<string, number>;
  lastChapter?: string;
}
