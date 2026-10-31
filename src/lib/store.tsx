import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  appUsageSecondsByDate: {},
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
  setLastChapter: (id: string) => void;
  resetAll: () => void;
  streak: number;
  todayMinutes: number;
  todayAppSeconds: number;
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

  // Estimate foreground app-open time. This is not proof of studying and pauses
  // whenever the document is hidden or the page is being unloaded.
  const lastVisibleTick = useRef<number | null>(null);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    lastVisibleTick.current = document.visibilityState === 'visible' ? Date.now() : null;

    const accrueUntil = (now: number) => {
      const last = lastVisibleTick.current;
      if (last === null || now <= last) return;
      let cursor = last;
      const increments: Record<string, number> = {};
      while (cursor < now) {
        const key = dateKey(new Date(cursor));
        const midnight = new Date(`${key}T00:00:00`);
        midnight.setDate(midnight.getDate() + 1);
        const end = Math.min(now, midnight.getTime());
        const seconds = Math.floor((end - cursor) / 1000);
        if (seconds > 0) increments[key] = (increments[key] ?? 0) + seconds;
        cursor = end;
      }
      lastVisibleTick.current = now;
      if (Object.keys(increments).length) {
        setS((st) => {
          const next = { ...st.appUsageSecondsByDate };
          for (const [key, seconds] of Object.entries(increments)) {
            next[key] = Math.max(0, (next[key] ?? 0) + seconds);
          }
          return { ...st, appUsageSecondsByDate: next };
        });
      }
    };

    const onVisibilityChange = () => {
      const now = Date.now();
      if (document.visibilityState === 'visible') {
        lastVisibleTick.current = now;
      } else {
        accrueUntil(now);
        lastVisibleTick.current = null;
      }
    };
    const onPageHide = () => {
      accrueUntil(Date.now());
      lastVisibleTick.current = null;
    };
    const onPageShow = () => {
      lastVisibleTick.current = document.visibilityState === 'visible' ? Date.now() : null;
    };
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') accrueUntil(Date.now());
    }, 5000);

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.clearInterval(timer);
      accrueUntil(Date.now());
      lastVisibleTick.current = null;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', s.theme === 'dark');
    document.documentElement.lang = s.lang === 'hi' ? 'hi' : 'en';
  }, [s.theme, s.lang]);

  const addMinutes = (st: AppState, m: number): AppState => {
    if (m <= 0) return st;
    const k = dateKey();
    return { ...st, minutesByDate: { ...st.minutesByDate, [k]: (st.minutesByDate[k] ?? 0) + m } };
  };

  const value = useMemo<Ctx>(() => {
    const today = dateKey();
    const todayMinutes = s.minutesByDate[today] ?? 0;
    const todayAppSeconds = s.appUsageSecondsByDate[today] ?? 0;

    // Streak: consecutive days with recorded quiz/practice minutes, ending today (or yesterday if today has none yet).
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
      todayAppSeconds,
      setLang: (lang) => setS((st) => ({ ...st, lang })),
      setTheme: (theme) => setS((st) => ({ ...st, theme })),
      setName: (name) => setS((st) => ({ ...st, name: name.slice(0, 30) })),
      setGoal: (m) => setS((st) => ({ ...st, dailyGoalMin: Math.min(600, Math.max(10, m)) })),
      toggleComplete: (id) =>
        setS((st) => {
          const completed = { ...st.completed };
          if (completed[id]) delete completed[id];
          else completed[id] = true;
          return { ...st, completed };
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
          return next;
        }),
      deleteTask: (id) => setS((st) => ({ ...st, tasks: st.tasks.filter((t) => t.id !== id) })),
      setLastChapter: (id) => setS((st) => (st.lastChapter === id ? st : { ...st, lastChapter: id })),
      resetAll: () => {
        const keep = { lang: s.lang, theme: s.theme };
        setS({ ...defaults(), ...keep });
      },
    };
  }, [s]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore must be used inside StoreProvider');
  return c;
}
