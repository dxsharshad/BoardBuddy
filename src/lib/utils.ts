import type { L, Lang } from '../types';

export const tx = (l: L | undefined, lang: Lang): string => (l ? (lang === 'hi' && l.hi ? l.hi : l.en) : '');

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/** Local-date key YYYY-MM-DD (not UTC, so the streak rolls over at the student's midnight). */
export function dateKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + n));
}

export const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));

export function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');
