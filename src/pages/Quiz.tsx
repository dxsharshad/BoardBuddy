import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import { allMcqs, chapterById, subjectById } from '../data/subjects';
import { Empty, Page } from '../components/ui';
import { cx, fmtTime, pct, shuffle, tx } from '../lib/utils';

type Q = (typeof allMcqs)[number] & { order: number[] };

const prepare = (pool: (typeof allMcqs)[number][], count: number): Q[] =>
  shuffle(pool)
    .slice(0, count)
    .map((q) => ({ ...q, order: shuffle(q.options.map((_, i) => i)) }));

export default function Quiz() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { s, addQuizResult } = useStore();
  const L = s.lang;

  const chapterId = params.get('chapter');
  const subjectId = params.get('subject');
  const retry = params.get('retry') === '1';

  const { pool, scope, label } = useMemo(() => {
    if (retry) return { pool: allMcqs.filter((q) => s.wrongIds.includes(q.id)), scope: 'retry', label: t('reviseWrong', L) };
    if (chapterId) {
      const c = chapterById(chapterId);
      return { pool: allMcqs.filter((q) => q.chapterId === chapterId), scope: chapterId, label: c ? tx(c.title, L) : '' };
    }
    if (subjectId) {
      const sub = subjectById(subjectId);
      return { pool: allMcqs.filter((q) => q.subjectId === subjectId), scope: subjectId, label: sub ? `${tx(sub.name, L)} – ${t('subjectTest', L)}` : '' };
    }
    return { pool: [], scope: '', label: '' };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, subjectId, retry, L]);

  const [phase, setPhase] = useState<'setup' | 'run' | 'result'>('setup');
  const [count, setCount] = useState(10);
  const [useTimer, setUseTimer] = useState(false);
  const [qs, setQs] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({}); // original option index
  const [elapsed, setElapsed] = useState(0);
  const saved = useRef(false);

  const total = qs.length;
  const limit = total * 60;

  useEffect(() => {
    if (phase !== 'run') return;
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  const finish = (finalAnswers = answers) => {
    if (saved.current) return;
    saved.current = true;
    const right = qs.filter((q) => finalAnswers[q.id] === q.answer).map((q) => q.id);
    const wrong = qs.filter((q) => finalAnswers[q.id] !== q.answer).map((q) => q.id);
    addQuizResult({ scope, label, total: qs.length, correct: right.length, seconds: elapsed }, wrong, right);
    setPhase('result');
  };

  useEffect(() => {
    if (phase === 'run' && useTimer && elapsed >= limit) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, phase]);

  const start = (questions: Q[]) => {
    saved.current = false;
    setQs(questions);
    setIdx(0);
    setAnswers({});
    setElapsed(0);
    setPhase('run');
  };

  if (!scope) {
    return <Empty icon="📝" text={t('empty', L)} action={<Link to="/practice" className="btn-primary">{t('practice', L)}</Link>} />;
  }
  if (pool.length === 0) {
    return (
      <Page title={label} back={() => nav('/practice')}>
        <Empty icon={retry ? '🎉' : '📭'} text={retry ? t('noWrong', L) : t('empty', L)} />
      </Page>
    );
  }

  // ---------- Setup ----------
  if (phase === 'setup') {
    const max = pool.length;
    return (
      <Page title={label} back={() => nav(-1)}>
        <div className="card space-y-4">
          <div>
            <label htmlFor="cnt" className="font-semibold block mb-1">{t('questions', L)}: {Math.min(count, max)} / {max}</label>
            <input id="cnt" type="range" min={1} max={max} value={Math.min(count, max)} onChange={(e) => setCount(Number(e.target.value))} className="w-full" />
          </div>
          <label className="flex items-center gap-3 min-h-[44px]">
            <input type="checkbox" className="w-5 h-5" checked={useTimer} onChange={(e) => setUseTimer(e.target.checked)} />
            <span>⏱ {t('timer', L)} (1 {t('minutes', L)} / {t('questions', L).toLowerCase()})</span>
          </label>
          <button className="btn-primary w-full" onClick={() => start(prepare(pool, Math.min(count, max)))}>{t('start', L)}</button>
        </div>
      </Page>
    );
  }

  // ---------- Result ----------
  if (phase === 'result') {
    const right = qs.filter((q) => answers[q.id] === q.answer).length;
    const wrongQs = qs.filter((q) => answers[q.id] !== q.answer);
    const timedOut = useTimer && elapsed >= limit;
    return (
      <Page title={label}>
        <div className="card text-center space-y-1">
          {timedOut && <p className="font-semibold text-red-600">{t('timeUp', L)}</p>}
          <p className="text-5xl font-extrabold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">{pct(right, total)}%</p>
          <p>{t('score', L)}: {right}/{total} · ✅ {right} · ❌ {total - right}</p>
          <p className="muted">⏱ {fmtTime(elapsed)}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {wrongQs.length > 0 && (
            <button className="btn-primary" onClick={() => start(prepare(wrongQs, wrongQs.length))}>{t('retryWrong', L)}</button>
          )}
          <button className="btn-ghost" onClick={() => setPhase('setup')}>{t('start', L)} ↻</button>
        </div>
        <ul className="space-y-3">
          {qs.map((q, i) => {
            const ok = answers[q.id] === q.answer;
            return (
              <li key={q.id} className={cx('card border-l-4', ok ? 'border-l-green-500' : 'border-l-red-500')}>
                <p className="font-semibold">{i + 1}. {tx(q.q, L)}</p>
                <p className="text-sm mt-1">
                  {ok ? '✅' : '❌'} {answers[q.id] === undefined ? '—' : tx(q.options[answers[q.id]], L)}
                </p>
                {!ok && <p className="text-sm text-green-700 dark:text-green-400">✔ {tx(q.options[q.answer], L)}</p>}
                <p className="text-sm muted mt-1">{t('explanation', L)}: {tx(q.explain, L)}</p>
              </li>
            );
          })}
        </ul>
        <Link to="/practice" className="btn-ghost w-full">{t('practice', L)}</Link>
      </Page>
    );
  }

  // ---------- Running ----------
  const q = qs[idx];
  const picked = answers[q.id];
  const answered = picked !== undefined;
  const remaining = Math.max(0, limit - elapsed);

  return (
    <Page title={label}>
      <div className="flex justify-between text-sm font-semibold">
        <span>{idx + 1} / {total}</span>
        <span>{useTimer ? `⏱ ${fmtTime(remaining)}` : `⏱ ${fmtTime(elapsed)}`}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="h-full bg-brand-600 transition-all" style={{ width: `${((idx + (answered ? 1 : 0)) / total) * 100}%` }} />
      </div>

      <div className="card space-y-3" key={q.id}>
        <p className="text-lg font-semibold">{tx(q.q, L)}</p>
        <div className="space-y-2" role="radiogroup">
          {q.order.map((orig) => {
            const isRight = orig === q.answer;
            const isPicked = picked === orig;
            return (
              <button
                key={orig}
                role="radio"
                aria-checked={isPicked}
                disabled={answered}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: orig }))}
                className={cx(
                  'w-full text-left rounded-xl border-2 px-4 py-3 min-h-[48px] transition',
                  !answered && 'border-slate-200 dark:border-slate-700 hover:border-brand-400',
                  answered && isRight && 'border-green-500 bg-green-50 dark:bg-green-950',
                  answered && isPicked && !isRight && 'border-red-500 bg-red-50 dark:bg-red-950',
                  answered && !isRight && !isPicked && 'border-slate-200 dark:border-slate-800 opacity-60',
                )}
              >
                {tx(q.options[orig], L)}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="rounded-xl bg-brand-50 dark:bg-slate-800 p-3 text-sm animate-fadeUp">
            <p className="font-semibold">{picked === q.answer ? '✅ ' + t('correct', L) : '❌ ' + t('wrong', L)}</p>
            <p>{t('explanation', L)}: {tx(q.explain, L)}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button className="btn-ghost flex-1" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}>{t('prev', L)}</button>
        {idx < total - 1 ? (
          <button className="btn-primary flex-1" onClick={() => setIdx((i) => i + 1)}>{t('next', L)}</button>
        ) : (
          <button className="btn-primary flex-1" onClick={() => finish()}>{t('finish', L)}</button>
        )}
      </div>
    </Page>
  );
}
