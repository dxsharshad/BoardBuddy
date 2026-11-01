import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppState, QuizResult, Task } from '../types';
import { addDays, dateKey, uid } from './utils';

const KEY = 'boardbuddy:v1';

const defaults = (): AppState => ({
  lang: 'en',
  theme: typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  name: '',
  dailyGoalMin: 60,
  completed: {},
  bookmarks: [],
  quizHistory: [],
  wrongIds: [],
  cardStatus: {},
  tasks: [],
  minutesByDate: {},
});

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return { ...defaults(), ...JSON.parse(raw) };
  } catch {
    return defaults(); // corrupted storage should never crash the app
  }
}

interface Ctx {
  s: AppState;
  setLang: (l: AppState['lang']) => void;
  setTheme: (t: AppState['theme']) => void;
  setName: (n: string) => void;
  setGoal: (m: number) => void;
  toggleComplete: (chapterId: string) => void;
  toggleBookmark: (key: string) => void;
  isBookmarked: (key: string) => boolean;
  addQuizResult: (r: Omit<QuizResult, 'id' | 'date'>, wrong: string[], right: string[]) => void;
  setCardStatus: (id: string, st: 'known' | 'revise' | null) => void;
  addTask: (t: Omit<Task, 'id' | 'done'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  logMinutes: (m: number) => void;
  setLastChapter: (id: string) => void;
  resetAll: () => void;
  streak: number;
  todayMinutes: number;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<AppState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* storage full or blocked: keep working in memory */
    }
  }, [s]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', s.theme === 'dark');
    document.documentElement.lang = s.lang === 'hi' ? 'hi' : 'en';
  }, [s.theme, s.lang]);

  const addMinutes = (st: AppState, m: number): AppState => {
    if (m <= 0) return st;
    const k = dateKey();
    return { ...st, minutesByDate: { ...st.minutesByDate, [k]: (st.minutesByDate[k] ?? 0) + m } };
  };

  const logMinutes = useCallback((m: number) => setS((st) => addMinutes(st, m)), []);

  const value = useMemo<Ctx>(() => {
    const today = dateKey();
    const todayMinutes = s.minutesByDate[today] ?? 0;

    // Streak: consecutive days with any study minutes, ending today (or yesterday if today has none yet).
    let streak = 0;
    let cursor = todayMinutes > 0 ? today : addDays(today, -1);
    while ((s.minutesByDate[cursor] ?? 0) > 0) {
      streak++;
      cursor = addDays(cursor, -1);
    }

    return {
      s,
      streak,
      todayMinutes,
      setLang: (lang) => setS((st) => ({ ...st, lang })),
      setTheme: (theme) => setS((st) => ({ ...st, theme })),
      setName: (name) => setS((st) => ({ ...st, name: name.slice(0, 30) })),
      setGoal: (m) => setS((st) => ({ ...st, dailyGoalMin: Math.min(600, Math.max(10, m)) })),
      toggleComplete: (id) =>
        setS((st) => {
          const completed = { ...st.completed };
          if (completed[id]) delete completed[id];
          else completed[id] = true;
          return completed[id] ? addMinutes({ ...st, completed }, 10) : { ...st, completed };
        }),
      toggleBookmark: (key) =>
        setS((st) => ({
          ...st,
          bookmarks: st.bookmarks.includes(key) ? st.bookmarks.filter((b) => b !== key) : [...st.bookmarks, key],
        })),
      isBookmarked: (key) => s.bookmarks.includes(key),
      addQuizResult: (r, wrong, right) =>
        setS((st) => {
          const result: QuizResult = { ...r, id: uid(), date: new Date().toISOString() };
          const wrongIds = [...new Set([...st.wrongIds.filter((id) => !right.includes(id)), ...wrong])];
          return addMinutes(
            { ...st, quizHistory: [result, ...st.quizHistory].slice(0, 200), wrongIds },
            Math.max(1, Math.round(r.seconds / 60)),
          );
        }),
      setCardStatus: (id, status) =>
        setS((st) => {
          const cardStatus = { ...st.cardStatus };
          if (status) cardStatus[id] = status;
          else delete cardStatus[id];
          return { ...st, cardStatus };
        }),
      addTask: (t) => setS((st) => ({ ...st, tasks: [...st.tasks, { ...t, id: uid(), done: false }] })),
      toggleTask: (id) =>
        setS((st) => {
          const task = st.tasks.find((t) => t.id === id);
          if (!task) return st;
          const done = !task.done;
          const next = { ...st, tasks: st.tasks.map((t) => (t.id === id ? { ...t, done } : t)) };
          return done ? addMinutes(next, task.minutes) : next;
        }),
      deleteTask: (id) => setS((st) => ({ ...st, tasks: st.tasks.filter((t) => t.id !== id) })),
      logMinutes,
      setLastChapter: (id) => setS((st) => (st.lastChapter === id ? st : { ...st, lastChapter: id })),
      resetAll: () => {
        const keep = { lang: s.lang, theme: s.theme };
        setS({ ...defaults(), ...keep });
      },
    };
  }, [s, logMinutes]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore must be used inside StoreProvider');
  return c;
}
