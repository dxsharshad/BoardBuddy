import type { AppState, Subject } from '../types';
import { pct } from './utils';

export function subjectProgress(sub: Subject, s: AppState) {
  const done = sub.chapters.filter((c) => s.completed[c.id]).length;
  return { done, total: sub.chapters.length, percent: pct(done, sub.chapters.length) };
}

export function overallProgress(subs: Subject[], s: AppState) {
  const total = subs.reduce((n, x) => n + x.chapters.length, 0);
  const done = subs.reduce((n, x) => n + x.chapters.filter((c) => s.completed[c.id]).length, 0);
  return { done, total, percent: pct(done, total) };
}

export function accuracyFor(scopePrefix: (scope: string) => boolean, s: AppState) {
  const rs = s.quizHistory.filter((r) => scopePrefix(r.scope));
  const total = rs.reduce((n, r) => n + r.total, 0);
  const correct = rs.reduce((n, r) => n + r.correct, 0);
  return { attempts: rs.length, percent: pct(correct, total) };
}

export function bestScore(scope: string, s: AppState): number | null {
  const rs = s.quizHistory.filter((r) => r.scope === scope);
  if (!rs.length) return null;
  return Math.max(...rs.map((r) => pct(r.correct, r.total)));
}
