import { useEffect, useRef, useState } from 'react';
import { useTr } from '../lib/useTr';
import { cx, fmtTime, pct } from '../lib/utils';
import { ErrorLine } from './common';

export interface RunQ { id: string; text: string; options: string[] }

interface Session { startedAt: number; answers: Record<string, number>; marked: string[]; idx: number }
const KEY = (k: string) => `boardbuddy:testsession:${k}`;
function loadSession(k: string): Session | null {
  try {
    const j = JSON.parse(localStorage.getItem(KEY(k)) || 'null') as Session | null;
    if (j && typeof j.startedAt === 'number' && typeof j.answers === 'object' && j.answers) return { startedAt: j.startedAt, answers: j.answers, marked: Array.isArray(j.marked) ? j.marked : [], idx: Number(j.idx) || 0 };
  } catch { /* ignore */ }
  return null;
}
const saveSession = (k: string, s: Session) => { try { localStorage.setItem(KEY(k), JSON.stringify(s)); } catch { /* ignore */ } };
export const clearSession = (k: string) => { try { localStorage.removeItem(KEY(k)); } catch { /* ignore */ } };

/**
 * Timed test screen: question palette, mark for review, clear answer, submit confirmation, auto-submit when time ends.
 * The session (start time, answers, marks) is saved on the device, so a reload or a phone call does not lose the test,
 * and the clock keeps running from the ORIGINAL start time (a refresh cannot be used to get extra time).
 * Duplicate submits are blocked.
 */
