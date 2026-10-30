import type { Chapter, Flashcard, L, MCQ } from '../types';

export const l = (en: string, hi?: string): L => ({ en, hi });

/** MCQ helper. `opts` are plain strings (same in both languages) unless you pass L objects. */
export function mcq(id: string, q: L | string, opts: (L | string)[], answer: number, explain: L | string): MCQ {
  const toL = (x: L | string): L => (typeof x === 'string' ? { en: x } : x);
  return { id, q: toL(q), options: opts.map(toL), answer, explain: toL(explain) };
}

export function card(id: string, q: L | string, a: L | string): Flashcard {
  const toL = (x: L | string): L => (typeof x === 'string' ? { en: x } : x);
  return { id, q: toL(q), a: toL(a) };
}

type ChapterInput = Omit<Chapter, 'status'> & { status?: Chapter['status'] };
/** Every chapter defaults to 'sample' until you verify it against the official BSEB textbook and change it to 'verified'. */
export const chapter = (c: ChapterInput): Chapter => ({ status: 'sample', ...c });