export default function TestRunner({ sessionKey, questions, durationSec, onSubmit }: {
  sessionKey: string; questions: RunQ[]; durationSec: number; onSubmit: (answers: Record<string, number>, elapsedSec: number) => Promise<void>;
}) {
  const { tr } = useTr();
  const [sess] = useState<Session>(() => {
    const old = loadSession(sessionKey);
    return old ?? { startedAt: Date.now(), answers: {}, marked: [], idx: 0 };
  });
  const [answers, setAnswers] = useState(sess.answers);
  const [marked, setMarked] = useState<string[]>(sess.marked);
  const [idx, setIdx] = useState(Math.min(sess.idx, Math.max(0, questions.length - 1)));
  const [now, setNow] = useState(Date.now());
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);
  const startedAt = sess.startedAt;

  useEffect(() => { saveSession(sessionKey, { startedAt, answers, marked, idx }); }, [sessionKey, startedAt, answers, marked, idx]);
  useEffect(() => { const iv = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(iv); }, []);

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const left = Math.max(0, durationSec - elapsed);

  const submit = async (auto = false) => {
    if (submittingRef.current) return; // duplicate-submit guard
    submittingRef.current = true; setSubmitting(true); setError(''); setConfirm(false);
    try {
      await onSubmit(answers, Math.min(elapsed, durationSec));
      clearSession(sessionKey);
    } catch (e) {
      submittingRef.current = false; setSubmitting(false);
      setError((e as Error).message || tr('Could not submit. Check your internet and try again.', 'सबमिट नहीं हुआ। इंटरनेट जाँचकर फिर कोशिश करें।'));
      if (auto) setConfirm(false);
    }
  };

  useEffect(() => {
    if (left === 0 && !submittingRef.current) submit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const q = questions[idx];
  if (!q) return null;
  const answered = questions.filter((x) => answers[x.id] !== undefined).length;
  const markedCount = questions.filter((x) => marked.includes(x.id)).length;
  const low = left <= 60;

  return (
    <div className="space-y-3">
      <div className="card flex items-center justify-between !py-3 sticky top-16 z-10">
        <span className="font-semibold">{idx + 1} / {questions.length}</span>
        <span className="text-sm muted">✅ {answered} · 🚩 {markedCount}</span>
        <span className={cx('font-mono font-bold text-lg', low && 'text-red-600')} role="timer" aria-label={tr('Time left', 'बचा समय')}>⏱ {fmtTime(left)}</span>
      </div>

      <div className="card space-y-3" key={q.id}>
        <p className="text-lg font-semibold whitespace-pre-wrap break-words">{q.text}</p>
        <div className="space-y-2" role="radiogroup" aria-label={tr('Options', 'विकल्प')}>
          {q.options.map((o, i) => {
            const on = answers[q.id] === i;
            return (
              <button key={i} role="radio" aria-checked={on} disabled={submitting}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                className={cx('w-full text-left rounded-xl border-2 px-4 py-3 min-h-[48px] transition break-words', on ? 'border-brand-600 bg-brand-50 dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 hover:border-brand-400')}>
                <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>{o}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost flex-1 !py-2 text-sm" disabled={answers[q.id] === undefined || submitting} onClick={() => setAnswers((a) => { const c = { ...a }; delete c[q.id]; return c; })}>↺ {tr('Clear', 'हटाएँ')}</button>
          <button className={cx('flex-1 !py-2 text-sm btn', marked.includes(q.id) ? 'bg-amber-500 text-white' : 'btn-ghost')} aria-pressed={marked.includes(q.id)} disabled={submitting}
            onClick={() => setMarked((m) => (m.includes(q.id) ? m.filter((x) => x !== q.id) : [...m, q.id]))}>🚩 {tr('Mark for review', 'रिव्यू के लिए चिह्नित')}</button>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn-ghost flex-1" disabled={idx === 0 || submitting} onClick={() => setIdx(idx - 1)}>{tr('Previous', 'पिछला')}</button>
        <button className="btn-ghost flex-1" disabled={idx >= questions.length - 1 || submitting} onClick={() => setIdx(idx + 1)}>{tr('Next', 'अगला')}</button>
      </div>

      <div className="card">
        <p className="text-sm font-semibold mb-2">{tr('Question palette', 'प्रश्न पैलेट')}</p>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {questions.map((x, i) => (
            <button key={x.id} onClick={() => setIdx(i)} aria-label={`${tr('Question', 'प्रश्न')} ${i + 1}`} aria-current={i === idx}
              className={cx('min-h-[40px] rounded-lg text-sm font-semibold border-2',
                i === idx && 'ring-2 ring-brand-500',
                marked.includes(x.id) ? 'bg-amber-400 border-amber-500 text-black' : answers[x.id] !== undefined ? 'bg-green-500 border-green-600 text-white' : 'bg-white/60 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700')}>
              {i + 1}
            </button>
          ))}
        </div>
        <p className="text-xs muted mt-2">🟩 {tr('answered', 'उत्तर दिया')} · 🟨 {tr('marked', 'चिह्नित')} · ⬜ {tr('not answered', 'बिना उत्तर')}</p>
      </div>

      <ErrorLine text={error} />
      {!confirm ? (
        <button className="btn-primary w-full" disabled={submitting} onClick={() => setConfirm(true)}>{submitting ? tr('Submitting…', 'सबमिट हो रहा है…') : error ? tr('Retry submit', 'फिर से सबमिट करें') : tr('Submit test', 'टेस्ट सबमिट करें')}</button>
      ) : (
        <div className="card space-y-2 border-brand-400" role="alertdialog" aria-label={tr('Confirm submit', 'सबमिट की पुष्टि')}>
          <p className="font-semibold">{tr('Submit now?', 'अभी सबमिट करें?')}</p>
          <p className="text-sm">{tr('Answered', 'उत्तर दिए')}: {answered} · {tr('Not answered', 'बिना उत्तर')}: {questions.length - answered} · {tr('Marked', 'चिह्नित')}: {markedCount}</p>
          <div className="grid grid-cols-2 gap-2"><button className="btn-ghost" onClick={() => setConfirm(false)}>{tr('Keep going', 'जारी रखें')}</button><button className="btn-primary" onClick={() => submit(false)}>{tr('Yes, submit', 'हाँ, सबमिट')}</button></div>
        </div>
      )}
    </div>
  );
}

export interface ResultItem { q: RunQ; picked: number | undefined; correct: number; explanation?: string }
export function ResultView({ items, stats, durationSec, note, onAgain, againLabel }: {
  items: ResultItem[]; stats: { correct: number; wrong: number; skipped: number; score: number; maxScore: number }; durationSec: number; note?: string; onAgain?: () => void; againLabel?: string;
}) {
  const { tr } = useTr();
  const [onlyWrong, setOnlyWrong] = useState(false);
  const attempted = stats.correct + stats.wrong;
  const shown = items.filter((x) => !onlyWrong || x.picked !== x.correct);
  return (
    <div className="space-y-3">
      <div className="card text-center space-y-1">
        <p className="text-5xl font-extrabold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">{stats.score} / {stats.maxScore}</p>
        <p>✅ {stats.correct} · ❌ {stats.wrong} · ➖ {stats.skipped}</p>
        <p className="muted">{tr('Accuracy', 'सटीकता')}: {pct(stats.correct, attempted)}% · ⏱ {fmtTime(durationSec)}</p>
        {note && <p className="text-xs muted">{note}</p>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className={onlyWrong ? 'btn-primary' : 'btn-ghost'} onClick={() => setOnlyWrong(!onlyWrong)}>🔁 {tr('Revise incorrect', 'गलत की समीक्षा')}</button>
        {onAgain && <button className="btn-ghost" onClick={onAgain}>↻ {againLabel ?? tr('Try again', 'फिर से')}</button>}
      </div>
      <ul className="space-y-3">
        {shown.map((x, i) => {
          const ok = x.picked === x.correct;
          return (
            <li key={x.q.id} className={cx('card border-l-4', ok ? 'border-l-green-500' : 'border-l-red-500')}>
              <p className="font-semibold break-words">{i + 1}. {x.q.text}</p>
              <p className="text-sm mt-1">{ok ? '✅' : x.picked === undefined ? '➖' : '❌'} {x.picked === undefined ? tr('Not answered', 'उत्तर नहीं दिया') : x.q.options[x.picked]}</p>
              {!ok && <p className="text-sm text-green-700 dark:text-green-400">✔ {x.q.options[x.correct]}</p>}
              {x.explanation && <p className="text-sm muted mt-1">💡 {x.explanation}</p>}
            </li>
          );
        })}
        {shown.length === 0 && <p className="muted text-center">🎉 {tr('Nothing to revise.', 'समीक्षा के लिए कुछ नहीं।')}</p>}
      </ul>
    </div>
  );
}
